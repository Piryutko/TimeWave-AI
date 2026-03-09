using System.Text.Json;

namespace TimeWaveAI;

public class AiMeetingService
{
    private readonly HttpClient _httpClient;

    public AiMeetingService()
    {
        _httpClient = new HttpClient { BaseAddress = new Uri("http://localhost:11434") };
        _httpClient.Timeout = TimeSpan.FromMinutes(10); // Increased timeout for heavy LLMs
    }

    public async Task GenerateAndStreamRoadmapAsync(MeetingRequest request, HttpResponse response)
    {
        var prompt = $@"
You are an expert meeting facilitator AI. 
Generate a meeting roadmap for a {request.Duration}-minute meeting about: ""{request.Topic}"".
Key points/agenda to cover: ""{(string.IsNullOrWhiteSpace(request.KeyPoints) ? "None specified" : request.KeyPoints)}"".

CRITICAL INSTRUCTIONS:
1. Structure (TimeBoxes): Break down the exact key points provided into actionable time slots. DO NOT use generic titles like 'Введение', 'Обсуждение', or 'Итоги'. Translate the actual topic agenda into working stages.
2. Collaboration (EngagementMechanic): Invent a practical interactive activity explicitly designed for the specific topic and key points. DO NOT give generic advice like 'опрос по кругу' or 'попросите высказаться'. Embed the context of the topic into the mechanic.

You MUST respond in pure JSON format only, matching this structure exactly (ALL VALUES IN RUSSIAN):
{{
  ""Structure"": {{
    ""Manifesto"": ""Короткое, смелое заявление о ценности времени и границах для этой конкретной темы."",
    ""TimeBoxes"": [
      {{ ""Title"": ""[Специфичный практический этап из тезиса 1]"", ""DurationRange"": ""0-10 мин"" }},
      {{ ""Title"": ""[Специфичный практический этап из тезиса 2]"", ""DurationRange"": ""10-25 мин"" }}
    ]
  }},
  ""Intentionality"": {{
    ""Goal"": ""Одно четкое предложение, описывающее главную практическую цель."",
    ""KeyQuestions"": [
      {{ ""Text"": ""Узкоспециализированный вопрос 1 по конкретной теме"" }},
      {{ ""Text"": ""Узкоспециализированный вопрос 2 по конкретной теме"" }}
    ]
  }},
  ""Collaboration"": {{
    ""EngagementMechanic"": ""Уникальная механика взаимодействия, привязанная именно к контексту этой встречи и тезисов.""
  }},
  ""Inclusivity"": {{
    ""Advice"": ""Уникальный совет для фасилитатора, подходящий по духу к этой задаче.""
  }}
}}

The total time must sum up to exactly {request.Duration} minutes across the TimeBoxes.
Ensure the output is ONLY valid JSON.
";

        var requestPayload = new
        {
            model = "llama3.2",
            prompt = prompt,
            stream = false, // We'll stream the final object structure down to the client since Llama json generation stream is hard to parse partially
            format = "json"
        };

        var content = new StringContent(JsonSerializer.Serialize(requestPayload), System.Text.Encoding.UTF8, "application/json");

        try
        {
            // Send SSE message that we started generating
            Console.WriteLine($"[AiMeetingService] Starting generation for topic: {request.Topic}");
            await SendSseEventAsync(response, "status", "Генерация дорожной карты (может занять 1-2 минуты)...");

            Console.WriteLine($"[AiMeetingService] -> Sending request to Ollama (http://localhost:11434/api/generate)...");
            var ollamaResponse = await _httpClient.PostAsync("/api/generate", content);
            Console.WriteLine($"[AiMeetingService] <- Ollama responded: {ollamaResponse.StatusCode}");
            ollamaResponse.EnsureSuccessStatusCode();

            var responseBody = await ollamaResponse.Content.ReadAsStringAsync();
            var ollamaResult = JsonSerializer.Deserialize<JsonElement>(responseBody);
            var jsonString = ollamaResult.GetProperty("response").GetString();

            if (jsonString != null)
            {
                var options = new JsonSerializerOptions 
                { 
                    PropertyNameCaseInsensitive = true,
                    AllowTrailingCommas = true
                };
                
                var result = JsonSerializer.Deserialize<LlamaResponse>(jsonString, options);
                
                if (result != null)
                {
                    var outputJson = JsonSerializer.Serialize(result, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
                    Console.WriteLine("[AiMeetingService] Sending complete JSON (CamelCase) to client.");
                    await SendSseEventAsync(response, "complete", outputJson);
                }
                else
                {
                    Console.WriteLine("[AiMeetingService] Result was null after parsing.");
                    await SendSseEventAsync(response, "error", "Invalid JSON from AI.");
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[AiMeetingService] Error: {ex.Message}");
            await SendSseEventAsync(response, "error", $"Ошибка подключения к Ollama: {ex.Message}");
            
            // Fallback
            var dummy = new LlamaResponse(
                new MeetingStructure(
                    "Встреча имеет жесткие границы, мы ценим время.",
                    [
                        new TimeBox("Введение и контекст", "0-5 мин"),
                        new TimeBox("Основное обсуждение", $"5-{Math.Max(5, request.Duration - 5)} мин"),
                        new TimeBox("Итоги и следующие шаги", $"{Math.Max(5, request.Duration - 5)}-{request.Duration} мин")
                    ]
                ),
                new MeetingIntentionality(
                    $"Решить ключевые вопросы по теме: {request.Topic}",
                    [new MeetingQuestion("Что является главным препятствием?"), new MeetingQuestion("Кто отвечает за следующий шаг?")]
                ),
                new MeetingCollaboration("По кругу: попросите каждого участника сказать 1 предложение перед принятием решений."),
                new MeetingInclusivity("Обратите внимание на тихих участников и прямо спросите их мнение.")
            );
            
            await Task.Delay(2000);
            var fallbackJson = JsonSerializer.Serialize(dummy, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
            await SendSseEventAsync(response, "complete", fallbackJson);
        }
    }

    private static async Task SendSseEventAsync(HttpResponse response, string eventName, string data)
    {
        // Format for Server-Sent Events
        var sseMessage = $"event: {eventName}\ndata: {data}\n\n";
        await response.WriteAsync(sseMessage);
        await response.Body.FlushAsync();
    }
}
