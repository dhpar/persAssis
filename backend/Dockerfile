# Use official lightweight Python image
FROM python:3.11-slim

WORKDIR /backend

COPY requirements.txt /backend/requirements.txt

# Upgrade pip and install dependencies
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r /backend/requirements.txt

RUN pip check

COPY . /backend/

EXPOSE 8000

CMD [ "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload" ]
