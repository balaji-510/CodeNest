#!/usr/bin/env python
"""Read full thesis document structure"""
from docx import Document

doc = Document('../thesis_A-14.docx')

print('=== ALL CONTENT ===\n')
for i, para in enumerate(doc.paragraphs):
    if para.text.strip():
        style = para.style.name
        text = para.text.strip()
        print(f'{i}: [{style}] {text}')
