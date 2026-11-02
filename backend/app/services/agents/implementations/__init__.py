"""
Agent Implementations Initialization

Registers all built-in agents with the agent registry.
"""

from app.services.agents.agent_registry import agent_registry
from app.services.agents.implementations.content_agents import (
    ResearchAgent,
    KeywordResearchAgent,
    OutlineAgent,
    WriterAgent,
    SEOAgent,
    EditorAgent,
    FactCheckAgent,
    SummarizerAgent,
    TranslatorAgent,
    SocialMediaAgent,
    EmailCampaignAgent,
    ContentRepurposingAgent,
)


def register_all_agents():
    """Register all built-in agents with the registry."""
    
    agents = [
        ResearchAgent,
        KeywordResearchAgent,
        OutlineAgent,
        WriterAgent,
        SEOAgent,
        EditorAgent,
        FactCheckAgent,
        SummarizerAgent,
        TranslatorAgent,
        SocialMediaAgent,
        EmailCampaignAgent,
        ContentRepurposingAgent,
    ]
    
    for agent_class in agents:
        agent_registry.register(agent_class.name, agent_class)


__all__ = [
    'ResearchAgent',
    'KeywordResearchAgent',
    'OutlineAgent',
    'WriterAgent',
    'SEOAgent',
    'EditorAgent',
    'FactCheckAgent',
    'SummarizerAgent',
    'TranslatorAgent',
    'SocialMediaAgent',
    'EmailCampaignAgent',
    'ContentRepurposingAgent',
    'register_all_agents',
]
