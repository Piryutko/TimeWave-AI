using TimeWaveAI;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddCors();
builder.Services.AddSingleton<AiMeetingService>();

var app = builder.Build();

// Enable CORS for frontend
app.UseCors(policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());

// Map generating roadmap endpoint
app.MapPost("/api/generate-meeting", async (MeetingRequest request, AiMeetingService aiService, HttpContext ctx) =>
{
    // Configure SSE
    ctx.Response.Headers.Append("Content-Type", "text/event-stream");
    ctx.Response.Headers.Append("Cache-Control", "no-cache");
    ctx.Response.Headers.Append("Connection", "keep-alive");

    await aiService.GenerateAndStreamRoadmapAsync(request, ctx.Response);
});

app.Run("http://localhost:5000");
