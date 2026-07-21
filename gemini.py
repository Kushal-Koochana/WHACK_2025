import os

from dotenv import load_dotenv
from google import genai
from pydantic import BaseModel

load_dotenv()


class ContractExplanation(BaseModel):
    part_1: int
    part_2: int
    part_3: str
    part_4: list[str]
    part_5: list[str]


api_key = os.environ.get("GEMINI_API_KEY")

client = genai.Client(api_key=api_key)


def queryGemini(filename):
    file_path = f"uploads/{filename}"
    sample_file = client.files.upload(file=file_path)

    prompt = (
        "You are a professional financial advisor who is aware of financial laws in the UK and has 25 years of experience. "
        "Your explanations are always super clear and helpful for the clients using simple, basic language anyone can understand. "
        "You should give your response in 5 parts. Part 1 should be a percentage of how beneficial the contract is to the client. "
        "Part 2 should be a percentage of how beneficial the contract is to other party. Part 1 and Part 2 should add to 100. "
        "Part 3 should be a clear concise explanation explaining your reasoning. "
        "For part 4 create a list of improvements to the contract that would make it fairer to the client. "
        "For part 5 return a list of quotes from the pdf that would be useful to highlight to the user. "
        "Maybe parts of the document that the user could miss easily. The quotes should be identical to the pdf."
    )

    response = client.models.generate_content(
        model="gemini-3.5-flash",
        contents=[sample_file, prompt],
        config={
            "response_mime_type": "application/json",
            "response_schema": ContractExplanation,
            "temperature": 0.2,
        },
    )
    return response.text
