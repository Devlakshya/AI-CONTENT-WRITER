"""
Agent and Workflow System Bootstrap

Initialize and configure the agent/workflow framework on app startup.
"""

from app.services.agents.implementations import register_all_agents
from app.services.agents.agent_factory import agent_factory
import logging

logger = logging.getLogger(__name__)


def bootstrap_agent_system():
    """
    Bootstrap the agent and workflow system.
    
    Called on application startup to:
    - Register all built-in agents
    - Initialize factories and registries
    - Validate agent configurations
    """
    try:
        logger.info("Bootstrapping agent and workflow system...")
        
        # Register all built-in agents
        register_all_agents()
        logger.info("✓ Registered 12 built-in agents")
        
        # Verify agent registry
        agents = agent_factory.create_batch({
            'research': {},
            'writer': {},
            'seo': {},
        })
        logger.info(f"✓ Verified agent factory with {len(agents)} agents")
        
        logger.info("Agent system bootstrap complete")
        return True
        
    except Exception as exc:
        logger.error(f"Failed to bootstrap agent system: {exc}", exc_info=True)
        raise


__all__ = ['bootstrap_agent_system']
