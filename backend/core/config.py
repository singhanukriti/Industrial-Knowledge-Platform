from pydantic import BaseModel


class Settings(BaseModel):
    PROJECT_NAME: str = "Industrial Knowledge Platform"
    DESCRIPTION: str = "Backend API for the Industrial Knowledge Platform"
    VERSION: str = "0.1.0"


settings = Settings()
