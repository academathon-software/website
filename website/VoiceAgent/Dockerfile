FROM python:3.12-slim

RUN apt-get update && apt-get install -y \
    pkg-config \
    ffmpeg \
    libsndfile1 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY agent.py prompts.py ./

RUN python3 -m livekit.agents download-files

CMD ["python3", "agent.py", "start"]
