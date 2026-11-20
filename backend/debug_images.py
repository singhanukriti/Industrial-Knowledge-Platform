import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from collections import Counter
from services.parsers.docling_parser import DoclingParser

pdf = os.path.join("uploads", "file-sample_150kB.pdf")
doc = DoclingParser().parse(pdf)["document"]

print("has pictures:", hasattr(doc, "pictures"), "len:", len(getattr(doc, "pictures", [])))
print("has graphics:", hasattr(doc, "graphics"), "len:", len(getattr(doc, "graphics", [])))
print("has tables:", hasattr(doc, "tables"), "len:", len(getattr(doc, "tables", [])))

# Inspect the tuples returned by iterate_items
first = None
for it in doc.iterate_items():
    first = it
    break
print("iterate_items yields type:", type(first).__name__)
if isinstance(first, tuple):
    print("  tuple length:", len(first))
    for i, part in enumerate(first):
        print(f"   [{i}] type={type(part).__name__}")

# What kinds of picture items exist?
for p in getattr(doc, "pictures", []):
    print("PICTURE item type:", type(p).__name__)
for g in getattr(doc, "graphics", []):
    print("GRAPHIC item type:", type(g).__name__)
