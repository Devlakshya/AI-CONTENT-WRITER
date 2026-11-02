import os
from typing import List

def extract_text_from_txt(path: str) -> str:
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        return f.read()


def extract_text_from_md(path: str) -> str:
    return extract_text_from_txt(path)


def extract_text_from_docx(path: str) -> str:
    try:
        from docx import Document as DocxDocument
    except Exception:
        raise RuntimeError('python-docx is required for DOCX extraction')
    doc = DocxDocument(path)
    parts = []
    for para in doc.paragraphs:
        parts.append(para.text)
    return '\n'.join(parts)


def extract_text_from_pdf(path: str) -> str:
    try:
        from pdfminer.high_level import extract_text
    except Exception:
        raise RuntimeError('pdfminer.six is required for PDF extraction')
    return extract_text(path)


def clean_text(text: str) -> str:
    # simple cleaning: normalize whitespace
    return ' '.join(text.split())


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
    tokens = text.split()
    chunks = []
    i = 0
    while i < len(tokens):
        chunk = tokens[i:i+chunk_size]
        chunks.append(' '.join(chunk))
        i += chunk_size - overlap
    return chunks
