import json
import os

DATA_FILE = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "data",
    "documents.json"
)


def load_documents():

    if not os.path.exists(DATA_FILE):
        return []

    with open(DATA_FILE, "r") as f:
        return json.load(f)


def save_documents(documents):

    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)

    with open(DATA_FILE, "w") as f:
        json.dump(documents, f, indent=4)
