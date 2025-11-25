# College Advisor Chatbot Architecture

## System Workflow Diagram

```mermaid
flowchart TD
    Start([User Opens Chat]) --> Auth{Authenticated?}
    Auth -->|No| Login[Redirect to Login]
    Auth -->|Yes| LoadHistory[Load Chat History from DB]
    LoadHistory --> Display[Display Chat Interface]
    
    Display --> UserInput[User Types Message]
    UserInput --> OptimisticUI[Show User Message Immediately]
    OptimisticUI --> SetFlag[Set newestMessageId Flag]
    SetFlag --> SendAPI[POST /api/chat/ask]
    
    SendAPI --> GetSession[Verify Session & Get User ID]
    GetSession --> CreateOrchestrator[Create OrchestratorAgent]
    CreateOrchestrator --> BuildContext[Build User Context]
    
    BuildContext --> FetchProfile[Fetch User Profile]
    BuildContext --> FetchHistory[Fetch Last 10 Messages for Context]
    
    FetchProfile --> ContextReady[Context Ready]
    FetchHistory --> ContextReady
    
    ContextReady --> ClassifyIntent{Classify Intent}
    
    ClassifyIntent -->|Crisis Keywords| CrisisCheck{Crisis Detection}
    CrisisCheck -->|Crisis Detected| CrisisResponse[WellnessAgent: Crisis Response]
    
    CrisisResponse --> CrisisResources[Provide Immediate Resources: 988 Lifeline, Crisis Text Line, Campus Counseling]
    
    ClassifyIntent -->|Academic Keywords| AcademicAgent[AcademicAgent]
    ClassifyIntent -->|Wellness Keywords| WellnessAgent[WellnessAgent]
    ClassifyIntent -->|Campus Keywords| CampusAgent[CampusLifeAgent]
    ClassifyIntent -->|General| GeneralAgent[General Handler]
    
    AcademicAgent --> BuildPrompt1[Build Context Prompt with User Profile and History]
    WellnessAgent --> StressDetect{Detect Stress Level}
    CampusAgent --> BuildPrompt3[Build Context Prompt]
    
    StressDetect -->|High Keywords| UpdateStress1[Update Profile Stress Level to 8]
    StressDetect -->|Medium Keywords| UpdateStress2[Update Profile Stress Level to 6]
    StressDetect -->|Low Keywords| UpdateStress3[Update Profile Stress Level to 4]
    StressDetect -->|None| BuildPrompt2[Build Context Prompt]
    
    UpdateStress1 --> BuildPrompt2
    UpdateStress2 --> BuildPrompt2
    UpdateStress3 --> BuildPrompt2
    
    BuildPrompt1 --> LMStudio[Call LM Studio API]
    BuildPrompt2 --> LMStudio
    BuildPrompt3 --> LMStudio
    GeneralAgent --> LMStudio
    
    LMStudio --> MistralModel[Mistral-7B-Instruct v0.3 Local Model]
    MistralModel --> GenerateResponse[Generate Response with max 1024 tokens]
    
    GenerateResponse --> CombineContext[Combine System Prompt, User Context, and User Message]
    
    CombineContext --> AIResponse[AI Response Generated]
    CrisisResources --> SaveMessages
    
    AIResponse --> SaveMessages[Save to Database: User Message and Assistant Message]
    
    SaveMessages --> SaveUserMsg[(INSERT INTO messages with user role)]
    SaveMessages --> SaveAIMsg[(INSERT INTO messages with assistant role)]
    
    SaveUserMsg --> CheckAdvice{Generate Advice Log?}
    SaveAIMsg --> CheckAdvice
    
    CheckAdvice -->|Important Advice| SaveAdvice[(INSERT INTO advice_logs)]
    CheckAdvice -->|Regular Chat| ReturnResponse
    SaveAdvice --> ReturnResponse
    
    ReturnResponse[Return Response to Frontend]
    ReturnResponse --> ReloadHistory[Reload Chat History from Database]
    
    ReloadHistory --> ReverseOrder[Reverse Messages to Chronological Order]
    ReverseOrder --> FormatMessages[Format Messages with metadata]
    
    FormatMessages --> TypewriterCheck{isNew flag true?}
    TypewriterCheck -->|Yes| Typewriter[Apply Typewriter Effect at 20ms per character]
    TypewriterCheck -->|No| InstantShow[Show Message Instantly]
    
    Typewriter --> DisplayMessages[Display All Messages]
    InstantShow --> DisplayMessages
    
    DisplayMessages --> ClearFlag[Clear newestMessageId Flag after 100ms]
    ClearFlag --> AutoScroll[Auto-scroll to Bottom]
    AutoScroll --> Ready[Ready for Next Message]
    
    Ready --> UserInput

    style Start fill:#4CAF50
    style CrisisResponse fill:#f44336
    style CrisisResources fill:#ff9800
    style LMStudio fill:#2196F3
    style MistralModel fill:#9C27B0
    style SaveMessages fill:#FF5722
    style Typewriter fill:#00BCD4
    style Ready fill:#4CAF50
```

## Data Flow: User Profile & Context

```mermaid
flowchart LR
    User[(User Table)] -->|1:1| Profile[(UserProfile Table)]
    Profile --> Major[Major]
    Profile --> Year[Year: Freshman/Sophomore/Junior/Senior]
    Profile --> Interests[Interests: comma-separated]
    Profile --> Stress[Stress Level: 0-10 string]
    Profile --> Goals[Goals: text]
    
    User -->|1:N| Messages[(Messages Table)]
    Messages --> Role[role: user/assistant]
    Messages --> Content[content: text]
    Messages --> Intent[intent: academic/wellness/campus_life]
    Messages --> Agent[agentType: string]
    Messages --> Metadata[metadata: JSON]
    
    User -->|1:N| Advice[(AdviceLogs Table)]
    Advice --> Category[category: string]
    Advice --> Title[title: string]
    Advice --> Priority[priority: high/medium/low]
    Advice --> Status[status: active/completed]
    
    style User fill:#4CAF50
    style Profile fill:#2196F3
    style Messages fill:#FF5722
    style Advice fill:#9C27B0
```

## Multi-Agent System Architecture

```mermaid
flowchart TD
    Orchestrator[OrchestratorAgent<br/>Main Controller]
    
    Orchestrator --> Intent{Intent Classification}
    
    Intent -->|study, exam, course, GPA| Academic[AcademicAgent: Study Tips and Time Management]
    
    Intent -->|stress, anxiety, mental health| Wellness[WellnessAgent: Emotional Support and Stress Management]
    
    Intent -->|clubs, housing, events| Campus[CampusLifeAgent: Social Life and Organizations]
    
    Intent -->|general, help, greetings| General[General Handler: Basic Responses]
    
    Academic --> SystemPrompt1[System Prompt: Expert Academic Advisor]
    
    Wellness --> SystemPrompt2[System Prompt: Compassionate Wellness Advisor]
    
    Campus --> SystemPrompt3[System Prompt: Enthusiastic Campus Advisor]
    
    SystemPrompt1 --> BaseAgent[BaseAgent Class with Shared Methods]
    SystemPrompt2 --> BaseAgent
    SystemPrompt3 --> BaseAgent
    
    BaseAgent --> BuildContext[buildContextPrompt method]
    
    BaseAgent --> Generate[generate method: Call Mistral Service]
    
    Generate --> Mistral[MistralService Local LLM Interface]
    
    style Orchestrator fill:#FF5722
    style Academic fill:#4CAF50
    style Wellness fill:#f44336
    style Campus fill:#2196F3
    style Mistral fill:#9C27B0
```

## Frontend State Management

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated
    Unauthenticated --> Login: User visits /chat
    Login --> Authenticated: Successful login
    
    Authenticated --> LoadingHistory: Fetch messages
    LoadingHistory --> DisplayChat: Show messages
    
    DisplayChat --> UserTyping: User types
    UserTyping --> OptimisticUpdate: Show user message
    OptimisticUpdate --> Loading: Set isLoading=true
    
    Loading --> Thinking: Show "AI is thinking"
    Thinking --> APICall: POST /api/chat/ask
    
    APICall --> ServerProcessing: Orchestrator routes
    ServerProcessing --> LLMResponse: LM Studio generates
    LLMResponse --> SaveDB: Save to database
    
    SaveDB --> ReloadHistory: GET /api/chat/history
    ReloadHistory --> ApplyTypewriter: Mark last AI msg as isNew
    
    ApplyTypewriter --> Typing: Typewriter effect (20ms/char)
    Typing --> Displayed: Message fully typed
    
    Displayed --> DisplayChat: Ready for next input
    
    DisplayChat --> Refresh: User presses F5
    Refresh --> LoadingHistory: Reload without typewriter
```

## Database Schema

```mermaid
erDiagram
    USERS ||--|| USER_PROFILES : has
    USERS ||--o{ MESSAGES : sends
    USERS ||--o{ ADVICE_LOGS : receives
    
    USERS {
        string id PK
        string email UK
        string passwordHash
        string name
        datetime createdAt
        datetime updatedAt
    }
    
    USER_PROFILES {
        string id PK
        string userId FK
        string major
        string year
        string interests
        string stressLevel
        string goals
        string timezone
        datetime createdAt
        datetime updatedAt
    }
    
    MESSAGES {
        string id PK
        string userId FK
        string role
        text content
        string intent
        string agentType
        json metadata
        datetime createdAt
    }
    
    ADVICE_LOGS {
        string id PK
        string userId FK
        string category
        string title
        text content
        string agentType
        string priority
        string status
        json metadata
        datetime createdAt
        datetime updatedAt
    }
    
    CAMPUS_RESOURCES {
        string id PK
        string category
        string name
        text description
        string location
        string contactInfo
        string website
        string hours
        string tags
        datetime createdAt
        datetime updatedAt
    }
```

## Key Features Flow

```mermaid
flowchart TD
    Features[Key Features]
    
    Features --> F1[24/7 Support]
    Features --> F2[Crisis Detection]
    Features --> F3[Stress Tracking]
    Features --> F4[Context Awareness]
    Features --> F5[Local Privacy]
    Features --> F6[Typewriter Effect]
    
    F1 --> F1A[Always available, no wait times, immediate responses]
    
    F2 --> F2A[Keyword scanning for crisis detection]
    F2A --> F2B[Immediate crisis resources like 988 and Crisis Text Line]
    
    F3 --> F3A[Detects stress from keywords]
    F3A --> F3B[Updates user profile and shows in dashboard]
    
    F4 --> F4A[Remembers last 6 messages and user profile details]
    
    F5 --> F5A[All data in local SQLite, LM Studio runs locally]
    
    F6 --> F6A[20ms per character with blinking cursor]
    
    style F2 fill:#f44336
    style F2A fill:#ff9800
    style F2B fill:#ff9800
    style F3 fill:#FF5722
    style F5 fill:#4CAF50
```

