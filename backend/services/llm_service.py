import os

from dotenv import load_dotenv
from langchain_groq import ChatGroq

load_dotenv()


class LLMService:

    def __init__(self):

        self.llm = ChatGroq(
            groq_api_key=os.getenv("GROQ_API_KEY"),
            model_name="llama-3.3-70b-versatile",
            temperature=0
        )

    def generate_answer(self, prompt: str):

        response = self.llm.invoke(prompt)

        return response.content