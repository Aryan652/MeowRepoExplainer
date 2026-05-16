# RepoMind AI - Data Models and Schemas

This document provides comprehensive specifications for all data models, database schemas, and state management patterns used in RepoMind AI.

---

## Table of Contents

1. [Core Entities](#1-core-entities)
2. [Database Schema (PostgreSQL)](#2-database-schema-postgresql)
3. [Vector Store Schema (ChromaDB)](#3-vector-store-schema-chromadb)
4. [Cache Schema (Redis)](#4-cache-schema-redis)
5. [State Management](#5-state-management)
6. [Data Relationships](#6-data-relationships)
7. [Data Validation Rules](#7-data-validation-rules)

---

## 1. Core Entities

### 1.1 User Entity

**Purpose**: Represents a user account in the system.

```python
from pydantic import BaseModel, EmailStr, UUID4
from datetime import datetime
from typing import Optional, List

class User(BaseModel):
    """User account model"""
    id: UUID4
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    hashed_password: str
    is_active: bool = True
    is_superuser: bool = False
    
    # Profile
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    
    # Preferences
    theme: str = "light"  # light, dark, auto
    language: str = "en"
    notifications_enabled: bool = True
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None
    
    # Relationships
    repositories: List["Repository"] = []
    queries: List["Query"] = []
    api_keys: List["APIKey"] = []
    
    class Config:
        orm_mode = True
```

### 1.2 Repository Entity

**Purpose**: Represents a code repository being analyzed.

```python
from enum import Enum

class RepositoryStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    INDEXED = "indexed"
    FAILED = "failed"
    UPDATING = "updating"

class Repository(BaseModel):
    """Code repository model"""
    id: UUID4
    name: str
    url: Optional[str] = None  # GitHub URL
    description: Optional[str] = None
    owner_id: UUID4  # Foreign key to User
    
    # Repository metadata
    language_stats: Dict[str, int] = {}  # {"python": 5000, "js": 3000}
    file_count: int = 0
    line_count: int = 0
    size_bytes: int = 0
    primary_language: Optional[str] = None
    
    # Processing status
    status: RepositoryStatus = RepositoryStatus.PENDING
    last_indexed: Optional[datetime] = None
    indexing_progress: float = 0.0  # 0.0 to 1.0
    indexing_error: Optional[str] = None
    
    # Vector store reference
    embedding_collection_name: str
    
    # Git metadata
    default_branch: str = "main"
    commit_hash: Optional[str] = None
    
    # Settings
    auto_update: bool = False
    update_frequency: str = "daily"  # daily, weekly, manual
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    
    # Relationships
    queries: List["Query"] = []
    documentation: Optional["Documentation"] = None
    code_elements: List["CodeElement"] = []
    
    class Config:
        orm_mode = True
```

### 1.3 Query Entity

**Purpose**: Represents a user query and its response.

```python
class QueryIntent(str, Enum):
    EXPLANATION = "explanation"
    SEARCH = "search"
    GENERATION = "generation"
    ANALYSIS = "analysis"
    REFACTORING = "refactoring"
    TESTING = "testing"
    SECURITY = "security"

class Citation(BaseModel):
    """Source citation for query response"""
    file_path: str
    line_start: int
    line_end: int
    code_snippet: str
    relevance_score: float

class Query(BaseModel):
    """User query model"""
    id: UUID4
    text: str
    intent: QueryIntent
    repository_id: UUID4
    user_id: UUID4
    
    # Query processing
    embedding: Optional[List[float]] = None  # Query embedding
    retrieved_contexts: List[str] = []  # Retrieved code snippets
    agent_results: Dict[str, Any] = {}  # Results from each agent
    
    # Response
    response: str
    confidence_score: float = 0.0
    citations: List[Citation] = []
    follow_up_questions: List[str] = []
    
    # Performance metrics
    processing_time_ms: int = 0
    tokens_used: int = 0
    agents_used: List[str] = []
    
    # Feedback
    user_rating: Optional[int] = None  # 1-5 stars
    user_feedback: Optional[str] = None
    
    # Timestamps
    created_at: datetime
    
    class Config:
        orm_mode = True
```

### 1.4 CodeElement Entity

**Purpose**: Represents a code construct (function, class, etc.).

```python
class ElementType(str, Enum):
    FUNCTION = "function"
    CLASS = "class"
    METHOD = "method"
    VARIABLE = "variable"
    CONSTANT = "constant"
    INTERFACE = "interface"
    TYPE = "type"
    MODULE = "module"

class CodeElement(BaseModel):
    """Represents a code construct"""
    id: UUID4
    repository_id: UUID4
    
    # Code location
    file_path: str
    line_start: int
    line_end: int
    
    # Code metadata
    type: ElementType
    name: str
    language: str
    content: str
    signature: Optional[str] = None  # Function/method signature
    docstring: Optional[str] = None
    
    # Analysis results
    complexity: int = 0  # Cyclomatic complexity
    maintainability_index: Optional[float] = None
    dependencies: List[str] = []  # Other elements this depends on
    dependents: List[str] = []  # Other elements that depend on this
    
    # Security
    has_security_issues: bool = False
    security_issues: List[str] = []
    
    # Testing
    is_tested: bool = False
    test_coverage: float = 0.0
    
    # Embeddings
    embedding_id: str  # Reference to vector store
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True
```

### 1.5 Documentation Entity

**Purpose**: Stores generated documentation.

```python
class DocumentationType(str, Enum):
    README = "readme"
    API_DOCS = "api_docs"
    ARCHITECTURE = "architecture"
    ONBOARDING = "onboarding"
    CHANGELOG = "changelog"

class Documentation(BaseModel):
    """Generated documentation model"""
    id: UUID4
    repository_id: UUID4
    type: DocumentationType
    
    # Documentation content
    content: str  # Markdown content
    metadata: Dict[str, Any] = {}
    
    # For API docs
    endpoints: Optional[List[Dict[str, Any]]] = None
    
    # For architecture
    diagram_code: Optional[str] = None  # Mermaid.js code
    
    # Generation metadata
    generated_by: str  # Agent that generated
    generation_time_ms: int = 0
    model_used: str
    
    # Version control
    version: int = 1
    previous_version_id: Optional[UUID4] = None
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True
```

### 1.6 Agent Entity

**Purpose**: Tracks agent execution and results.

```python
class AgentType(str, Enum):
    DOCUMENTATION = "documentation"
    SECURITY = "security"
    REFACTOR = "refactor"
    TESTING = "testing"
    ARCHITECTURE = "architecture"

class AgentExecution(BaseModel):
    """Agent execution log"""
    id: UUID4
    agent_type: AgentType
    query_id: UUID4
    repository_id: UUID4
    
    # Execution details
    task_description: str
    input_data: Dict[str, Any]
    output_data: Dict[str, Any]
    
    # Status
    status: str  # pending, running, completed, failed
    error_message: Optional[str] = None
    
    # Performance
    execution_time_ms: int = 0
    tokens_used: int = 0
    model_used: str
    
    # Results
    confidence_score: float = 0.0
    findings: List[Dict[str, Any]] = []
    
    # Timestamps
    started_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True
```

### 1.7 APIKey Entity

**Purpose**: API keys for programmatic access.

```python
class APIKey(BaseModel):
    """API key for programmatic access"""
    id: UUID4
    user_id: UUID4
    name: str
    key_hash: str  # Hashed API key
    key_prefix: str  # First 8 chars for identification
    
    # Permissions
    scopes: List[str] = ["read"]  # read, write, admin
    
    # Usage limits
    rate_limit: int = 100  # requests per minute
    daily_limit: int = 10000
    
    # Status
    is_active: bool = True
    last_used: Optional[datetime] = None
    usage_count: int = 0
    
    # Timestamps
    created_at: datetime
    expires_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True
```

---

## 2. Database Schema (PostgreSQL)

### 2.1 Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_superuser BOOLEAN DEFAULT FALSE,
    
    -- Profile
    avatar_url VARCHAR(500),
    bio TEXT,
    company VARCHAR(255),
    location VARCHAR(255),
    
    -- Preferences
    theme VARCHAR(20) DEFAULT 'light',
    language VARCHAR(10) DEFAULT 'en',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2.2 Repositories Table

```sql
CREATE TABLE repositories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500),
    description TEXT,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Repository metadata
    language_stats JSONB DEFAULT '{}',
    file_count INTEGER DEFAULT 0,
    line_count INTEGER DEFAULT 0,
    size_bytes BIGINT DEFAULT 0,
    primary_language VARCHAR(50),
    
    -- Processing status
    status VARCHAR(50) DEFAULT 'pending',
    last_indexed TIMESTAMP,
    indexing_progress FLOAT DEFAULT 0.0,
    indexing_error TEXT,
    
    -- Vector store reference
    embedding_collection_name VARCHAR(255),
    
    -- Git metadata
    default_branch VARCHAR(100) DEFAULT 'main',
    commit_hash VARCHAR(40),
    
    -- Settings
    auto_update BOOLEAN DEFAULT FALSE,
    update_frequency VARCHAR(20) DEFAULT 'daily',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_repositories_owner ON repositories(owner_id);
CREATE INDEX idx_repositories_status ON repositories(status);
CREATE INDEX idx_repositories_name ON repositories(name);
CREATE INDEX idx_repositories_created_at ON repositories(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_repositories_updated_at BEFORE UPDATE ON repositories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2.3 Queries Table

```sql
CREATE TABLE queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text TEXT NOT NULL,
    intent VARCHAR(50),
    repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Query processing
    retrieved_contexts JSONB DEFAULT '[]',
    agent_results JSONB DEFAULT '{}',
    
    -- Response
    response TEXT,
    confidence_score FLOAT DEFAULT 0.0,
    citations JSONB DEFAULT '[]',
    follow_up_questions JSONB DEFAULT '[]',
    
    -- Performance metrics
    processing_time_ms INTEGER DEFAULT 0,
    tokens_used INTEGER DEFAULT 0,
    agents_used JSONB DEFAULT '[]',
    
    -- Feedback
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    user_feedback TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_queries_repository ON queries(repository_id);
CREATE INDEX idx_queries_user ON queries(user_id);
CREATE INDEX idx_queries_created_at ON queries(created_at DESC);
CREATE INDEX idx_queries_intent ON queries(intent);

-- Full-text search index
CREATE INDEX idx_queries_text_search ON queries USING gin(to_tsvector('english', text));
```

### 2.4 Code Elements Table

```sql
CREATE TABLE code_elements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    
    -- Code location
    file_path VARCHAR(500) NOT NULL,
    line_start INTEGER NOT NULL,
    line_end INTEGER NOT NULL,
    
    -- Code metadata
    type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    language VARCHAR(50) NOT NULL,
    content TEXT,
    signature TEXT,
    docstring TEXT,
    
    -- Analysis results
    complexity INTEGER DEFAULT 0,
    maintainability_index FLOAT,
    dependencies JSONB DEFAULT '[]',
    dependents JSONB DEFAULT '[]',
    
    -- Security
    has_security_issues BOOLEAN DEFAULT FALSE,
    security_issues JSONB DEFAULT '[]',
    
    -- Testing
    is_tested BOOLEAN DEFAULT FALSE,
    test_coverage FLOAT DEFAULT 0.0,
    
    -- Embeddings
    embedding_id VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_code_elements_repository ON code_elements(repository_id);
CREATE INDEX idx_code_elements_type ON code_elements(type);
CREATE INDEX idx_code_elements_name ON code_elements(name);
CREATE INDEX idx_code_elements_file ON code_elements(file_path);
CREATE INDEX idx_code_elements_language ON code_elements(language);

-- Trigger for updated_at
CREATE TRIGGER update_code_elements_updated_at BEFORE UPDATE ON code_elements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2.5 Documentation Table

```sql
CREATE TABLE documentation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    
    -- Documentation content
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    endpoints JSONB,
    diagram_code TEXT,
    
    -- Generation metadata
    generated_by VARCHAR(100),
    generation_time_ms INTEGER DEFAULT 0,
    model_used VARCHAR(100),
    
    -- Version control
    version INTEGER DEFAULT 1,
    previous_version_id UUID REFERENCES documentation(id),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_documentation_repository ON documentation(repository_id);
CREATE INDEX idx_documentation_type ON documentation(type);
CREATE INDEX idx_documentation_created_at ON documentation(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_documentation_updated_at BEFORE UPDATE ON documentation
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2.6 Agent Executions Table

```sql
CREATE TABLE agent_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_type VARCHAR(50) NOT NULL,
    query_id UUID REFERENCES queries(id) ON DELETE CASCADE,
    repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    
    -- Execution details
    task_description TEXT,
    input_data JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending',
    error_message TEXT,
    
    -- Performance
    execution_time_ms INTEGER DEFAULT 0,
    tokens_used INTEGER DEFAULT 0,
    model_used VARCHAR(100),
    
    -- Results
    confidence_score FLOAT DEFAULT 0.0,
    findings JSONB DEFAULT '[]',
    
    -- Timestamps
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_agent_executions_agent_type ON agent_executions(agent_type);
CREATE INDEX idx_agent_executions_query ON agent_executions(query_id);
CREATE INDEX idx_agent_executions_repository ON agent_executions(repository_id);
CREATE INDEX idx_agent_executions_status ON agent_executions(status);
CREATE INDEX idx_agent_executions_started_at ON agent_executions(started_at DESC);
```

### 2.7 API Keys Table

```sql
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    key_prefix VARCHAR(10) NOT NULL,
    
    -- Permissions
    scopes JSONB DEFAULT '["read"]',
    
    -- Usage limits
    rate_limit INTEGER DEFAULT 100,
    daily_limit INTEGER DEFAULT 10000,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_used TIMESTAMP,
    usage_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_is_active ON api_keys(is_active);
```

---

## 3. Vector Store Schema (ChromaDB)

### 3.1 Collection Structure

```python
# One collection per repository
collection_name = f"repo_{repository_id}"

# Collection metadata
collection_metadata = {
    "repository_id": str(repository_id),
    "repository_name": "example-repo",
    "created_at": "2026-05-16T00:00:00Z",
    "last_updated": "2026-05-16T00:00:00Z"
}

# Document structure
{
    "ids": ["elem_uuid_1", "elem_uuid_2", ...],
    
    "embeddings": [
        [0.1, 0.2, ..., 0.768],  # 768-dimensional vectors
        [0.3, 0.4, ..., 0.768],
        ...
    ],
    
    "metadatas": [
        {
            "file_path": "src/auth.py",
            "element_type": "function",
            "element_name": "authenticate_user",
            "line_start": 15,
            "line_end": 45,
            "language": "python",
            "complexity": 8,
            "dependencies": ["hash_password", "verify_token"],
            "has_security_issues": False,
            "is_tested": True,
            "last_modified": "2026-05-15T10:30:00Z"
        },
        ...
    ],
    
    "documents": [
        "def authenticate_user(username, password):\n    ...",
        ...
    ]
}
```

### 3.2 Query Operations

```python
# Similarity search
results = collection.query(
    query_embeddings=[[0.1, 0.2, ..., 0.768]],
    n_results=10,
    where={"language": "python"},
    where_document={"$contains": "authentication"}
)

# Metadata filtering
results = collection.query(
    query_embeddings=[[0.1, 0.2, ..., 0.768]],
    n_results=10,
    where={
        "$and": [
            {"language": "python"},
            {"complexity": {"$gte": 5}},
            {"has_security_issues": False}
        ]
    }
)
```

---

## 4. Cache Schema (Redis)

### 4.1 Session State

```python
# Key format
session_key = f"session:{user_id}"

# Value (JSON)
session_data = {
    "user_id": str(user_id),
    "repository_id": str(repository_id),
    "last_activity": "2026-05-16T00:00:00Z",
    "preferences": {
        "theme": "dark",
        "language": "en"
    }
}

# TTL: 24 hours
redis.setex(session_key, 86400, json.dumps(session_data))
```

### 4.2 Query Cache

```python
# Key format
cache_key = f"query:{hash(query_text)}:{repository_id}"

# Value (JSON)
cache_data = {
    "response": "...",
    "citations": [...],
    "confidence_score": 0.95,
    "timestamp": "2026-05-16T00:00:00Z"
}

# TTL: 1 hour
redis.setex(cache_key, 3600, json.dumps(cache_data))
```

### 4.3 Rate Limiting

```python
# Key format
rate_limit_key = f"rate_limit:{user_id}:{endpoint}"

# Increment counter
redis.incr(rate_limit_key)
redis.expire(rate_limit_key, 60)  # 1 minute window

# Check limit
current_count = redis.get(rate_limit_key)
if current_count > rate_limit:
    raise RateLimitExceeded()
```

---

## 5. State Management

### 5.1 Frontend State (Zustand)

```typescript
// Auth Store
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

// Repository Store
interface RepositoryState {
  repositories: Repository[];
  currentRepository: Repository | null;
  isLoading: boolean;
  error: string | null;
  
  fetchRepositories: () => Promise<void>;
  selectRepository: (id: string) => void;
  uploadRepository: (data: RepositoryUpload) => Promise<void>;
  deleteRepository: (id: string) => Promise<void>;
}

// Chat Store
interface ChatState {
  messages: Message[];
  isStreaming: boolean;
  currentQuery: string;
  
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;
  rateMessage: (messageId: string, rating: number) => Promise<void>;
}

// UI Store
interface UIState {
  theme: 'light' | 'dark' | 'auto';
  sidebarOpen: boolean;
  activeTab: string;
  
  setTheme: (theme: string) => void;
  toggleSidebar: () => void;
  setActiveTab: (tab: string) => void;
}
```

### 5.2 Backend State (In-Memory)

```python
# Agent orchestrator state
class OrchestratorState:
    active_tasks: Dict[str, Task] = {}
    agent_pool: Dict[str, Agent] = {}
    task_queue: asyncio.Queue = asyncio.Queue()
    
# Processing state
class ProcessingState:
    active_repositories: Set[UUID] = set()
    processing_queue: asyncio.Queue = asyncio.Queue()
    worker_pool: List[Worker] = []
```

---

## 6. Data Relationships

### 6.1 Entity Relationship Diagram

```
User (1) ──────< (N) Repository
  │                    │
  │                    │
  └──< (N) Query       │
         │             │
         │             └──< (N) CodeElement
         │             │
         │             └──< (1) Documentation
         │             │
         │             └──< (N) AgentExecution
         │
         └──< (N) AgentExecution

User (1) ──────< (N) APIKey
```

### 6.2 Cascade Rules

- **User deletion**: CASCADE to repositories, queries, api_keys
- **Repository deletion**: CASCADE to queries, code_elements, documentation, agent_executions
- **Query deletion**: CASCADE to agent_executions

---

## 7. Data Validation Rules

### 7.1 User Validation

- Email: Valid email format, unique
- Username: 3-100 characters, alphanumeric + underscore, unique
- Password: Minimum 8 characters, at least one uppercase, one lowercase, one number

### 7.2 Repository Validation

- Name: 1-255 characters, required
- URL: Valid GitHub URL format (if provided)
- File count: >= 0
- Line count: >= 0
- Size: >= 0 bytes

### 7.3 Query Validation

- Text: 1-10000 characters, required
- Confidence score: 0.0-1.0
- User rating: 1-5 (if provided)

### 7.4 Code Element Validation

- File path: Valid path format, required
- Line start: >= 1
- Line end: >= line_start
- Complexity: >= 0
- Test coverage: 0.0-1.0

---

## Next Steps

1. Implement Pydantic models in [`backend/src/models/`](../../backend/src/models/)
2. Create database migrations in [`backend/src/db/migrations/`](../../backend/src/db/migrations/)
3. Set up ChromaDB collections
4. Configure Redis caching
5. Implement state management stores

For more details, see the main project plan in [`REPOMIND_AI_PROJECT_PLAN.md`](../../REPOMIND_AI_PROJECT_PLAN.md).