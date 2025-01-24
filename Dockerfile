# Imagem base do Python
FROM python:3.11.11-slim


RUN apt-get update && apt-get install -y \
    wget \
    ffmpeg \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*


RUN wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp


WORKDIR /app


COPY . /app


RUN pip install --no-cache-dir -r requirements.txt


EXPOSE 5000


CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]
