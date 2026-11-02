"""
Example Workflows

Pre-built workflow templates for common use cases.
"""

from app.services.workflows.builder import WorkflowBuilder
from app.services.agents.base_agent import AgentInput


def create_blog_generator_workflow():
    """
    Blog Generator Workflow
    
    Workflow:
    Start → Research → Keyword Research → Outline → Writer → SEO → Editor → End
    """
    builder = WorkflowBuilder(
        name="Blog Generator",
        description="Complete blog post generation workflow"
    )
    
    workflow = (builder
        .start()
        .agent(agent_id=1, node_id="research", config={
            'max_sources': 10,
            'include_rag': True
        })
        .agent(agent_id=2, node_id="keyword_research")
        .agent(agent_id=3, node_id="outline", config={
            'sections': 5,
            'depth': 3
        })
        .agent(agent_id=4, node_id="writer", config={
            'tone': 'professional',
            'word_count': 2500
        })
        .agent(agent_id=5, node_id="seo")
        .agent(agent_id=6, node_id="editor")
        .end()
        .connect("start", "research")
        .connect("research", "keyword_research")
        .connect("keyword_research", "outline")
        .connect("outline", "writer")
        .connect("writer", "seo")
        .connect("seo", "editor")
        .connect("editor", "end")
        .build()
    )
    
    return workflow


def create_social_media_workflow():
    """
    Social Media Workflow
    
    Generates content and creates social media posts.
    
    Workflow:
    Start → Writer → Social Media Agent → End
    """
    builder = WorkflowBuilder(
        name="Social Media Content Generator",
        description="Generate and repurpose content for social media"
    )
    
    workflow = (builder
        .start()
        .agent(agent_id=4, node_id="writer", config={
            'word_count': 1000,
            'tone': 'casual'
        })
        .agent(agent_id=10, node_id="social", config={
            'platforms': ['twitter', 'linkedin', 'facebook']
        })
        .end()
        .connect("start", "writer")
        .connect("writer", "social")
        .connect("social", "end")
        .build()
    )
    
    return workflow


def create_email_campaign_workflow():
    """
    Email Campaign Workflow
    
    Workflow:
    Start → Research → Writer → Email Campaign Agent → Fact Check → End
    """
    builder = WorkflowBuilder(
        name="Email Campaign Builder",
        description="Create complete email marketing campaigns"
    )
    
    workflow = (builder
        .start()
        .agent(agent_id=1, node_id="research")
        .agent(agent_id=4, node_id="writer", config={
            'word_count': 300,
            'tone': 'persuasive'
        })
        .agent(agent_id=11, node_id="email")
        .agent(agent_id=7, node_id="fact_check")
        .end()
        .connect("start", "research")
        .connect("research", "writer")
        .connect("writer", "email")
        .connect("email", "fact_check")
        .connect("fact_check", "end")
        .build()
    )
    
    return workflow


def create_content_repurposing_workflow():
    """
    Content Repurposing Workflow
    
    Takes existing content and creates multiple formats.
    
    Workflow:
    Start → Summarizer → Content Repurposing → End
    """
    builder = WorkflowBuilder(
        name="Content Repurposing Pipeline",
        description="Convert content to multiple formats"
    )
    
    workflow = (builder
        .start()
        .agent(agent_id=8, node_id="summarizer")
        .agent(agent_id=12, node_id="repurpose", config={
            'formats': ['video', 'infographic', 'podcast', 'slide_deck']
        })
        .end()
        .connect("start", "summarizer")
        .connect("summarizer", "repurpose")
        .connect("repurpose", "end")
        .build()
    )
    
    return workflow


def create_multilingual_content_workflow():
    """
    Multilingual Content Workflow
    
    Creates content and translates to multiple languages.
    
    Workflow:
    Start → Writer → Translator → Social Media → End
    """
    builder = WorkflowBuilder(
        name="Multilingual Content Generator",
        description="Generate content in multiple languages with social posts"
    )
    
    workflow = (builder
        .start()
        .agent(agent_id=4, node_id="writer")
        .agent(agent_id=9, node_id="translator", config={
            'target_languages': ['es', 'fr', 'de', 'ja']
        })
        .agent(agent_id=10, node_id="social")
        .end()
        .connect("start", "writer")
        .connect("writer", "translator")
        .connect("translator", "social")
        .connect("social", "end")
        .build()
    )
    
    return workflow


# Workflow registry
WORKFLOW_TEMPLATES = {
    'blog_generator': create_blog_generator_workflow,
    'social_media': create_social_media_workflow,
    'email_campaign': create_email_campaign_workflow,
    'content_repurposing': create_content_repurposing_workflow,
    'multilingual': create_multilingual_content_workflow,
}


def get_workflow_template(template_name: str):
    """Get a workflow template by name."""
    factory = WORKFLOW_TEMPLATES.get(template_name)
    if not factory:
        raise ValueError(f"Unknown workflow template: {template_name}")
    return factory()
