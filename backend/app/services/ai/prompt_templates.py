from typing import Dict


TEMPLATES: Dict[str, str] = {
    "blog": (
        "Write a {word_count}-word blog post about the topic below.\n"
        "Topic: {topic}\n"
        "Tone: {tone}. Target audience: {target_audience}. "
        "Keywords: {keywords}. Language: {language}."
    ),
    "product": (
        "Write a product description of about {word_count} words for the topic below.\n"
        "Topic: {topic}\n"
        "Target audience: {target_audience}. Tone: {tone}. "
        "Keywords: {keywords}. Language: {language}."
    ),
    "social": (
        "Write a {word_count}-word social media caption about the topic below.\n"
        "Topic: {topic}\n"
        "Target audience: {target_audience}. Tone: {tone}. "
        "Keywords: {keywords}. Language: {language}."
    ),
    "email": (
        "Write a marketing email (about {word_count} words) about the topic below, "
        "including a subject line and body.\n"
        "Topic: {topic}\n"
        "Target audience: {target_audience}. Tone: {tone}. "
        "Keywords: {keywords}. Language: {language}."
    ),
    "seo_title": (
        "Create an SEO-optimized title for the topic below.\n"
        "Topic: {topic}\n"
        "Target audience: {target_audience}. Keywords: {keywords}."
    ),
    "seo_meta": (
        "Create an SEO meta description (about {word_count} words) for the topic below.\n"
        "Topic: {topic}\n"
        "Target audience: {target_audience}. Keywords: {keywords}."
    ),
}


def build_prompt(content_type: str, *, title: str | None, prompt: str, tone: str | None = None,
                 target_audience: str | None = None, keywords: str | None = None,
                 language: str | None = "English", word_count: int | None = 200) -> str:
    title = (title or "").strip()
    prompt = (prompt or "").strip()

    # The user's prompt is the primary topic; fall back to the title when empty.
    topic = prompt or title or f"a general {content_type.replace('_', ' ')}"

    ctx = {
        "topic": topic,
        "tone": (tone or "").strip() or "neutral",
        "target_audience": (target_audience or "").strip() or "general",
        "keywords": (keywords or "").strip(),
        "language": (language or "").strip() or "English",
        "word_count": word_count or 200,
    }

    tpl = TEMPLATES.get(content_type)
    if tpl:
        result = tpl.format(**ctx)
    else:
        result = (
            f"Write {ctx['word_count']} words of {content_type} about the topic below.\n"
            f"Topic: {topic}\nTone: {ctx['tone']}. Target audience: {ctx['target_audience']}. "
            f"Keywords: {ctx['keywords']}. Language: {ctx['language']}."
        )

    # Include a separate title only when it adds information beyond the topic.
    if title and title != topic:
        result += f'\nTitle: "{title}"'

    return result
