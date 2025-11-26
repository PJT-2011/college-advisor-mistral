# AI College Life Advisor - Agentic Chatbot

A full-stack AI chatbot for college students running entirely locally using Mistral LLM. Features a multi-agent orchestration system with specialized agents for academic support, wellness guidance, and campus life assistance.

## Overview

This chatbot provides personalized advice to college students through three specialized AI agents:
- Academic Agent: Study strategies, exam preparation, time management
- Wellness Agent: Emotional support, stress management, crisis detection
- Campus Life Agent: Social guidance, club recommendations, housing advice

The system runs completely locally on your machine for privacy and zero API costs.

Architecture diagram: [ARCHITECTURE.md](ARCHITECTURE.md)

## Tech Stack

- Frontend: Next.js 14, TypeScript, TailwindCSS, Framer Motion
- Backend: Next.js API Routes, Node.js
- Database: PostgreSQL with Prisma ORM
- AI: Local Mistral-7B via LM Studio
- Authentication: NextAuth.js with JWT

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- LM Studio (for running Mistral model)
- 5GB disk space for the AI model
- 8GB RAM minimum

## Installation

### 1. Clone Repository

```powershell
git clone <your-repo> college-advisor-mistral
cd college-advisor-mistral
npm install
```

### 2. Set Up Database

Create a PostgreSQL database:

```powershell
createdb college_advisor_mistral
```

Or use Docker:

```powershell
docker run --name postgres-advisor `
  -e POSTGRES_PASSWORD=password `
  -e POSTGRES_DB=college_advisor_mistral `
  -p 5432:5432 -d postgres:15
```

### 3. Configure Environment

Copy the example environment file and edit it:

```powershell
Copy-Item .env.example .env
notepad .env
```

Update these required variables:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/college_advisor_mistral"
NEXTAUTH_SECRET="generate-a-random-secret-key"
LOCAL_LLM_URL="http://localhost:1234/v1/chat/completions"
```

### 4. Initialize Database

```powershell
npm run db:push
npm run db:seed
```

### 5. Set Up LM Studio

1. Download and install LM Studio from https://lmstudio.ai
2. In LM Studio, search for and download: "TheBloke/Mistral-7B-Instruct-v0.3-GGUF"
3. Select the Q4_K_M quantization (4.37GB)
4. Start the local server in LM Studio (default port 1234)

### 6. Run Application

Development mode:

```powershell
npm run dev
```

Production mode:

```powershell
npm run build
npm start
```

Access the application at http://localhost:3000

## Usage

1. Register a new account or login
2. Complete your profile with academic information
3. Start chatting - the system will automatically route your questions to the appropriate agent
4. View your conversation history and saved advice in the dashboard

### Example Queries

Academic: "Help me create a study schedule for finals week"
Wellness: "I'm feeling stressed about my workload"
Campus Life: "What clubs should I join as a computer science major?"

## Key Features

- Multi-agent orchestration with intelligent intent classification
- Crisis detection with instant emergency resource display
- Stress level tracking (automatically updates to 10 on crisis keywords)
- Stop generation button to cancel AI responses mid-generation
- Emergency popup for danger indicators
- Typewriter effect for responses (skipped for crisis messages)
- Conversation history with personalized advice logging
- Profile-based personalization

## Project Structure

```
src/
├── agents/          # Multi-agent system (Orchestrator, Academic, Wellness, Campus Life)
├── app/             # Next.js pages and API routes
├── components/      # React UI components
├── lib/             # Utilities (Mistral service, Prisma, Auth)
└── tools/           # Agent tools (Calendar, Todo, Resources, Profile)

prisma/
├── schema.prisma    # Database schema
└── seed.js          # Initial data

models/              # AI model storage (gitignored)
```

## Available Scripts

```powershell
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run db:push      # Apply database schema
npm run db:seed      # Seed initial data
npm run db:studio    # Open database GUI on port 5555
```

## Configuration

### Database GUI

To view and edit database contents:

```powershell
npx prisma studio --port 5555
```

### Performance Tuning

Adjust model settings in .env:

```env
MISTRAL_TEMPERATURE=0.7      # Response creativity (0.0-1.0)
MISTRAL_MAX_TOKENS=1024      # Max response length
```

## Troubleshooting

**LM Studio not connecting:**
- Ensure LM Studio server is running on port 1234
- Check that the Mistral model is loaded in LM Studio

**Database connection failed:**
- Verify PostgreSQL is running
- Check DATABASE_URL in .env file

**Slow responses:**
- Use GPU acceleration in LM Studio if available
- Reduce max tokens in .env configuration

## License

MIT License

## Acknowledgments

- Mistral AI for the open-source LLM
- Vercel for Next.js
- Prisma for the ORM
- ShadCN for UI components
