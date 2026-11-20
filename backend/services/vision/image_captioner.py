import config

import torch

from PIL import Image

from transformers import (
    BlipProcessor,
    BlipForConditionalGeneration
)


class ImageCaptioner:

    def __init__(self):

        print("=" * 60)
        print("Loading BLIP Image Captioning Model...")
        print("=" * 60)

        self.device = (
            "cuda"
            if torch.cuda.is_available()
            else "cpu"
        )

        print(f"Using Device : {self.device}")

        self.processor = BlipProcessor.from_pretrained(
            "Salesforce/blip-image-captioning-base"
        )

        self.model = (
            BlipForConditionalGeneration
            .from_pretrained(
                "Salesforce/blip-image-captioning-base"
            )
            .to(self.device)
        )

        print("=" * 60)
        print("BLIP Loaded Successfully")
        print("=" * 60)

    def caption(self, image_path):

        image = Image.open(image_path).convert("RGB")

        inputs = self.processor(
            image,
            return_tensors="pt"
        ).to(self.device)

        output = self.model.generate(
            **inputs,
            max_new_tokens=50
        )

        caption = self.processor.decode(
            output[0],
            skip_special_tokens=True
        )

        return caption
