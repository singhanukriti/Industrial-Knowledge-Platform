import os
import sys

# Reconfigure stdout to use UTF-8 encoding
sys.stdout.reconfigure(encoding='utf-8')

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.hybrid_search_service import HybridSearchService

search = HybridSearchService()

results = search.search(
    "Explain the pie chart."
)

print("=" * 60)
print("TEXT")
print("=" * 60)

for item in results["text"]:

    print(item["score"])
    print(item["document"])
    print()

print("=" * 60)
print("TABLE")
print("=" * 60)

for item in results["table"]:

    print(item["score"])
    print(item["document"])
    print()

print("=" * 60)
print("IMAGE")
print("=" * 60)

for item in results["image"]:

    print(item["score"])
    print(item["document"])
    print()
