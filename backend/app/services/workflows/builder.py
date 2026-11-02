from typing import Dict, Optional, List
import logging
from app.services.workflows.graph import WorkflowGraph, WorkflowNode, NodeType

logger = logging.getLogger(__name__)


class WorkflowBuilder:
    """
    Fluent builder for constructing workflows.
    Provides clean API for graph creation.
    """

    def __init__(self, name: str, description: str = ""):
        """Initialize builder."""
        self.name = name
        self.description = description
        self.graph = WorkflowGraph()
        self._node_counter = 0

    def _next_node_id(self) -> str:
        """Generate unique node ID."""
        self._node_counter += 1
        return f"node_{self._node_counter}"

    def start(self) -> 'WorkflowBuilder':
        """Add START node."""
        node = WorkflowNode(
            node_id="start",
            node_type=NodeType.START,
        )
        self.graph.add_node(node)
        return self

    def agent(
        self,
        agent_id: int,
        node_id: Optional[str] = None,
        config: Optional[Dict] = None,
    ) -> 'WorkflowBuilder':
        """
        Add AGENT node.
        
        Args:
            agent_id: ID of agent to use
            node_id: Optional custom node ID
            config: Optional agent configuration
            
        Returns:
            self for chaining
        """
        if not node_id:
            node_id = self._next_node_id()

        node = WorkflowNode(
            node_id=node_id,
            node_type=NodeType.AGENT,
            agent_id=agent_id,
            config=config,
        )
        self.graph.add_node(node)
        return self

    def condition(
        self,
        node_id: Optional[str] = None,
        config: Optional[Dict] = None,
    ) -> 'WorkflowBuilder':
        """Add CONDITION node for branching."""
        if not node_id:
            node_id = self._next_node_id()

        node = WorkflowNode(
            node_id=node_id,
            node_type=NodeType.CONDITION,
            config=config,
        )
        self.graph.add_node(node)
        return self

    def delay(
        self,
        seconds: int,
        node_id: Optional[str] = None,
    ) -> 'WorkflowBuilder':
        """Add DELAY node."""
        if not node_id:
            node_id = self._next_node_id()

        node = WorkflowNode(
            node_id=node_id,
            node_type=NodeType.DELAY,
            config={'seconds': seconds},
        )
        self.graph.add_node(node)
        return self

    def approval(
        self,
        node_id: Optional[str] = None,
        config: Optional[Dict] = None,
    ) -> 'WorkflowBuilder':
        """Add APPROVAL node for manual approval."""
        if not node_id:
            node_id = self._next_node_id()

        node = WorkflowNode(
            node_id=node_id,
            node_type=NodeType.APPROVAL,
            config=config,
        )
        self.graph.add_node(node)
        return self

    def end(self, node_id: str = "end") -> 'WorkflowBuilder':
        """Add END node."""
        node = WorkflowNode(
            node_id=node_id,
            node_type=NodeType.END,
        )
        self.graph.add_node(node)
        return self

    def connect(self, from_node_id: str, to_node_id: str, condition: Optional[str] = None) -> 'WorkflowBuilder':
        """
        Connect two nodes.
        
        Args:
            from_node_id: Source node
            to_node_id: Target node
            condition: Optional condition (for conditional routing)
            
        Returns:
            self for chaining
        """
        node = self.graph.get_node(from_node_id)
        if not node:
            raise ValueError(f"Node {from_node_id} not found")

        if condition:
            node.next_nodes_conditional[condition] = to_node_id
        else:
            if to_node_id not in node.next_nodes:
                node.next_nodes.append(to_node_id)

        logger.debug(f"Connected {from_node_id} -> {to_node_id}" + (f" (condition: {condition})" if condition else ""))
        return self

    def build(self) -> WorkflowGraph:
        """
        Build and validate the workflow.
        
        Returns:
            Validated WorkflowGraph
            
        Raises:
            ValueError if validation fails
        """
        is_valid, errors = self.graph.validate()
        if not is_valid:
            error_msg = "Workflow validation failed:\n" + "\n".join(errors)
            logger.error(error_msg)
            raise ValueError(error_msg)

        logger.info(f"Workflow '{self.name}' built successfully ({len(self.graph.nodes)} nodes)")
        return self.graph

    def __repr__(self) -> str:
        """String representation."""
        return f"WorkflowBuilder(name='{self.name}', nodes={len(self.graph.nodes)})"
