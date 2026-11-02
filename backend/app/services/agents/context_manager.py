from typing import Dict, Any, Optional, List
from dataclasses import dataclass, field
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


@dataclass
class ExecutionContext:
    """
    Stores execution context and state.
    Passed between agents in a workflow.
    """
    workflow_execution_id: int
    current_step: str
    variables: Dict[str, Any] = field(default_factory=dict)
    previous_outputs: Dict[str, Any] = field(default_factory=dict)
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.utcnow)

    def set_variable(self, key: str, value: Any) -> None:
        """Set a variable in context."""
        self.variables[key] = value
        logger.debug(f"Set variable: {key}")

    def get_variable(self, key: str, default: Any = None) -> Any:
        """Get a variable from context."""
        return self.variables.get(key, default)

    def set_output(self, step_id: str, output: Any) -> None:
        """Store output from a step."""
        self.previous_outputs[step_id] = output
        logger.debug(f"Stored output from step: {step_id}")

    def get_output(self, step_id: str) -> Optional[Any]:
        """Retrieve output from a previous step."""
        return self.previous_outputs.get(step_id)

    def to_dict(self) -> Dict[str, Any]:
        """Convert context to dict."""
        return {
            'workflow_execution_id': self.workflow_execution_id,
            'current_step': self.current_step,
            'variables': self.variables,
            'previous_outputs': self.previous_outputs,
            'metadata': self.metadata,
        }


class ContextManager:
    """
    Manages execution contexts during workflow execution.
    Handles context creation, storage, and retrieval.
    """

    def __init__(self):
        self._contexts: Dict[int, ExecutionContext] = {}

    def create_context(
        self,
        workflow_execution_id: int,
        initial_step: str,
        initial_vars: Optional[Dict[str, Any]] = None
    ) -> ExecutionContext:
        """
        Create a new execution context.
        
        Args:
            workflow_execution_id: ID of the workflow execution
            initial_step: First step ID
            initial_vars: Optional initial variables
            
        Returns:
            ExecutionContext instance
        """
        context = ExecutionContext(
            workflow_execution_id=workflow_execution_id,
            current_step=initial_step,
            variables=initial_vars or {}
        )
        self._contexts[workflow_execution_id] = context
        logger.info(f"Created context for execution: {workflow_execution_id}")
        return context

    def get_context(self, workflow_execution_id: int) -> Optional[ExecutionContext]:
        """Get existing context."""
        return self._contexts.get(workflow_execution_id)

    def update_step(self, workflow_execution_id: int, step_id: str) -> None:
        """Update current step in context."""
        ctx = self.get_context(workflow_execution_id)
        if ctx:
            ctx.current_step = step_id
            logger.debug(f"Updated context step to: {step_id}")

    def cleanup(self, workflow_execution_id: int) -> None:
        """Clean up context after execution."""
        if workflow_execution_id in self._contexts:
            del self._contexts[workflow_execution_id]
            logger.info(f"Cleaned up context for execution: {workflow_execution_id}")


# Singleton instance
context_manager = ContextManager()
