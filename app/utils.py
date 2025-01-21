import os

from slugify import slugify
from yt_dlp import YoutubeDL


def get_video_info(video_url):
    options = {
        "quiet": True,
        "no_warnings": True,
        "format": "best",
    }
    with YoutubeDL(options) as ydl:
        info_dict = ydl.extract_info(video_url, download=False)
        return info_dict


def download_video(video_url, output_path):
    options = {
        "outtmpl": f"{output_path}/%(title)s.%(ext)s",  # Nome do arquivo de saída
        "format": "bestvideo+bestaudio/best",  # Melhor qualidade disponível
    }
    try:
        with YoutubeDL(options) as ydl:
            info_dict = ydl.extract_info(video_url, download=True)
            filename = ydl.prepare_filename(info_dict)
            base_name, ext = os.path.splitext(os.path.basename(filename))
            slugified_name = slugify(base_name)
            slugified_filename = f"{slugified_name}{ext}"
            final_path = os.path.join(os.path.dirname(filename), slugified_filename)
            os.rename(filename, final_path)

        print("Download concluído!")
        return final_path
    except Exception as e:
        print(f"Erro ao baixar o vídeo: {e}")
        return None