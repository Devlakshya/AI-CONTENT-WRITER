from typing import Dict, Any, Optional
from datetime import datetime
import logging
import time

logger = logging.getLogger(__name__)


class ExecutionEngine:
    """
    Orchestrates execution of agents within workflows.
    Handles retries, timeouts, and error handling.
    """

    def __init__(self, max_retries: int = 3, timeout_seconds: int = 300):
        """
        Initialize execution engine.
        
        Args:
            max_retries: Max number of retries on failure
            timeout_seconds: Timeout for agent execution
        """
        self.max_retries = max_retries
        self.timeout_seconds = timeout_seconds

    def execute_agent(
        self,
        agent,
        agent_input,
        idempotency_key: Optional[str] = None,
        db_session=None
    ) -> Dict[str, Any]:
        """
        Execute an agent with retry logic and timeout handling.
        
        Args:
            agent: Agent instance to execute
            agent_input: Input for agent
            idempotency_key: For idempotency tracking
            db_session: Database session for recording execution
            
        Returns:
            Dict with result, metrics, and execution info
        """
        start_time = datetime.utcnow()
        retries = 0
        last_error = None

        while retries <= self.max_retries:
            try:
                logger.info(f"Executing agent (attempt {retries + 1}/{self.max_retries + 1})")

                # Check idempotency
                if idempotency_key and db_session:
                    existing = self._check_idempotency(db_session, idempotency_key)
                    if existing:
                        logger.info(f"Found idempotent execution, returning cached result")
                        return existing

                # Execute agent
                start = time.time()
                output = agent(agent_input)
                latency = (time.time() - start) * 1000  # ms

                if output.success:
                    logger.info(f"Agent execution succeeded (latency: {latency:.2f}ms)")
                    
                    result = {
                        'success': True,
                        'data': output.data,
                        'metrics': output.metrics or {},
                        'latency_ms': latency,
                        'retries': retries,
                        'error': None,
                    }

                    # Cache if idempotent
                    if idempotency_key and db_session:
                        self._cache_execution(db_session, idempotency_key, result)

                    return result
                else:
                    # Agent returned error but didn't raise
                    raise RuntimeError(f"Agent error: {output.error}")

            except Exception as exc:
                last_error = exc
                logger.warning(f"Agent execution failed (attempt {retries + 1}): {exc}")
                retries += 1

                if retries > self.max_retries:
                    logger.error(f"Max retries exceeded: {last_error}")
                    break

                # Exponential backoff
                backoff = 2 ** retries
                logger.info(f"Retrying after {backoff}s")
                time.sleep(backoff)

        # All retries failed
        elapsed = (datetime.utcnow() - start_time).total_seconds()
        return {
            'success': False,
            'data': None,
            'metrics': {},
            'latency_ms': elapsed * 1000,
            'retries': retries,
            'error': str(last_error),
        }

    def _check_idempotency(self, db_session, idempotency_key: str) -> Optional[Dict[str, Any]]:
        """Check if execution already exists (idempotency check)."""
        # TODO: Query execution cache by idempotency key
        return None

    def _cache_execution(self, db_session, idempotency_key: str, result: Dict[str, Any]) -> None:
        """Cache successful execution for idempotency."""
        # TODO: Store result with idempotency key
        pass


# Singleton instance
execution_engine = ExecutionEngine()
