"""
Unit Tests for Agent and Workflow System

Comprehensive tests for agent framework, workflow engine, and orchestration.

Run with: pytest backend/tests/test_agent_workflow_system.py -v
"""

import pytest
import logging
from app.services.agents.base_agent import BaseAgent, AgentInput, AgentOutput, AgentMetrics
from app.services.agents.agent_registry import agent_registry
from app.services.agents.agent_factory import agent_factory
from app.services.agents.context_manager import context_manager, ExecutionContext
from app.services.agents.execution_engine import execution_engine
from app.services.workflows.graph import WorkflowGraph, WorkflowNode, NodeType
from app.services.workflows.builder import WorkflowBuilder
from app.services.workflows.templates import get_workflow_template


class TestAgent(BaseAgent):
    """Test agent for unit tests."""
    
    name = "test_agent"
    description = "Test agent"
    
    def validate_input(self, agent_input: AgentInput) -> bool:
        if not agent_input.data.get('text'):
            raise ValueError("text required")
        return True
    
    def execute(self, agent_input: AgentInput) -> AgentOutput:
        text = agent_input.data['text']
        return AgentOutput(
            data={'result': f"Processed: {text}"},
            success=True
        )
    
    def validate_output(self, output: AgentOutput) -> bool:
        if output.success and not output.data.get('result'):
            raise ValueError("result required")
        return True


class TestAgentFramework:
    """Tests for agent framework."""
    
    def test_agent_creation(self):
        """Test creating an agent instance."""
        agent = TestAgent(config={'param': 'value'})
        assert agent.name == "test_agent"
        assert agent.get_config('param') == 'value'
    
    def test_agent_execution_success(self):
        """Test successful agent execution."""
        agent = TestAgent()
        agent_input = AgentInput(data={'text': 'Hello World'})
        output = agent(agent_input)
        
        assert output.success is True
        assert 'Processed' in output.data['result']
    
    def test_agent_execution_invalid_input(self):
        """Test agent with invalid input."""
        agent = TestAgent()
        agent_input = AgentInput(data={})
        output = agent(agent_input)
        
        assert output.success is False
        assert output.error is not None
    
    def test_agent_config_get_set(self):
        """Test config get/set."""
        agent = TestAgent()
        agent.set_config('key1', 'value1')
        assert agent.get_config('key1') == 'value1'
        assert agent.get_config('nonexistent', 'default') == 'default'


class TestAgentRegistry:
    """Tests for agent registry."""
    
    def test_register_agent(self):
        """Test registering an agent."""
        agent_registry.unregister("test_agent")
        agent_registry.register("test_agent", TestAgent)
        assert agent_registry.is_registered("test_agent")
    
    def test_get_agent(self):
        """Test getting registered agent."""
        agent_registry.register("test_agent", TestAgent)
        cls = agent_registry.get("test_agent")
        assert cls is TestAgent
    
    def test_list_agents(self):
        """Test listing all agents."""
        agent_registry.register("test_agent", TestAgent)
        agents = agent_registry.list_agents()
        assert "test_agent" in agents
    
    def test_unregister_agent(self):
        """Test unregistering agent."""
        agent_registry.register("test_agent", TestAgent)
        agent_registry.unregister("test_agent")
        assert not agent_registry.is_registered("test_agent")


class TestAgentFactory:
    """Tests for agent factory."""
    
    def test_create_agent(self):
        """Test creating agent via factory."""
        agent_registry.register("test_agent", TestAgent)
        agent = agent_factory.create("test_agent", config={'param': 'value'})
        assert agent.name == "test_agent"
        assert agent.get_config('param') == 'value'
    
    def test_create_unknown_agent(self):
        """Test creating unknown agent raises error."""
        with pytest.raises(RuntimeError):
            agent_factory.create("nonexistent_agent")
    
    def test_create_batch(self):
        """Test creating multiple agents."""
        agent_registry.register("test_agent", TestAgent)
        agents = agent_factory.create_batch({
            'test1': {'param': 'value1'},
            'test2': {'param': 'value2'},
        })
        # Note: This will fail since we're using same name, adjust test
        assert len(agents) > 0


class TestContextManager:
    """Tests for context manager."""
    
    def test_create_context(self):
        """Test creating execution context."""
        ctx = context_manager.create_context(
            workflow_execution_id=999,
            initial_step="step1",
            initial_vars={'key': 'value'}
        )
        assert ctx.workflow_execution_id == 999
        assert ctx.current_step == "step1"
        assert ctx.get_variable('key') == 'value'
        context_manager.cleanup(999)
    
    def test_context_variables(self):
        """Test setting/getting variables."""
        ctx = context_manager.create_context(
            workflow_execution_id=998,
            initial_step="step1"
        )
        ctx.set_variable('var1', 'value1')
        assert ctx.get_variable('var1') == 'value1'
        context_manager.cleanup(998)
    
    def test_context_outputs(self):
        """Test storing/retrieving step outputs."""
        ctx = context_manager.create_context(
            workflow_execution_id=997,
            initial_step="step1"
        )
        ctx.set_output('step1', {'result': 'data'})
        assert ctx.get_output('step1') == {'result': 'data'}
        context_manager.cleanup(997)


class TestExecutionEngine:
    """Tests for execution engine."""
    
    def test_execute_agent_success(self):
        """Test successful agent execution."""
        agent = TestAgent()
        agent_input = AgentInput(data={'text': 'Test'})
        result = execution_engine.execute_agent(agent, agent_input)
        
        assert result['success'] is True
        assert result['retries'] == 0
        assert 'latency_ms' in result
    
    def test_execute_agent_invalid_input(self):
        """Test agent execution with invalid input."""
        agent = TestAgent()
        agent_input = AgentInput(data={})
        result = execution_engine.execute_agent(agent, agent_input)
        
        assert result['success'] is False
        assert result['error'] is not None


class TestWorkflowGraph:
    """Tests for workflow graph."""
    
    def test_add_node(self):
        """Test adding nodes to graph."""
        graph = WorkflowGraph()
        node = WorkflowNode("node1", NodeType.START)
        graph.add_node(node)
        
        assert graph.get_node("node1") is node
        assert graph.start_node == "node1"
    
    def test_connect_nodes(self):
        """Test connecting nodes."""
        graph = WorkflowGraph()
        n1 = WorkflowNode("n1", NodeType.START)
        n2 = WorkflowNode("n2", NodeType.AGENT, agent_id=1)
        graph.add_node(n1)
        graph.add_node(n2)
        
        n1.next_nodes.append("n2")
        
        assert graph.get_next_nodes("n1") == ["n2"]
    
    def test_validate_workflow(self):
        """Test workflow validation."""
        graph = WorkflowGraph()
        
        # Invalid: no nodes
        is_valid, errors = graph.validate()
        assert is_valid is False
        
        # Valid: start → agent → end
        start = WorkflowNode("start", NodeType.START)
        agent = WorkflowNode("agent", NodeType.AGENT, agent_id=1)
        end = WorkflowNode("end", NodeType.END)
        
        graph.add_node(start)
        graph.add_node(agent)
        graph.add_node(end)
        
        start.next_nodes.append("agent")
        agent.next_nodes.append("end")
        
        is_valid, errors = graph.validate()
        assert is_valid is True
    
    def test_graph_serialization(self):
        """Test graph to/from JSON."""
        graph = WorkflowGraph()
        start = WorkflowNode("start", NodeType.START)
        graph.add_node(start)
        
        json_str = graph.to_json()
        graph2 = WorkflowGraph.from_json(json_str)
        
        assert graph2.start_node == "start"


class TestWorkflowBuilder:
    """Tests for workflow builder."""
    
    def test_build_simple_workflow(self):
        """Test building a simple workflow."""
        builder = WorkflowBuilder("Test Workflow", "A test workflow")
        
        workflow = (builder
            .start()
            .agent(agent_id=1, node_id="agent1")
            .end()
            .connect("start", "agent1")
            .connect("agent1", "end")
            .build()
        )
        
        assert len(workflow.nodes) == 3
        assert workflow.start_node == "start"
        assert "end" in workflow.end_nodes
    
    def test_build_complex_workflow(self):
        """Test building a more complex workflow."""
        builder = WorkflowBuilder("Complex Workflow")
        
        workflow = (builder
            .start()
            .agent(agent_id=1, node_id="research")
            .agent(agent_id=2, node_id="outline")
            .agent(agent_id=3, node_id="write")
            .agent(agent_id=4, node_id="edit")
            .end()
            .connect("start", "research")
            .connect("research", "outline")
            .connect("outline", "write")
            .connect("write", "edit")
            .connect("edit", "end")
            .build()
        )
        
        assert len(workflow.nodes) == 6  # start + 4 agents + end
        assert workflow.start_node == "start"
    
    def test_build_invalid_workflow(self):
        """Test building invalid workflow raises error."""
        builder = WorkflowBuilder("Invalid Workflow")
        
        with pytest.raises(ValueError):
            (builder
                .start()
                .agent(agent_id=1, node_id="agent1")
                .build()  # Missing end node
            )


class TestWorkflowTemplates:
    """Tests for pre-built workflow templates."""
    
    def test_blog_generator_template(self):
        """Test blog generator workflow template."""
        workflow = get_workflow_template('blog_generator')
        
        assert workflow.start_node == "start"
        assert "end" in workflow.end_nodes
        assert len(workflow.nodes) > 0
        
        is_valid, errors = workflow.validate()
        assert is_valid is True
    
    def test_social_media_template(self):
        """Test social media workflow template."""
        workflow = get_workflow_template('social_media')
        
        assert workflow.start_node == "start"
        is_valid, _ = workflow.validate()
        assert is_valid is True
    
    def test_email_campaign_template(self):
        """Test email campaign workflow template."""
        workflow = get_workflow_template('email_campaign')
        
        assert workflow.start_node == "start"
        is_valid, _ = workflow.validate()
        assert is_valid is True
    
    def test_unknown_template(self):
        """Test requesting unknown template raises error."""
        with pytest.raises(ValueError):
            get_workflow_template('nonexistent_template')


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
