from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import logging
import redis
import json

logger = logging.getLogger(__name__)


class MemoryManager:
    """
    Manages agent memory - both short-term (Redis) and long-term (DB).
    """

    def __init__(self, redis_client: Optional[redis.Redis] = None):
        """Initialize memory manager with optional Redis client."""
        self.redis_client = redis_client
        self.namespace = "agent_memory:"

    def _make_key(self, agent_execution_id: int, key: str) -> str:
        """Create a unique Redis key."""
        return f"{self.namespace}{agent_execution_id}:{key}"

    def set_short_term(
        self,
        agent_execution_id: int,
        key: str,
        value: Any,
        ttl_seconds: int = 3600
    ) -> None:
        """
        Store value in short-term memory (Redis).
        
        Args:
            agent_execution_id: ID of agent execution
            key: Memory key
            value: Value to store (will be JSON encoded)
            ttl_seconds: Time to live in seconds
        """
        if not self.redis_client:
            logger.warning("Redis client not available for short-term memory")
            return

        try:
            redis_key = self._make_key(agent_execution_id, key)
            serialized = json.dumps(value)
            self.redis_client.setex(redis_key, ttl_seconds, serialized)
            logger.debug(f"Set short-term memory: {key} (ttl: {ttl_seconds}s)")
        except Exception as exc:
            logger.error(f"Failed to set short-term memory: {exc}")

    def get_short_term(self, agent_execution_id: int, key: str) -> Optional[Any]:
        """Retrieve value from short-term memory."""
        if not self.redis_client:
            return None

        try:
            redis_key = self._make_key(agent_execution_id, key)
            value = self.redis_client.get(redis_key)
            if value:
                return json.loads(value)
            return None
        except Exception as exc:
            logger.error(f"Failed to get short-term memory: {exc}")
            return None

    def delete_short_term(self, agent_execution_id: int, key: str) -> None:
        """Delete short-term memory entry."""
        if not self.redis_client:
            return

        try:
            redis_key = self._make_key(agent_execution_id, key)
            self.redis_client.delete(redis_key)
            logger.debug(f"Deleted short-term memory: {key}")
        except Exception as exc:
            logger.error(f"Failed to delete short-term memory: {exc}")

    def set_long_term(self, db_session, agent_execution_id: int, key: str, value: Any, ttl_seconds: Optional[int] = None) -> None:
        """
        Store value in long-term memory (Database).
        
        Args:
            db_session: Database session
            agent_execution_id: ID of agent execution
            key: Memory key
            value: Value to store
            ttl_seconds: Optional time to live
        """
        try:
            from app.models import AgentMemory
            
            expires_at = None
            if ttl_seconds:
                expires_at = datetime.utcnow() + timedelta(seconds=ttl_seconds)

            memory = AgentMemory(
                agent_execution_id=agent_execution_id,
                key=key,
                value=value,
                ttl_seconds=ttl_seconds,
                expires_at=expires_at
            )
            db_session.add(memory)
            db_session.commit()
            logger.debug(f"Set long-term memory: {key}")
        except Exception as exc:
            logger.error(f"Failed to set long-term memory: {exc}")
            db_session.rollback()

    def get_long_term(self, db_session, agent_execution_id: int, key: str) -> Optional[Any]:
        """Retrieve value from long-term memory."""
        try:
            from app.models import AgentMemory
            from sqlalchemy import and_

            memory = db_session.query(AgentMemory).filter(
                and_(
                    AgentMemory.agent_execution_id == agent_execution_id,
                    AgentMemory.key == key
                )
            ).first()

            if memory:
                # Check if expired
                if memory.expires_at and memory.expires_at < datetime.utcnow():
                    db_session.delete(memory)
                    db_session.commit()
                    return None
                return memory.value
            return None
        except Exception as exc:
            logger.error(f"Failed to get long-term memory: {exc}")
            return None


# Singleton instance (will be initialized with Redis client in app startup)
memory_manager = MemoryManager()
