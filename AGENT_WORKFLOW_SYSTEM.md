# Agent & Workflow Orchestration System

Complete documentation for the production-grade agent framework and workflow engine.

## Overview

The Agent & Workflow System is a production-ready framework for:
- **Building and managing autonomous AI agents** with consistent interfaces
- **Creating complex workflows** by composing agents into directed acyclic graphs (DAGs)
- **Executing workflows** with automatic retry logic, context management, and memory persistence
- **Monitoring and observing** agent execution with built-in logging and metrics

## Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Workflow Execution                        │
│  (orchestrate_workflow → traverse graph → dispatch agents)   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Execution Engine                           │
│  (retry logic, idempotency, metrics, error handling)         │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┬───────────────────┐
        ↓                   ↓                   ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│ BaseAgent    │  │ Context Mgr  │  │ Memory Manager   │
│ (12 built-in)│  │ (workflow    │  │ (Redis + DB      │
│              │  │  state mgr)  │  │  dual storage)   │
└──────────────┘  └──────────────┘  └──────────────────┘
        ↑
        │ extends
┌──────────────────────────────────────────────────────────────┐
│               Agent Framework                                │
│  - Registry (registration, lookup, listing)                  │
│  - Factory (instantiation with DI)                           │
│  - Base class with validation, execution, error handling     │
└──────────────────────────────────────────────────────────────┘
```

### Workflow Engine

```
┌────────────────────────────────────────────────────────┐
│              WorkflowBuilder (Fluent API)              │
│  .start() → .agent() → .condition() → ... → .end()     │
└────────────────────────────────────────────────────────┘
                      ↓
                      │ builds
                      ↓
┌────────────────────────────────────────────────────────┐
│         WorkflowGraph (DAG Representation)             │
│  - Nodes: START, AGENT, CONDITION, DELAY, PARALLEL    │
│  - Edges: Sequential and conditional connections      │
│  - Validation: reachability, cycles, dead-ends        │
└────────────────────────────────────────────────────────┘
                      ↓
                      │ serializes to
                      ↓
┌────────────────────────────────────────────────────────┐
│         WorkflowVersion (Database Record)              │
│  - Stores graph_json with full node/edge definitions   │
│  - Enables versioning and rollback                     │
└────────────────────────────────────────────────────────┘
```

## Built-in Agents (12)

### Content Generation Pipeline

1. **ResearchAgent** - Researches topic using RAG and knowledge bases
2. **KeywordResearchAgent** - Identifies SEO keywords with metrics
3. **OutlineAgent** - Creates hierarchical content outline
4. **WriterAgent** - Generates main article/content
5. **SEOAgent** - Optimizes content for search engines
6. **EditorAgent** - Polishes grammar, readability, flow
7. **FactCheckAgent** - Verifies factual accuracy
8. **SummarizerAgent** - Creates summaries in multiple lengths
9. **TranslatorAgent** - Translates to multiple languages
10. **SocialMediaAgent** - Creates platform-specific posts
11. **EmailCampaignAgent** - Generates email marketing campaigns
12. **ContentRepurposingAgent** - Converts to video/infographic/podcast/etc

Each agent:
- Validates input with required fields
- Executes with error handling and logging
- Validates output structure
- Returns `AgentOutput` with success/error/metrics

## Quick Start

### 1. Execute Single Agent

```python
from app.services.agents.agent_factory import agent_factory
from app.services.agents.base_agent import AgentInput

# Create agent
agent = agent_factory.create('research', config={
    'max_sources': 10,
    'include_rag': True
})

# Create input
agent_input = AgentInput(
    data={'topic': 'Machine Learning'},
    context={'workspace_id': 1}
)

# Execute
output = agent(agent_input)
print(f"Success: {output.success}")
print(f"Result: {output.data}")
```

### 2. Build Custom Workflow

```python
from app.services.workflows.builder import WorkflowBuilder

builder = WorkflowBuilder("My Workflow", "Description")

workflow = (builder
    .start()
    .agent(agent_id=1, node_id="research")
    .agent(agent_id=4, node_id="writer")
    .agent(agent_id=5, node_id="seo")
    .end()
    .connect("start", "research")
    .connect("research", "writer")
    .connect("writer", "seo")
    .connect("seo", "end")
    .build()
)
```

### 3. Use Pre-built Templates

```python
from app.services.workflows.templates import get_workflow_template

# Blog generator workflow
workflow = get_workflow_template('blog_generator')

# Social media workflow
workflow = get_workflow_template('social_media')

# Email campaign workflow
workflow = get_workflow_template('email_campaign')

# Available: blog_generator, social_media, email_campaign, 
#            content_repurposing, multilingual
```

### 4. Execute Workflow (Celery Task)

```python
# Will be invoked via Celery orchestrator:
# orchestrate_workflow(workflow_execution_id=123)

# Workflow traverses DAG:
# - Retrieves workflow from DB
# - Creates ExecutionContext for state
# - For each node type:
#   - AGENT: Enqueue AgentExecution task, wait for completion
#   - CONDITION: Evaluate condition, route to appropriate next node
#   - DELAY: Schedule delayed execution
#   - PARALLEL: Fan-out multiple tasks
#   - JOIN: Wait for all parallel branches
# - Track outputs in ContextManager
# - Update WorkflowExecution status
```

## Key Concepts

### Agent Lifecycle

```python
class MyAgent(BaseAgent):
    name = "my_agent"
    description = "..."
    
    def validate_input(self, agent_input: AgentInput) -> bool:
        """1. Validate input has required fields"""
        if not agent_input.data.get('required_field'):
            raise ValueError("required_field is required")
        return True
    
    def execute(self, agent_input: AgentInput) -> AgentOutput:
        """2. Execute core logic with error handling"""
        try:
            # Your implementation
            result = process_input(agent_input.data)
            return AgentOutput(data=result, success=True)
        except Exception as exc:
            logger.error(f"Execution failed: {exc}")
            return AgentOutput(data={}, error=str(exc), success=False)
    
    def validate_output(self, output: AgentOutput) -> bool:
        """3. Validate output structure"""
        if output.success and not output.data.get('required_output'):
            raise ValueError("required_output missing")
        return True
```

### Input/Output Models

```python
# AgentInput carries data through workflow
AgentInput(
    data: Dict[str, Any],           # Actual payload
    context: Optional[Dict],         # Workflow context
    metadata: Optional[Dict]         # Execution metadata
)

# AgentOutput returns results consistently
AgentOutput(
    data: Dict[str, Any],           # Result data
    success: bool,                  # Success flag
    error: Optional[str],           # Error message if failed
    metrics: Optional[AgentMetrics] # Performance data
)

# AgentMetrics tracks performance
AgentMetrics(
    tokens_used: int,              # LLM tokens
    estimated_cost: float,         # $ cost
    latency_ms: int,              # Execution time
    provider_used: str            # Which AI provider
)
```

### Workflow Nodes

```python
from app.services.workflows.graph import NodeType, WorkflowNode

# Node types in workflows:
NodeType.START        # Workflow entry point (exactly 1)
NodeType.END          # Workflow exit point (≥1)
NodeType.AGENT        # Execute agent (agent_id required)
NodeType.CONDITION    # Branch based on condition
NodeType.DELAY        # Wait N seconds
NodeType.APPROVAL     # Human approval gate
NodeType.PARALLEL     # Fork multiple branches
NodeType.JOIN         # Wait for all parallel branches

# All nodes have:
WorkflowNode(
    node_id: str,                    # Unique in workflow
    node_type: NodeType,             # Type
    agent_id: Optional[int],         # For AGENT nodes
    config: Dict[str, Any],          # Configuration
    next_nodes: List[str],           # Default next nodes
    next_nodes_conditional: Dict     # Conditional routing
)
```

### Context Management

Workflows need state tracking across steps:

```python
from app.services.agents.context_manager import context_manager

# Create context for workflow execution
ctx = context_manager.create_context(
    workflow_execution_id=123,
    initial_step="research",
    initial_vars={'topic': 'AI Safety'}
)

# Store/retrieve data across steps
ctx.set_variable('research_complete', True)
ctx.set_output('research', {'findings': '...'})

output = ctx.get_output('research')

# Cleanup after execution
context_manager.cleanup(123)
```

### Memory Management

```python
from app.services.agents.memory_manager import memory_manager

# Short-term memory (Redis, fast, per-execution)
memory_manager.set_short_term(
    execution_id=123,
    key="intermediate_result",
    value={'data': '...'},
    ttl_seconds=3600
)

# Long-term memory (Postgres, persistent)
memory_manager.set_long_term(
    db_session=session,
    execution_id=123,
    key="learning",
    value={'insights': '...'},
    ttl_seconds=86400*30  # 30 days
)
```

## Database Models

### Agent-Related

- **agent**: Stores agent definitions (name, slug, description)
- **agent_implementation**: Links to code, input/output schemas
- **agent_execution**: Records individual agent runs with metrics
- **agent_memory**: Persistent state per agent execution

### Workflow-Related

- **workflow**: Workflow metadata (name, description, owner)
- **workflow_version**: Immutable graph snapshots (enables rollback)
- **workflow_step**: Individual steps in workflow version
- **workflow_execution**: Workflow run records (status, inputs, outputs)
- **execution_log**: Detailed logs per workflow execution

### Relationships

```
workflow (1) → (many) workflow_version
            → (many) workflow_execution

workflow_version (1) → (many) workflow_step

workflow_execution (1) → (many) agent_execution
                     → (many) execution_log
                     → (many) agent_memory

agent_execution (1) → (many) agent_memory
```

## API Endpoints (To Implement)

### Workflow CRUD
- `POST /api/v1/workflows` - Create workflow
- `GET /api/v1/workflows` - List user's workflows
- `GET /api/v1/workflows/{id}` - Get workflow details
- `PUT /api/v1/workflows/{id}` - Update workflow
- `DELETE /api/v1/workflows/{id}` - Delete workflow

### Execution
- `POST /api/v1/workflows/{id}/execute` - Start execution
- `GET /api/v1/executions/{id}` - Get execution status
- `GET /api/v1/executions/{id}/logs` - Stream logs
- `POST /api/v1/executions/{id}/cancel` - Cancel running execution

### Monitoring
- `GET /api/v1/analytics/agents` - Agent performance stats
- `GET /api/v1/analytics/workflows` - Workflow metrics
- `GET /api/v1/health/agents` - Agent health checks

## Error Handling

### Validation Errors

```python
# Input validation fails → ExecutionError
AgentInput validation error → ValueError raised
  → Caught in BaseAgent.__call__()
  → Returns AgentOutput(success=False, error="message")
```

### Execution Errors

```python
# Agent execution fails → ExecutionError with retry
try:
    agent.execute(input)
except Exception as e:
    # Logged with full traceback
    # Execution retried with exponential backoff
    # Max retries: 3 (configurable)
    # Backoff: 2^retry_count seconds
```

### Idempotency

```python
# ExecutionEngine tracks idempotency_key
result = execution_engine.execute_agent(
    agent=agent,
    input=agent_input,
    idempotency_key="unique_request_id"
)

# Same key = cached result (prevents duplicate processing)
# Different key = new execution (allows retries with new result)
```

## Performance Considerations

### Caching
- Context stored in memory for fast access
- Short-term memory in Redis for ~1 hour TTL
- Long-term memory in Postgres for persistent storage

### Concurrency
- Workflow steps execute sequentially by default
- PARALLEL nodes enable concurrent agent execution
- JOIN nodes synchronize parallel branches

### Monitoring
- All agent execution logged (success/error/latency)
- Metrics tracked: tokens_used, estimated_cost, latency_ms
- Aggregatable per workflow, per agent, per provider

## Testing

```bash
# Run all tests
pytest backend/tests/test_agent_workflow_system.py -v

# Run specific test class
pytest backend/tests/test_agent_workflow_system.py::TestAgentFramework -v

# Run with coverage
pytest backend/tests/test_agent_workflow_system.py --cov=app.services.agents
```

## Examples

### Example 1: Blog Generator

```python
# Blog generator workflow - research → write → edit
workflow = get_workflow_template('blog_generator')

# Execute with input
execution = workflow_executor.execute(
    workflow_id=workflow.id,
    input={'topic': 'Machine Learning', 'tone': 'technical'}
)

# Monitor execution
status = execution.status  # queued, running, completed, failed
progress = execution.get_progress()  # % complete
logs = execution.get_logs()  # Full execution logs
```

### Example 2: Custom Agent

```python
from app.services.agents.base_agent import BaseAgent, AgentInput, AgentOutput

class AIAnalysisAgent(BaseAgent):
    name = "ai_analyzer"
    description = "Analyzes content with AI insights"
    
    def validate_input(self, agent_input: AgentInput) -> bool:
        if not agent_input.data.get('content'):
            raise ValueError("content required")
        return True
    
    def execute(self, agent_input: AgentInput) -> AgentOutput:
        content = agent_input.data['content']
        
        try:
            # Call LLM provider
            from app.services.ai.provider_factory import provider_factory
            provider = provider_factory.get_provider('openai', api_key='...')
            
            analysis = provider.generate_text(
                prompt=f"Analyze: {content}",
                model='gpt-4',
                max_tokens=500
            )
            
            return AgentOutput(data={'analysis': analysis}, success=True)
        except Exception as exc:
            return AgentOutput(data={}, error=str(exc), success=False)
    
    def validate_output(self, output: AgentOutput) -> bool:
        if output.success and not output.data.get('analysis'):
            raise ValueError("analysis required")
        return True

# Register and use
agent_registry.register('ai_analyzer', AIAnalysisAgent)
agent = agent_factory.create('ai_analyzer')
```

## Integration with Celery

### Task Queuing

```python
# app/tasks/workflow_tasks.py
from celery import shared_task

@shared_task(bind=True)
def orchestrate_workflow(self, execution_id: int):
    """Celery task that orchestrates workflow execution."""
    # 1. Load workflow from DB
    # 2. Create execution context
    # 3. Traverse workflow DAG
    # 4. For each node:
    #    - Dispatch agent_execution task
    #    - Wait for completion
    #    - Store outputs
    # 5. Update workflow execution status
    pass

@shared_task(bind=True)
def execute_agent_task(self, agent_exec_id: int):
    """Celery task that executes single agent."""
    # 1. Load agent execution from DB
    # 2. Create agent instance
    # 3. Call execution_engine.execute_agent()
    # 4. Update agent_execution record
    # 5. Return metrics/results
    pass
```

## Next Steps

1. **Implement Celery Orchestrator** - Traverse DAG, dispatch tasks, handle retries
2. **Create Workflow API Endpoints** - CRUD + execution endpoints
3. **Integrate LLM Providers** - Wire agents to actual AI models
4. **Build Frontend Workflow Builder** - Drag-drop workflow creation
5. **Add Analytics Dashboard** - Performance tracking and insights
6. **Implement Agent Communication** - Inter-agent messaging
7. **Add Testing Suite** - Comprehensive unit/integration tests
8. **Production Hardening** - Rate limiting, distributed locks, tracing

## References

- [Agent Framework Code](../agents/)
- [Workflow Engine Code](../workflows/)
- [Built-in Agents](../agents/implementations/content_agents.py)
- [Demo/Examples](../../demo_agent_workflow.py)
- [Tests](../../tests/test_agent_workflow_system.py)
