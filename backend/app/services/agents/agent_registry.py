from typing import Dict, Type, Optional
import logging

logger = logging.getLogger(__name__)


class AgentRegistry:
    """
    Central registry for all agents.
    Provides lookup and discovery of agents.
    """

    _agents: Dict[str, Type] = {}

    @classmethod
    def register(cls, name: str, agent_class: Type) -> None:
        """
        Register an agent class.
        
        Args:
            name: Unique name for the agent
            agent_class: Agent class to register
            
        Raises:
            ValueError if agent already registered
        """
        if name in cls._agents:
            raise ValueError(f"Agent '{name}' already registered")
        
        cls._agents[name] = agent_class
        logger.info(f"Registered agent: {name}")

    @classmethod
    def get(cls, name: str) -> Optional[Type]:
        """Get agent class by name."""
        return cls._agents.get(name)

    @classmethod
    def list_agents(cls) -> Dict[str, Type]:
        """Get all registered agents."""
        return cls._agents.copy()

    @classmethod
    def is_registered(cls, name: str) -> bool:
        """Check if agent is registered."""
        return name in cls._agents

    @classmethod
    def unregister(cls, name: str) -> None:
        """Unregister an agent (mainly for testing)."""
        if name in cls._agents:
            del cls._agents[name]
            logger.info(f"Unregistered agent: {name}")


# Singleton instance
agent_registry = AgentRegistry()
