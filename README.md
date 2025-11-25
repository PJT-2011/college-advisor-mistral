# 🎓 AI College Life Advisor - Agentic Chatbot (Local Mistral)

A **production-ready, full-stack agentic AI chatbot** for college students running **entirely locally** using **Mistral LLM**. Features a multi-agent orchestration system, beautiful UI, and complete personalization.

**⚡ CPU-Optimized for AMD Ryzen 5 3600** - 5-10 second responses with 12-thread utilization

---

## 🎯 Quick Links

- **[15-Minute Setup Guide](QUICKSTART.md)** ← Start here
- **[CPU Optimization Guide](CPU_OPTIMIZATION.md)** ← Ryzen 5 3600 tuning
- **[Frontend Component Guide](COMPONENT_GUIDE.md)** ← Build UI
- **[Quick Reference Card](QUICK_REFERENCE.md)** ← One-page cheatsheet
- **[Complete Feature List](STATUS.md)** ← What's built

---

## 🏗️ Architecture

### **Multi-Agent System**
```
User Query
    ↓
Orchestrator Agent (Intent Classification)
    ↓
┌─────────────┬──────────────┬─────────────────┐
│  Academic   │   Wellness   │  Campus Life    │
│   Agent     │    Agent     │     Agent       │
└─────────────┴──────────────┴─────────────────┘
    ↓
Tools: Calendar, Todo, Resources, Profile
    ↓
Synthesized Response → User
```

### **Tech Stack**
- **Frontend**: Next.js 14 + TypeScript + TailwindCSS + ShadCN + Framer Motion
- **Backend**: Next.js API Routes + Node.js
- **Database**: PostgreSQL + Prisma ORM
- **LLM**: Local Mistral 7B (Instruct) via node-llama-cpp
- **Auth**: NextAuth.js + JWT
- **GPU**: CUDA support (optional)

### **Agents**
1. **Orchestrator Agent**: Routes queries to appropriate specialized agents
2. **Academic Agent**: Study tips, exam prep, time management, scheduling
3. **Wellness Agent**: Emotional support, stress management, self-care
4. **Campus Life Agent**: Clubs, housing, social life, resources

### **Tools**
- **CalendarTool**: Generate study schedules and exam prep plans
- **TodoTool**: Create daily/weekly task lists
- **ResourceLookupTool**: Fetch campus resources from database
- **ProfileTool**: Retrieve user data for personalization

---

## 🚀 Quick Start

### **Prerequisites**
- **Node.js** 20+ (tested on 20.11.0)
- **PostgreSQL** 15+ (or MongoDB)
- **GPU** (optional but recommended for faster inference)
- **~5GB disk space** for Mistral model

### **1. Clone and Install**

```powershell
cd C:\Users\Kraken
git clone <your-repo> college-advisor-mistral
cd college-advisor-mistral

# Install dependencies
npm install
```

### **2. Download Mistral Model**

Download **Mistral-7B-Instruct-v0.3** (quantized GGUF format):

```powershell
# Create models directory
New-Item -Path "models" -ItemType Directory -Force

# Download from Hugging Face (using curl or browser)
# URL: https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.3-GGUF

# Download the Q4_K_M quantization (recommended):
curl -L -o models/mistral-7b-instruct-v0.3.Q4_K_M.gguf `
  "https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.3-GGUF/resolve/main/mistral-7b-instruct-v0.3.Q4_K_M.gguf"
```

**Alternative quantizations:**
- `Q4_K_M` - 4.37GB (recommended, good balance)
- `Q5_K_M` - 5.13GB (better quality, slower)
- `Q8_0` - 7.70GB (highest quality, slowest)

### **3. Database Setup**

```powershell
# Create PostgreSQL database
createdb college_advisor_mistral

# Or use Docker
docker run --name postgres-advisor `
  -e POSTGRES_PASSWORD=password `
  -e POSTGRES_DB=college_advisor_mistral `
  -p 5432:5432 -d postgres:15
```

### **4. Environment Configuration**

```powershell
# Copy example env file
Copy-Item .env.example .env

# Edit .env with your settings
notepad .env
```

**Required variables:**
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/college_advisor_mistral"
NEXTAUTH_SECRET="your-secret-key-here"
MISTRAL_MODEL_PATH="./models/mistral-7b-instruct-v0.3.Q4_K_M.gguf"
USE_GPU=true
GPU_LAYERS=35
```

### **5. Database Migration**

```powershell
# Push schema to database
npm run db:push

# Seed initial data (campus resources, etc.)
npm run db:seed

# (Optional) Open Prisma Studio to view data
npm run db:studio
```

### **6. Run the Application**

```powershell
# Development mode
npm run dev

# Production build
npm run build
npm start
```

**App runs at:** `http://localhost:3000`

---

## 📁 Project Structure

```
college-advisor-mistral/
├── src/
│   ├── app/                      # Next.js 14 App Router
│   │   ├── (auth)/
│   │   │   ├── login/           # Login page
│   │   │   └── register/        # Registration page
│   │   ├── dashboard/           # Dashboard page
│   │   ├── chat/                # Chat interface
│   │   ├── profile/             # Profile editor
│   │   ├── resources/           # Resource center
│   │   ├── settings/            # User settings
│   │   ├── api/                 # API Routes
│   │   │   ├── auth/           # Authentication endpoints
│   │   │   ├── chat/           # Chat endpoints
│   │   │   ├── profile/        # Profile endpoints
│   │   │   └── advice/         # Advice history endpoints
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Homepage
│   │
│   ├── components/              # React components
│   │   ├── ui/                 # ShadCN UI components
│   │   ├── chat/               # Chat-specific components
│   │   │   ├── ChatBubble.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   └── AgentThinking.tsx
│   │   ├── dashboard/          # Dashboard components
│   │   ├── auth/               # Auth forms
│   │   └── layout/             # Layout components
│   │
│   ├── agents/                  # Multi-Agent System
│   │   ├── BaseAgent.ts        # Abstract base class
│   │   ├── OrchestratorAgent.ts # Main orchestrator
│   │   ├── AcademicAgent.ts    # Academic guidance
│   │   ├── WellnessAgent.ts    # Wellness support
│   │   └── CampusLifeAgent.ts  # Campus life advice
│   │
│   ├── tools/                   # Agent Tools
│   │   ├── index.ts            # All tools export
│   │   ├── CalendarTool.ts     # Study schedules
│   │   ├── TodoTool.ts         # Task management
│   │   ├── ResourceLookupTool.ts # Campus resources
│   │   └── ProfileTool.ts      # User data retrieval
│   │
│   ├── lib/                     # Utility libraries
│   │   ├── mistral.ts          # Mistral LLM service
│   │   ├── prisma.ts           # Prisma client
│   │   ├── auth.ts             # NextAuth config
│   │   └── utils.ts            # Helper functions
│   │
│   └── types/                   # TypeScript types
│       ├── agent.ts
│       ├── chat.ts
│       └── user.ts
│
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Seed data script
│
├── models/                      # LLM models (gitignored)
│   └── mistral-7b-instruct-v0.3.Q4_K_M.gguf
│
├── public/                      # Static assets
│   ├── icons/
│   └── images/
│
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── .env.example
└── README.md
```

---

## 🎨 UI Features

### **Design System**
- **Color Palette**: Soft gradients (blue, purple, teal)
- **Theme**: Sleek, minimalist, college-friendly
- **Effects**: Glassmorphism panels, smooth animations
- **Icons**: Lucide Icons
- **Fonts**: Inter (sans-serif)

### **Pages**

#### **1. Login/Register**
- Clean authentication forms
- JWT-based sessions
- Password hashing with bcrypt

#### **2. Dashboard**
- Quick stats cards
- Recent conversations
- Upcoming tasks
- Wellness check-ins

#### **3. Chat Interface**
- Real-time streaming responses
- Animated chat bubbles
- Agent thinking indicators
- Tool usage display
- Conversation history

#### **4. Profile Editor**
- Personal info (name, email)
- Academic details (major, year)
- Interests and goals
- Stress level tracking

#### **5. Resource Center**
- Browse campus resources
- Filter by category
- Save favorites

#### **6. Settings**
- Account preferences
- Notification settings
- Privacy controls

### **Animations (Framer Motion)**
- Page transitions
- Chat bubble entrance/exit
- Loading skeletons
- Hover effects
- Scroll animations

---

## 🤖 Multi-Agent System

### **Orchestrator Agent**
```typescript
// Receives user message
// Classifies intent → academic | wellness | campus_life | general | emergency
// Routes to appropriate agent
// Synthesizes final response
```

**Intent Classification:**
- Uses Mistral to classify message intent
- Keywords + semantic understanding
- Confidence scoring

### **Academic Agent**
**Handles:**
- Study tips and learning strategies
- Time management and productivity
- Exam preparation
- Course scheduling
- Major-specific advice

**Tools Used:**
- CalendarTool (study schedules)
- TodoTool (daily tasks)
- ProfileTool (personalization)

### **Wellness Agent**
**Handles:**
- Emotional check-ins
- Stress management techniques
- Daily well-being guidance
- Self-care recommendations
- Sleep and exercise tips

**Approach:**
- Gentle, non-medical responses
- Evidence-based techniques
- Crisis resource referrals (if needed)

### **Campus Life Agent**
**Handles:**
- Club and organization recommendations
- Housing and roommate advice
- Social life guidance
- Campus resource navigation
- Event discovery

**Tools Used:**
- ResourceLookupTool (campus database)
- ProfileTool (interest matching)

---

## 🔧 API Endpoints

### **Authentication**
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/session
```

### **Chat**
```
POST /api/chat/ask          # Send message to agents
GET  /api/chat/stream       # Stream response (SSE)
GET  /api/chat/history      # Get conversation history
DELETE /api/chat/clear      # Clear conversation
```

### **Profile**
```
GET    /api/profile/me      # Get current user profile
PUT    /api/profile/update  # Update profile
GET    /api/profile/stats   # Get usage statistics
```

### **Advice**
```
GET    /api/advice/history  # Get all advice logs
GET    /api/advice/:id      # Get specific advice
POST   /api/advice/save     # Save new advice
PUT    /api/advice/:id      # Update advice status
DELETE /api/advice/:id      # Delete advice
```

### **Resources**
```
GET    /api/resources       # Get all campus resources
GET    /api/resources/category/:cat  # Filter by category
GET    /api/resources/search?q=...   # Search resources
```

---

## 🧪 Testing the System

### **Test Queries**

**Academic:**
```
"Help me create a study schedule for finals"
"What are the best study techniques for calculus?"
"I have an exam next week, how should I prepare?"
```

**Wellness:**
```
"I'm feeling really stressed about midterms"
"How can I manage anxiety before presentations?"
"I haven't been sleeping well lately"
```

**Campus Life:**
```
"What clubs should I join as a CS major?"
"I'm having roommate conflicts, what should I do?"
"Where can I find tutoring services on campus?"
```

**Emergency:**
```
"I'm feeling really overwhelmed and hopeless"
→ Should trigger crisis resources
```

### **Expected Flow**
1. User sends message
2. Orchestrator classifies intent
3. Routes to appropriate agent (e.g., Academic)
4. Agent uses tools (CalendarTool, TodoTool)
5. Mistral generates personalized response
6. Response streams to frontend
7. Message saved to database

---

## ⚙️ Configuration

### **Mistral Model Settings**

**GPU Acceleration:**
```env
USE_GPU=true
GPU_LAYERS=35  # Adjust based on your VRAM (8GB recommended)
```

**Performance Tuning:**
```env
MISTRAL_CONTEXT_SIZE=4096  # Max tokens in context
MISTRAL_TEMPERATURE=0.7     # Creativity (0.0-1.0)
MISTRAL_MAX_TOKENS=512      # Max response length
```

**Memory Requirements:**
- **Q4_K_M**: ~5GB RAM (4GB VRAM if GPU)
- **Q5_K_M**: ~6GB RAM (5GB VRAM if GPU)
- **Q8_0**: ~8GB RAM (8GB VRAM if GPU)

### **Database**

**PostgreSQL (recommended):**
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"
```

**MongoDB (alternative):**
```env
DATABASE_URL="mongodb://localhost:27017/college_advisor_mistral"
```
*(Change datasource in schema.prisma to `provider = "mongodb"`)*

---

## 🚨 Troubleshooting

### **Model Not Loading**
```
Error: Mistral model not found
```
**Solution:** Ensure model is downloaded to `./models/` and path is correct in `.env`

### **Out of Memory**
```
Error: CUDA out of memory
```
**Solution:** Reduce `GPU_LAYERS` or switch to CPU:
```env
USE_GPU=false
GPU_LAYERS=0
```

### **Slow Inference**
**Solutions:**
1. Use GPU acceleration
2. Use smaller quantization (Q4_K_M)
3. Reduce `MISTRAL_CONTEXT_SIZE`
4. Reduce `MISTRAL_MAX_TOKENS`

### **Database Connection Failed**
```
Error: Can't reach database server
```
**Solution:** Ensure PostgreSQL is running:
```powershell
# Start PostgreSQL service
Start-Service postgresql-x64-15

# Or check Docker container
docker ps
```

---

## 📦 Deployment

### **Local Server (Production)**

```powershell
# Build for production
npm run build

# Run production server
npm start
```

### **Docker Deployment**

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy files
COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Build
RUN npm run build

# Download model (or mount as volume)
# COPY models/ ./models/

EXPOSE 3000

CMD ["npm", "start"]
```

```powershell
# Build and run
docker build -t college-advisor-mistral .
docker run -p 3000:3000 `
  -v ${PWD}/models:/app/models `
  -e DATABASE_URL="..." `
  college-advisor-mistral
```

### **GPU Support (Docker)**

Requires **nvidia-docker**:
```powershell
docker run --gpus all -p 3000:3000 ...
```

---

## 🔐 Security

### **Best Practices**
✅ Passwords hashed with bcrypt (12 rounds)
✅ JWT tokens with expiration
✅ SQL injection prevention (Prisma ORM)
✅ XSS protection (React auto-escaping)
✅ CSRF protection (NextAuth)
✅ Rate limiting on API routes
✅ Input validation with Zod

### **Production Checklist**
- [ ] Change `NEXTAUTH_SECRET` to strong random value
- [ ] Enable HTTPS/SSL
- [ ] Set up database backups
- [ ] Configure firewall rules
- [ ] Enable logging and monitoring
- [ ] Set up error tracking (Sentry)

---

## 📊 Database Schema

See `prisma/schema.prisma` for full schema.

**Key Models:**
- **User**: Authentication and basic info
- **UserProfile**: Personalization data (major, year, interests)
- **Message**: Conversation history
- **AdviceLog**: Generated advice and recommendations
- **CampusResource**: Campus services, clubs, events
- **AgentMemory**: Persistent agent context

---

## 🎯 Roadmap

### **Phase 1: Core Features** ✅
- [x] Multi-agent orchestration
- [x] Local Mistral integration
- [x] Database and auth
- [x] Basic UI

### **Phase 2: Enhanced Tools** (In Progress)
- [ ] Real calendar integration (Google Calendar)
- [ ] Advanced study analytics
- [ ] Flashcard generation
- [ ] Spaced repetition system

### **Phase 3: Advanced AI**
- [ ] Long-term memory persistence
- [ ] Multi-turn reasoning
- [ ] Proactive notifications
- [ ] Voice interface

### **Phase 4: Social Features**
- [ ] Study group matching
- [ ] Peer advice sharing
- [ ] Collaborative note-taking

---

## 🤝 Contributing

This is a reference implementation for agentic AI with local LLMs. Feel free to:
- Add new agents for specialized domains
- Integrate with university-specific APIs
- Customize UI theme and components
- Experiment with different models (Llama3, Phi-3, etc.)

---

## 📝 License

MIT License - use however you want!

---

## 🙏 Acknowledgments

- **Mistral AI**: For the incredible open-source LLM
- **Georgi Gerganov (ggerganov)**: For llama.cpp
- **Vercel**: For Next.js
- **Prisma**: For the excellent ORM
- **ShadCN**: For beautiful UI components

---

## 💡 Tips

**For Students:**
- Be specific in your questions
- Update your profile for personalized advice
- Check the resource center regularly
- Use the todo tool for daily planning

**For Developers:**
- Monitor model performance with Prisma Studio
- Use streaming for better UX
- Implement caching for frequently asked questions
- Fine-tune Mistral on college-specific data

---

**Built with ❤️ for college students**

Need help? Check the code comments or open an issue!

**Project by:** Senior Full-Stack Engineer
**Contact:** [Your contact info]
