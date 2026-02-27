export const CHART_TEMPLATES: Record<string, string> = {
    flowchart: `flowchart TD
    A[🚀 Start] --> B{Decision?}
    B -->|Yes| C[Process A]
    B -->|No| D[Process B]
    C --> E[Result 1]
    D --> E
    E --> F[🎯 End]

    style A fill:#6366f1,stroke:#4f46e5,color:#fff
    style F fill:#10b981,stroke:#059669,color:#fff
    style B fill:#f59e0b,stroke:#d97706,color:#fff`,

    sequence: `sequenceDiagram
    participant U as 👤 User
    participant C as 🖥️ Client
    participant S as ⚙️ Server
    participant D as 🗄️ Database

    U->>C: Click Login
    C->>S: POST /auth/login
    S->>D: Query user
    D-->>S: User data
    S-->>C: JWT Token
    C-->>U: Welcome!

    Note over C,S: Encrypted connection`,

    gantt: `gantt
    title Project Timeline
    dateFormat YYYY-MM-DD
    section Planning
        Requirements    :a1, 2024-01-01, 14d
        Design          :a2, after a1, 10d
    section Development
        Backend API     :b1, after a2, 21d
        Frontend UI     :b2, after a2, 28d
    section Testing
        Integration     :c1, after b1, 14d
        UAT             :c2, after c1, 7d`,

    classDiagram: `classDiagram
    class Animal {
        +String name
        +int age
        +makeSound() void
    }
    class Dog {
        +String breed
        +fetch() void
    }
    class Cat {
        +bool isIndoor
        +purr() void
    }
    Animal <|-- Dog
    Animal <|-- Cat`,

    erDiagram: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    PRODUCT ||--o{ LINE-ITEM : "is in"
    CUSTOMER {
        int id PK
        string name
        string email
    }
    ORDER {
        int id PK
        date created
        string status
    }
    PRODUCT {
        int id PK
        string name
        float price
    }`,

    stateDiagram: `stateDiagram-v2
    [*] --> Idle
    Idle --> Processing : Submit
    Processing --> Success : Valid
    Processing --> Error : Invalid
    Error --> Idle : Retry
    Success --> [*]

    state Processing {
        [*] --> Validating
        Validating --> Saving
        Saving --> [*]
    }`,

    pie: `pie title Browser Market Share
    "Chrome" : 65
    "Safari" : 19
    "Firefox" : 4
    "Edge" : 4
    "Other" : 8`,

    mindmap: `mindmap
  root((Project))
    Planning
      Requirements
      Timeline
      Resources
    Design
      UI/UX
      Architecture
      Database
    Development
      Frontend
      Backend
      API
    Testing
      Unit Tests
      Integration
      E2E`,
}

export const DEFAULT_CODE = CHART_TEMPLATES.flowchart
