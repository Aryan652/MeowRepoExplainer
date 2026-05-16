# RepoExplainer AI

> AI-powered repository analysis and documentation platform that helps developers understand any codebase in minutes.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://reactjs.org/)
[![TanStack Start](https://img.shields.io/badge/TanStack-Start-ff4154.svg)](https://tanstack.com/start)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-f38020.svg)](https://workers.cloudflare.com/)

## 🎯 Overview

RepoExplainer AI is a full-stack application that leverages AI agents to analyze GitHub repositories, generate comprehensive documentation, identify technical debt, visualize architecture, and enable conversational code exploration through an intelligent chat interface.

### Key Features

- 🔍 **Intelligent Repository Analysis** - Multi-agent AI system analyzes code structure, dependencies, and patterns
- 💬 **Conversational Code Chat** - Ask questions about your codebase in natural language with context-aware responses
- 📚 **Auto-Generated Documentation** - Creates README, API references, onboarding guides, and architecture notes
- 🏗️ **Architecture Visualization** - Interactive dependency graphs and system architecture maps
- 🔒 **Security Analysis** - Identifies vulnerabilities and security issues
- 📊 **Technical Debt Tracking** - Detects code smells, duplications, and refactoring opportunities
- 🔎 **Semantic Code Search** - Vector-based search powered by embeddings
- 📈 **Repository Health Metrics** - Health scores, test coverage, and quality indicators

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Frontend (TanStack Start)                   │
│         React 19 • TanStack Router • Tailwind CSS            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Server-Side)                   │
│              GitHub Service • OpenAI Service                 │
│              RAG Pipeline • Vector Service                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Data Layer (PostgreSQL)                     │
│         Drizzle ORM • pgvector • Supabase                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI Agent System                           │
│    Documentation • Security • Architecture • Refactor        │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (Bun recommended)
- **PostgreSQL** 14+ with pgvector extension
- **OpenAI API Key** (for AI features)
- **GitHub Token** (optional, for higher rate limits)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/repoexplainer.git
   cd repoexplainer
   ```

2. **Install dependencies**
   ```bash
   # Using Bun (recommended)
   bun install

   # Or using npm
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .dev.vars.example .dev.vars
   ```

   Edit `.dev.vars` with your credentials:
   ```env
   # Database (Supabase or local PostgreSQL)
   DATABASE_URL=postgresql://user:password@localhost:5432/repoexplainer
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_anon_key
   
   # OpenAI (required for AI features)
   OPENAI_API_KEY=sk-your_openai_api_key
   
   # GitHub (optional, increases rate limits)
   GITHUB_TOKEN=ghp_your_github_token
   
   # Application
   NODE_ENV=development
   PORT=8080
   APP_URL=http://localhost:8080
   ```

4. **Set up the database**
   ```bash
   # Push schema to database
   bun run db:push
   
   # Or generate migrations
   bun run db:generate
   bun run db:migrate
   ```

5. **Start the development server**
   ```bash
   bun run dev
   ```

   The application will be available at `http://localhost:8080`

## 📖 Usage

### Analyzing a Repository

1. **Navigate to the Analyze page** (`/analyze`)
2. **Enter a GitHub repository URL** (e.g., `https://github.com/facebook/react`)
3. **Click "Analyze"** to start the multi-agent analysis
4. **Monitor progress** through the real-time status updates:
   - Cloning repository
   - Detecting languages & frameworks
   - Parsing AST & extracting symbols
   - Computing embeddings
   - Running multi-agent analysis

### Exploring Repository Insights

Once analysis is complete, explore various tabs:

- **Overview** - Health score, tech debt count, test coverage, language distribution
- **Chat** - Ask questions about the codebase with AI-powered responses
- **Architecture** - Visual dependency graphs and system architecture
- **Docs** - Auto-generated documentation (README, API, Onboarding, Architecture)
- **Tech Debt** - Identified issues with severity levels and recommendations

### Chat Examples

```
"What does this repository do?"
"Explain the authentication flow"
"Show me all database models"
"How is error handling implemented?"
"What are the main API endpoints?"
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: TanStack Start (Full-stack React framework)
- **UI Library**: React 19
- **Routing**: TanStack Router (type-safe routing)
- **State Management**: TanStack Query (server state)
- **Styling**: Tailwind CSS v4 + Vanilla CSS
- **Components**: Radix UI primitives
- **Icons**: Lucide React
- **Charts**: Recharts

### Backend
- **Runtime**: Node.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Vector Store**: pgvector extension
- **Authentication**: Supabase Auth
- **AI/ML**: OpenAI API (GPT-4, text-embedding-3-small)

### Infrastructure
- **Deployment**: Cloudflare Pages/Workers
- **Package Manager**: Bun
- **Build Tool**: Vite
- **Linting**: ESLint v9 + Prettier

### AI Agent System
- **Documentation Agent** - Generates comprehensive documentation
- **Security Agent** - Identifies vulnerabilities and security issues
- **Architecture Agent** - Maps system architecture and dependencies
- **Refactor Agent** - Detects code smells and suggests improvements
- **Testing Agent** - Analyzes test coverage and quality

## 📁 Project Structure

```
repoexplainer/
├── src/
│   ├── routes/              # TanStack Router pages
│   │   ├── index.tsx        # Landing page
│   │   ├── dashboard.tsx    # Repository dashboard
│   │   ├── analyze.tsx      # Repository analysis
│   │   ├── repo.$repoId/    # Repository detail pages
│   │   │   ├── index.tsx    # Overview
│   │   │   ├── chat.tsx     # AI chat interface
│   │   │   ├── docs.tsx     # Documentation viewer
│   │   │   ├── architecture.tsx
│   │   │   └── debt.tsx     # Tech debt tracker
│   │   └── ...
│   ├── components/          # React components
│   │   ├── site/            # Landing page components
│   │   └── ui/              # Reusable UI components (Radix)
│   ├── services/            # Business logic
│   │   ├── github.service.ts    # GitHub API integration
│   │   ├── openai.service.ts    # OpenAI API wrapper
│   │   ├── rag.service.ts       # RAG pipeline
│   │   └── vector.service.ts    # Vector operations
│   ├── agents/              # AI agent system
│   │   ├── base.agent.ts        # Base agent class
│   │   ├── orchestrator.ts      # Agent coordination
│   │   ├── documentation.agent.ts
│   │   └── security.agent.ts
│   ├── db/                  # Database layer
│   │   ├── schema.ts        # Drizzle schema
│   │   └── client.ts        # Database client
│   ├── lib/                 # Utilities
│   │   ├── config.ts        # Configuration management
│   │   ├── auth.tsx         # Authentication context
│   │   ├── logger.ts        # Logging utilities
│   │   └── api/             # API client functions
│   ├── hooks/               # React hooks
│   └── styles.css           # Global styles
├── drizzle/                 # Database migrations
├── Plan/                    # Project documentation
├── .dev.vars.example        # Environment template
├── drizzle.config.ts        # Drizzle configuration
├── package.json
├── tsconfig.json
├── vite.config.ts
└── wrangler.jsonc           # Cloudflare config
```

## 🗄️ Database Schema

### Core Tables

- **users** - User accounts and authentication
- **repositories** - Analyzed repositories with metadata
- **analysis_jobs** - Background analysis job tracking
- **repository_docs** - Generated documentation (README, API, etc.)
- **tech_debt_items** - Identified technical debt issues
- **code_embeddings** - Vector embeddings for semantic search

### Key Features

- **pgvector extension** for similarity search
- **Cascading deletes** for data integrity
- **Timestamps** for audit trails
- **Enums** for status tracking

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `OPENAI_API_KEY` | Yes | OpenAI API key for AI features |
| `GITHUB_TOKEN` | No | GitHub PAT for higher rate limits |
| `NODE_ENV` | No | Environment (development/production) |
| `PORT` | No | Server port (default: 8080) |
| `MAX_REPO_SIZE_MB` | No | Max repository size (default: 500) |
| `MAX_FILES_PER_REPO` | No | Max files per repo (default: 50000) |

### Feature Flags

The application automatically detects available features based on configuration:

- ✅ **Database** - Requires `DATABASE_URL`
- ✅ **Authentication** - Requires Supabase credentials
- ✅ **AI Analysis** - Requires `OPENAI_API_KEY`
- ✅ **GitHub Integration** - Requires `GITHUB_TOKEN`
- ✅ **Vector Search** - Requires pgvector extension

## 🧪 Development

### Available Scripts

```bash
# Development
bun run dev              # Start dev server
bun run build            # Production build
bun run preview          # Preview production build

# Database
bun run db:push          # Push schema to database
bun run db:generate      # Generate migrations
bun run db:migrate       # Run migrations
bun run db:studio        # Open Drizzle Studio

# Code Quality
bun run lint             # Run ESLint
bun run format           # Format with Prettier
```

### Adding a New Agent

1. Create agent file in `src/agents/`:
   ```typescript
   import { BaseAgent, AgentContext, AgentResult } from "./base.agent";
   
   export class MyAgent extends BaseAgent {
     getName(): string {
       return "My Agent";
     }
     
     async execute(context: AgentContext): Promise<AgentResult> {
       // Implementation
     }
   }
   ```

2. Register in `src/agents/orchestrator.ts`:
   ```typescript
   this.agents.set("myagent", myAgent);
   ```

## 🚢 Deployment

### Cloudflare Pages/Workers

1. **Build the application**
   ```bash
   bun run build
   ```

2. **Deploy to Cloudflare**
   ```bash
   npx wrangler deploy
   ```

3. **Set environment variables** in Cloudflare dashboard

### Environment Setup

Ensure all required environment variables are configured in your Cloudflare Workers settings.

## 📊 Performance

- **Analysis Time**: 30-60 seconds for medium repositories (1000-5000 files)
- **Embedding Generation**: ~2-5 seconds per 100 code chunks
- **Vector Search**: <100ms for similarity queries
- **Chat Response**: 2-5 seconds with context retrieval

## 🐛 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Verify DATABASE_URL is correct
# Check if PostgreSQL is running
# Ensure pgvector extension is installed
```

**OpenAI API Errors**
```bash
# Verify OPENAI_API_KEY is valid
# Check API quota and billing
# Review rate limits
```

**GitHub Rate Limiting**
```bash
# Add GITHUB_TOKEN to increase limits
# Unauthenticated: 60 requests/hour
# Authenticated: 5000 requests/hour
```

**Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules .vinxi
bun install
```

## 🔒 Security

- Environment variables are validated at startup
- Database queries use parameterized statements (Drizzle ORM)
- Authentication handled by Supabase
- CSRF protection enabled
- Rate limiting on API endpoints
- Input sanitization for user queries

## 📈 Roadmap

### Current Status
- ✅ Repository ingestion and analysis
- ✅ Multi-agent AI system
- ✅ Documentation generation
- ✅ Chat interface with RAG
- ✅ Vector-based semantic search
- ✅ Architecture visualization
- ✅ Tech debt tracking

### Planned Features
- 🔄 Real-time collaboration
- 🔄 Private repository support (GitHub App)
- 🔄 Multi-language support (Java, Go, Rust, etc.)
- 🔄 CI/CD integration
- 🔄 Team workspaces
- 🔄 Custom agent creation
- 🔄 Export reports (PDF, Markdown)
- 🔄 Webhook notifications

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- **TanStack** - For the excellent Start framework and Router
- **Cloudflare** - For edge computing infrastructure
- **OpenAI** - For powerful AI models
- **Supabase** - For database and authentication
- **Radix UI** - For accessible component primitives
- **Drizzle** - For type-safe ORM

## 📞 Support

- 📧 Email: support@repoexplainer.ai
- 💬 Discord: [Join our community](https://discord.gg/repoexplainer)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/repoexplainer/issues)
- 📖 Docs: [Full Documentation](https://docs.repoexplainer.ai)

---

**Built with ❤️ by the RepoExplainer team**

*Revolutionizing code understanding through AI*