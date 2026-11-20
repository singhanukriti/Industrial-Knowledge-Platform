from services.search_service import SearchService

search = SearchService()

question = input("Ask a question: ")

results = search.search(question)

documents = results["documents"][0]
metadatas = results["metadatas"][0]
distances = results["distances"][0]

print("\nTop Results\n")

for i in range(len(documents)):

    print("=" * 70)

    print(f"Result {i+1}")

    print("-" * 70)

    print("Score :", distances[i])

    print("Source :", metadatas[i]["source"])

    print()

    print(documents[i][:700])

    print()
