from abc import ABC, abstractmethod
from typing import Any, Dict, Optional, List
from pydantic import BaseModel
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class AgentInput(BaseModel):
    """Base model for agent input with validation."""
    data: Dict[str, Any]
    context: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None

    class Config:
        arbitrary_types_allowed = True


class AgentOutput(BaseModel):
    """Base model for agent output with metadata."""
    data: Dict[str, Any]
    metrics: Dict[str, Any] = {}
    error: Optional[str] = None
    success: bool = True

    class Config:
        arbitrary_types_allowed = True


class AgentMetrics(BaseModel):
    """Metrics produced by agent execution."""
    tokens_used: int = 0
    estimated_cost: float = 0.0
    latency_ms: float = 0.0
    provider_used: Optional[str] = None


class BaseAgent(ABC):
    """
    Abstract base class for all agents.
    Defines the contract that all agents must implement.
    """

    name: str
    description: str = ""

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """Initialize agent with optional configuration."""
        self.config = config or {}
        self.logger = logging.getLogger(self.__class__.__name__)

    @abstractmethod
    def validate_input(self, agent_input: AgentInput) -> bool:
        """
        Validate that input meets agent requirements.
        Raise ValueError if invalid.
        """
        pass

    @abstractmethod
    def execute(self, agent_input: AgentInput) -> AgentOutput:
        """
        Execute the agent logic.
        
        Args:
            agent_input: Validated input for the agent
            
        Returns:
            AgentOutput with result and metrics
            
        Raises:
            Exception if execution fails (caught and logged)
        """
        pass

    @abstractmethod
    def validate_output(self, output: AgentOutput) -> bool:
        """
        Validate that output meets requirements.
        Raise ValueError if invalid.
        """
        pass

    def estimate_cost(self, agent_input: AgentInput) -> float:
        """Estimate cost of execution. Override if applicable."""
        return 0.0

    def get_metrics(self) -> AgentMetrics:
        """Return agent metrics. Override to provide custom metrics."""
        return AgentMetrics()

    def health_check(self) -> bool:
        """Check if agent is healthy and can execute. Override if needed."""
        return True

    def __call__(self, agent_input: AgentInput) -> AgentOutput:
        """
        Execute agent with full validation pipeline.
        This is the main entry point for agent execution.
        """
        try:
            # Validate input
            if not self.validate_input(agent_input):
                raise ValueError(f"Invalid input for {self.name}")

            # Execute
            output = self.execute(agent_input)

            # Validate output
            if not self.validate_output(output):
                raise ValueError(f"Invalid output from {self.name}")

            return output

        except Exception as exc:
            self.logger.error(f"Agent execution failed: {exc}", exc_info=True)
            return AgentOutput(
                data={},
                error=str(exc),
                success=False
            )

    def get_config(self, key: str, default: Any = None) -> Any:
        """Helper to get config value with default."""
        return self.config.get(key, default)

    def set_config(self, key: str, value: Any) -> None:
        """Helper to set config value."""
        self.config[key] = value
