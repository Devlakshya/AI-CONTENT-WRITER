from typing import Dict, Any, Optional
import logging
from app.services.agents.agent_registry import agent_registry
from app.services.agents.base_agent import BaseAgent

logger = logging.getLogger(__name__)


class AgentFactory:
    """
    Factory for creating agent instances.
    Supports dependency injection and configuration.
    """

    @staticmethod
    def create(agent_name: str, config: Optional[Dict[str, Any]] = None) -> BaseAgent:
        """
        Create an agent instance.
        
        Args:
            agent_name: Name of the agent to create
            config: Optional configuration dict
            
        Returns:
            Agent instance
            
        Raises:
            RuntimeError if agent not found or creation fails
        """
        agent_class = agent_registry.get(agent_name)
        
        if not agent_class:
            raise RuntimeError(f"Agent '{agent_name}' not registered")

        try:
            agent = agent_class(config=config)
            logger.info(f"Created agent instance: {agent_name}")
            return agent
        except Exception as exc:
            logger.error(f"Failed to create agent {agent_name}: {exc}")
            raise RuntimeError(f"Failed to create agent '{agent_name}': {str(exc)}")

    @staticmethod
    def create_batch(agents: Dict[str, Dict[str, Any]]) -> Dict[str, BaseAgent]:
        """
        Create multiple agent instances.
        
        Args:
            agents: Dict mapping agent_name -> config
            
        Returns:
            Dict mapping agent_name -> agent_instance
        """
        instances = {}
        for name, config in agents.items():
            try:
                instances[name] = AgentFactory.create(name, config)
            except RuntimeError as e:
                logger.error(f"Failed to create agent batch entry {name}: {e}")
                raise
        return instances


# Singleton instance
agent_factory = AgentFactory()
