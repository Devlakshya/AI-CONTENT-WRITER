"""
Agent and Workflow System Demo

Demonstrates using the agent framework and workflow engine together.
This serves as both documentation and a working example.

Run with: python -m pytest backend/tests/test_agent_system.py -v
Or directly: python backend/demo_agent_workflow.py
"""

import logging
from app.services.agents.base_agent import AgentInput, AgentOutput
from app.services.agents.agent_factory import agent_factory
from app.services.agents.context_manager import context_manager
from app.services.agents.execution_engine import execution_engine
from app.services.workflows.builder import WorkflowBuilder
from app.services.workflows.templates import get_workflow_template

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def demo_single_agent():
    """Demo: Execute a single agent."""
    logger.info("\n" + "="*60)
    logger.info("DEMO 1: Single Agent Execution")
    logger.info("="*60)
    
    # Create an agent
    agent = agent_factory.create('research', config={
        'max_sources': 5,
        'include_rag': True
    })
    
    # Create input
    agent_input = AgentInput(
        data={'topic': 'Python Best Practices'},
        context={'workspace_id': 1}
    )
    
    # Execute
    logger.info(f"Executing agent: {agent.name}")
    logger.info(f"Input: {agent_input.data}")
    
    output = agent(agent_input)
    
    logger.info(f"Success: {output.success}")
    logger.info(f"Output: {output.data}")
    if output.error:
        logger.error(f"Error: {output.error}")


def demo_agent_pipeline():
    """Demo: Chain multiple agents together (manual)."""
    logger.info("\n" + "="*60)
    logger.info("DEMO 2: Agent Pipeline (Manual Chaining)")
    logger.info("="*60)
    
    topic = "Machine Learning for Beginners"
    
    # Step 1: Research Agent
    logger.info(f"\nStep 1: Research on '{topic}'")
    research_agent = agent_factory.create('research')
    research_input = AgentInput(data={'topic': topic})
    research_output = research_agent(research_input)
    logger.info(f"Research findings: {research_output.data.get('findings')}")
    
    # Step 2: Keyword Research Agent
    logger.info(f"\nStep 2: Keyword Research")
    keyword_agent = agent_factory.create('keyword_research')
    keyword_input = AgentInput(data={'topic': topic})
    keyword_output = keyword_agent(keyword_input)
    logger.info(f"Keywords: {keyword_output.data.get('primary_keywords')}")
    
    # Step 3: Outline Agent
    logger.info(f"\nStep 3: Generate Outline")
    outline_agent = agent_factory.create('outline')
    outline_input = AgentInput(
        data={
            'topic': topic,
            'research': research_output.data,
            'keywords': keyword_output.data.get('primary_keywords', [])
        }
    )
    outline_output = outline_agent(outline_input)
    logger.info(f"Outline sections: {len(outline_output.data.get('sections', []))}")
    
    # Step 4: Writer Agent
    logger.info(f"\nStep 4: Write Content")
    writer_agent = agent_factory.create('writer')
    writer_input = AgentInput(
        data={
            'outline': outline_output.data,
            'research': research_output.data,
            'tone': 'educational'
        }
    )
    writer_output = writer_agent(writer_input)
    logger.info(f"Content written: {writer_output.data.get('word_count')} words")
    
    logger.info("\n✓ Agent pipeline completed successfully")


def demo_workflow_graph():
    """Demo: Build and validate a workflow graph."""
    logger.info("\n" + "="*60)
    logger.info("DEMO 3: Workflow Graph Building and Validation")
    logger.info("="*60)
    
    builder = WorkflowBuilder(
        name="Product Review Generator",
        description="Generate SEO-optimized product reviews"
    )
    
    logger.info("Building workflow...")
    
    workflow = (builder
        .start()
        .agent(agent_id=1, node_id="research", config={'max_sources': 10})
        .agent(agent_id=2, node_id="keywords")
        .agent(agent_id=3, node_id="outline")
        .agent(agent_id=4, node_id="write", config={'tone': 'persuasive', 'word_count': 1500})
        .agent(agent_id=5, node_id="seo")
        .agent(agent_id=6, node_id="edit")
        .agent(agent_id=7, node_id="factcheck")
        .end()
        .connect("start", "research")
        .connect("research", "keywords")
        .connect("keywords", "outline")
        .connect("outline", "write")
        .connect("write", "seo")
        .connect("seo", "edit")
        .connect("edit", "factcheck")
        .connect("factcheck", "end")
        .build()
    )
    
    logger.info(f"Workflow built: {len(workflow.nodes)} nodes")
    logger.info(f"Start node: {workflow.start_node}")
    logger.info(f"End nodes: {workflow.end_nodes}")
    
    # Validate
    is_valid, errors = workflow.validate()
    logger.info(f"Validation: {'✓ Valid' if is_valid else '✗ Invalid'}")
    if errors:
        for error in errors:
            logger.error(f"  - {error}")
    
    # Show graph structure
    logger.info("\nWorkflow structure:")
    for node_id, node in workflow.nodes.items():
        next_nodes = workflow.get_next_nodes(node_id)
        logger.info(f"  {node_id} ({node.node_type.value}) -> {next_nodes}")


def demo_workflow_templates():
    """Demo: Use pre-built workflow templates."""
    logger.info("\n" + "="*60)
    logger.info("DEMO 4: Pre-built Workflow Templates")
    logger.info("="*60)
    
    templates = ['blog_generator', 'social_media', 'email_campaign', 'content_repurposing', 'multilingual']
    
    for template_name in templates:
        logger.info(f"\nLoading template: {template_name}")
        workflow = get_workflow_template(template_name)
        logger.info(f"  Nodes: {len(workflow.nodes)}")
        logger.info(f"  Start: {workflow.start_node}")
        logger.info(f"  Ends: {workflow.end_nodes}")
        
        # Show node sequence
        path = []
        current = workflow.start_node
        while current and current not in path:
            path.append(current)
            next_nodes = workflow.get_next_nodes(current)
            current = next_nodes[0] if next_nodes else None
        
        logger.info(f"  Path: {' -> '.join(path)}")


def demo_context_and_memory():
    """Demo: Context and memory management."""
    logger.info("\n" + "="*60)
    logger.info("DEMO 5: Context and Memory Management")
    logger.info("="*60)
    
    # Create context
    logger.info("Creating execution context...")
    ctx = context_manager.create_context(
        workflow_execution_id=1,
        initial_step="research",
        initial_vars={'topic': 'AI Safety', 'audience': 'technical'}
    )
    
    logger.info(f"Context created: {ctx}")
    logger.info(f"Variables: {ctx.variables}")
    
    # Set and get variables
    logger.info("\nManipulating context...")
    ctx.set_variable('research_complete', True)
    logger.info(f"Set variable: research_complete = True")
    
    ctx.set_output('research', {'findings': 'Safety is critical'})
    logger.info(f"Set output from research step")
    
    logger.info(f"Get output: {ctx.get_output('research')}")
    
    # Retrieve context
    retrieved = context_manager.get_context(1)
    logger.info(f"Retrieved context: {retrieved is not None}")


def demo_error_handling():
    """Demo: Error handling and retry logic."""
    logger.info("\n" + "="*60)
    logger.info("DEMO 6: Error Handling and Retry Logic")
    logger.info("="*60)
    
    # Execute with invalid input
    logger.info("Testing error handling with invalid input...")
    agent = agent_factory.create('research')
    
    invalid_input = AgentInput(data={})  # Missing required 'topic'
    
    logger.info("Executing with invalid input...")
    output = agent(invalid_input)
    
    logger.info(f"Success: {output.success}")
    logger.info(f"Error: {output.error}")
    
    logger.info("\n✓ Error handling works correctly")


def run_all_demos():
    """Run all demonstrations."""
    logger.info("\n\n")
    logger.info("╔" + "="*58 + "╗")
    logger.info("║" + " "*58 + "║")
    logger.info("║" + "  Agent & Workflow System Demonstration  ".center(58) + "║")
    logger.info("║" + " "*58 + "║")
    logger.info("╚" + "="*58 + "╝")
    
    try:
        demo_single_agent()
        demo_agent_pipeline()
        demo_workflow_graph()
        demo_workflow_templates()
        demo_context_and_memory()
        demo_error_handling()
        
        logger.info("\n\n")
        logger.info("╔" + "="*58 + "╗")
        logger.info("║" + " "*58 + "║")
        logger.info("║" + "  All Demonstrations Completed Successfully! ✓  ".center(58) + "║")
        logger.info("║" + " "*58 + "║")
        logger.info("╚" + "="*58 + "╝")
        
    except Exception as exc:
        logger.error(f"\nDemo failed: {exc}", exc_info=True)
        raise


if __name__ == '__main__':
    # Initialize agent system first
    from app.services.agents.bootstrap import bootstrap_agent_system
    bootstrap_agent_system()
    
    # Run all demos
    run_all_demos()
