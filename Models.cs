namespace TimeWaveAI;

public record LlamaResponse(
    MeetingStructure Structure,
    MeetingIntentionality Intentionality,
    MeetingCollaboration Collaboration,
    MeetingInclusivity Inclusivity
);

public record MeetingStructure(
    string Manifesto,
    List<TimeBox> TimeBoxes
);

public class TimeBox
{
    public string Title { get; set; } = string.Empty;
    public string DurationRange { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }

    public TimeBox() {} // For JSON deserializer
    public TimeBox(string title, string durationRange)
    {
        Title = title;
        DurationRange = durationRange;
    }
}

public record MeetingIntentionality(
    string Goal,
    List<MeetingQuestion> KeyQuestions
);

public class MeetingQuestion
{
    public string Text { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }

    public MeetingQuestion() {} // For JSON deserializer
    public MeetingQuestion(string text)
    {
        Text = text;
    }
}

public record MeetingCollaboration(
    string EngagementMechanic
);

public record MeetingInclusivity(
    string Advice
);

public record MeetingRequest(
    string Topic,
    string KeyPoints,
    int Duration
);
