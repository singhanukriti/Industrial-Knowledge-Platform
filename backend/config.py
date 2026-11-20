import os

# =====================================================
# Backend Root Directory
# =====================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# =====================================================
# HuggingFace Local Cache
# =====================================================

HF_HOME = os.path.join(
    BASE_DIR,
    "models",
    "huggingface"
)

os.makedirs(HF_HOME, exist_ok=True)

# Tell HuggingFace to use this folder
os.environ["HF_HOME"] = HF_HOME
os.environ["TRANSFORMERS_CACHE"] = os.path.join(
    HF_HOME,
    "transformers"
)

os.environ["HF_HUB_CACHE"] = os.path.join(
    HF_HOME,
    "hub"
)

print("=" * 60)
print("HuggingFace Cache")
print(HF_HOME)
print("=" * 60)
