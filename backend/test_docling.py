from services.parsers.docling_parser import DoclingParser

parser = DoclingParser()

result = parser.parse(
    "uploads/ES Tech Apprentice JD.pdf"
)

print("=" * 80)

print(result["markdown"][:3000])

print("=" * 80)