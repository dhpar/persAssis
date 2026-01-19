#!/usr/bin/env python
"""Setup script for local-ai-assistant backend."""
from setuptools import setup, find_packages

setup(
    name="local-ai-assistant",
    version="0.1.0",
    description="Local-first, privacy-aware AI assistant with verification and tool routing",
    author="David",
    author_email="david@example.com",
    license="MIT",
    packages=find_packages(),
    python_requires=">=3.10",
    install_requires=[
        "fastapi>=0.104.0",
        "uvicorn>=0.24.0",
        "pydantic>=2.0.0",
        "python-dotenv>=1.0.0",
        "ollama>=0.1.0",
        "sentence-transformers>=2.2.0",
        "qdrant-client>=2.7.0",
        "langchain>=0.1.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "pytest-asyncio>=0.21.0",
            "black>=23.0.0",
            "ruff>=0.1.0",
            "mypy>=1.0.0",
        ]
    },
)
