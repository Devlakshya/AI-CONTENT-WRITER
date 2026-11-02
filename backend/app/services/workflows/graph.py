from typing import Dict, List, Optional, Tuple
from enum import Enum
import json
import logging

logger = logging.getLogger(__name__)


class NodeType(str, Enum):
    """Types of nodes in a workflow graph."""
    START = "start"
    END = "end"
    AGENT = "agent"
    CONDITION = "condition"
    DELAY = "delay"
    APPROVAL = "approval"
    PARALLEL = "parallel"
    JOIN = "join"


class WorkflowNode:
    """Represents a single node in workflow graph."""

    def __init__(
        self,
        node_id: str,
        node_type: NodeType,
        agent_id: Optional[int] = None,
        config: Optional[Dict] = None,
        next_nodes: Optional[List[str]] = None,
        next_nodes_conditional: Optional[Dict[str, str]] = None,
    ):
        """
        Initialize workflow node.
        
        Args:
            node_id: Unique identifier for node
            node_type: Type of node
            agent_id: Agent ID (for agent nodes)
            config: Node configuration
            next_nodes: List of next node IDs (for sequential flow)
            next_nodes_conditional: Dict mapping condition -> next_node_id (for conditional flow)
        """
        self.node_id = node_id
        self.node_type = node_type
        self.agent_id = agent_id
        self.config = config or {}
        self.next_nodes = next_nodes or []
        self.next_nodes_conditional = next_nodes_conditional or {}

    def to_dict(self) -> Dict:
        """Serialize to dict."""
        return {
            'node_id': self.node_id,
            'node_type': self.node_type.value,
            'agent_id': self.agent_id,
            'config': self.config,
            'next_nodes': self.next_nodes,
            'next_nodes_conditional': self.next_nodes_conditional,
        }

    @staticmethod
    def from_dict(data: Dict) -> 'WorkflowNode':
        """Deserialize from dict."""
        return WorkflowNode(
            node_id=data['node_id'],
            node_type=NodeType(data['node_type']),
            agent_id=data.get('agent_id'),
            config=data.get('config'),
            next_nodes=data.get('next_nodes'),
            next_nodes_conditional=data.get('next_nodes_conditional'),
        )


class WorkflowGraph:
    """Directed acyclic graph (DAG) representing a workflow."""

    def __init__(self):
        """Initialize empty graph."""
        self.nodes: Dict[str, WorkflowNode] = {}
        self.start_node: Optional[str] = None
        self.end_nodes: List[str] = []

    def add_node(self, node: WorkflowNode) -> None:
        """Add node to graph."""
        self.nodes[node.node_id] = node
        
        if node.node_type == NodeType.START:
            self.start_node = node.node_id
        elif node.node_type == NodeType.END:
            self.end_nodes.append(node.node_id)

        logger.debug(f"Added node: {node.node_id} ({node.node_type.value})")

    def get_node(self, node_id: str) -> Optional[WorkflowNode]:
        """Get node by ID."""
        return self.nodes.get(node_id)

    def get_next_nodes(self, node_id: str, condition: Optional[str] = None) -> List[str]:
        """
        Get next nodes for a given node.
        
        Args:
            node_id: Current node ID
            condition: Optional condition for conditional nodes
            
        Returns:
            List of next node IDs
        """
        node = self.get_node(node_id)
        if not node:
            return []

        # Conditional routing
        if condition and node.next_nodes_conditional:
            next_id = node.next_nodes_conditional.get(condition)
            return [next_id] if next_id else []

        # Sequential routing
        return node.next_nodes

    def validate(self) -> Tuple[bool, List[str]]:
        """
        Validate workflow graph.
        
        Returns:
            (is_valid, list_of_errors)
        """
        errors = []

        # Must have start node
        if not self.start_node:
            errors.append("Workflow must have START node")

        # Must have end nodes
        if not self.end_nodes:
            errors.append("Workflow must have at least one END node")

        # All nodes must be reachable
        reachable = self._get_reachable_nodes()
        for node_id in self.nodes:
            if node_id not in reachable:
                errors.append(f"Node {node_id} is not reachable from START")

        # No dead-end nodes (except END)
        for node_id, node in self.nodes.items():
            if node.node_type != NodeType.END:
                next_nodes = self.get_next_nodes(node_id)
                if not next_nodes:
                    errors.append(f"Node {node_id} has no outgoing edges")

        return len(errors) == 0, errors

    def _get_reachable_nodes(self) -> set:
        """BFS to find all reachable nodes from start."""
        if not self.start_node:
            return set()

        visited = set()
        queue = [self.start_node]

        while queue:
            node_id = queue.pop(0)
            if node_id in visited:
                continue
            visited.add(node_id)

            node = self.get_node(node_id)
            if node:
                next_ids = self.get_next_nodes(node_id)
                for next_id in next_ids:
                    if next_id not in visited:
                        queue.append(next_id)

        return visited

    def to_dict(self) -> Dict:
        """Serialize to dict."""
        return {
            'nodes': {node_id: node.to_dict() for node_id, node in self.nodes.items()},
            'start_node': self.start_node,
            'end_nodes': self.end_nodes,
        }

    def to_json(self) -> str:
        """Serialize to JSON string."""
        return json.dumps(self.to_dict())

    @staticmethod
    def from_dict(data: Dict) -> 'WorkflowGraph':
        """Deserialize from dict."""
        graph = WorkflowGraph()
        graph.start_node = data.get('start_node')
        graph.end_nodes = data.get('end_nodes', [])

        for node_data in data.get('nodes', {}).values():
            node = WorkflowNode.from_dict(node_data)
            graph.add_node(node)

        return graph

    @staticmethod
    def from_json(json_str: str) -> 'WorkflowGraph':
        """Deserialize from JSON string."""
        data = json.loads(json_str)
        return WorkflowGraph.from_dict(data)
