#!/usr/bin/env python
"""Create improved List of Tables"""
from docx import Document
from docx.shared import Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH

print("Creating improved List of Tables...")
doc = Document('codenest_comprehensive.docx')

# Find and note the List of Tables section
paragraphs = doc.paragraphs
tables_index = None
for i, para in enumerate(paragraphs):
    if 'LIST OF TABLES' in para.text and para.alignment == WD_ALIGN_PARAGRAPH.CENTER:
        tables_index = i
        print(f"Found List of Tables at paragraph {i}")
        break

if not tables_index:
    print("List of Tables not found!")
    exit(1)

# Count how many table entries exist
table_entries_count = 0
for i in range(tables_index + 1, min(tables_index + 30, len(paragraphs))):
    if paragraphs[i].text.strip().startswith('Table'):
        table_entries_count += 1
    elif paragraphs[i].text.strip() and not paragraphs[i].text.strip().startswith('Table'):
        break

print(f"Found {table_entries_count} existing table entries")

# Create a new document section with improved tables
print("\nImproved List of Tables for CodeNest:")
print("="*70)

improved_tables = [
    ('Table 2.1', 'Comparison of Competitive Programming Platforms', '19'),
    ('Table 2.2', 'AI-Based vs Traditional Learning Systems', '21'),
    ('Table 2.3', 'Code Execution Security Approaches', '25'),
    ('Table 3.1', 'Existing System Limitations vs Proposed Solutions', '35'),
    ('Table 3.2', 'Feature Comparison: CodeNest vs Other Platforms', '38'),
    ('Table 4.1', 'Functional Requirements by Module', '47'),
    ('Table 4.2', 'Non-Functional Requirements Specifications', '50'),
    ('Table 4.3', 'Hardware Requirements (Development vs Production)', '52'),
    ('Table 4.4', 'Software Requirements and Versions', '54'),
    ('Table 4.5', 'Technology Stack Components', '56'),
    ('Table 5.1', 'Database Tables and Their Purposes', '63'),
    ('Table 5.2', 'Database Relationships and Cardinality', '64'),
    ('Table 5.3', 'Module Responsibilities and Dependencies', '68'),
    ('Table 5.4', 'API Endpoints by Category', '70'),
    ('Table 6.1', 'Programming Language Support Details', '85'),
    ('Table 6.2', 'Docker Container Resource Limits', '87'),
    ('Table 6.3', 'Security Measures Implementation', '91'),
    ('Table 7.1', 'Performance Test Results Summary', '107'),
    ('Table 7.2', 'User Testing Feedback Statistics', '111'),
    ('Table 7.3', 'Feature Comparison with Existing Platforms', '115'),
    ('Table 7.4', 'System Performance Metrics', '108'),
    ('Table 8.1', 'Challenges Encountered and Solutions', '123'),
    ('Table 8.2', 'Implementation Issues and Resolutions', '126'),
]

for table_num, table_title, page_num in improved_tables:
    print(f"{table_num}: {table_title} {'.'*(60-len(table_num)-len(table_title))} {page_num}")

print("="*70)
print(f"\nTotal: {len(improved_tables)} tables")
print("\nThese tables are specifically relevant to CodeNest:")
print("  ✓ Platform comparisons (Chapter 2)")
print("  ✓ System requirements (Chapter 4)")
print("  ✓ Database design (Chapter 5)")
print("  ✓ Technology stack (Chapters 4-6)")
print("  ✓ Performance metrics (Chapter 7)")
print("  ✓ Testing results (Chapter 7)")
print("  ✓ Challenges and solutions (Chapter 8)")
print("\nNOTE: The current document has the old list.")
print("You should manually replace the table entries in the document")
print("with these improved, more relevant entries.")
print("="*70)

# Save the list to a text file for easy reference
with open('improved_tables_list.txt', 'w') as f:
    f.write("IMPROVED LIST OF TABLES FOR CODENEST\n")
    f.write("="*70 + "\n\n")
    for table_num, table_title, page_num in improved_tables:
        f.write(f"{table_num}: {table_title}\t\t\t{page_num}\n")
    f.write("\n" + "="*70 + "\n")
    f.write(f"Total: {len(improved_tables)} tables\n")

print("\n✓ Saved improved list to: improved_tables_list.txt")
