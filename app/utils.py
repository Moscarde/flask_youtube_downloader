import re
import subprocess
import threading

from yt_dlp import YoutubeDL

active_downloads = []


def get_video_info(video_url):
    """
    Obtém informações detalhadas sobre um vídeo do YouTube usando o yt-dlp.

    :param video_url: URL do vídeo a ser analisado.
    :return: Um dicionário contendo informações como título, duração, visualizações,
             data de upload, uploader e thumbnail.
    """
    options = {
        "quiet": True,
        "no_warnings": True,
        "format": "best",
    }
    with YoutubeDL(options) as ydl:
        info_dict = ydl.extract_info(video_url, download=False)
        return {
            "url": video_url,
            "title": info_dict.get("title"),
            "duration": info_dict.get("duration"),
            "view_count": info_dict.get("view_count"),
            "upload_date": info_dict.get("upload_date"),
            "uploader": info_dict.get("uploader"),
            "thumbnail_url": info_dict.get("thumbnail"),
        }


def handle_download(url):
    """
    Gerencia o processo de download de um vídeo em uma thread separada.

    Após o término do download, remove a thread ativa da lista `active_downloads`.

    :param url: URL do vídeo a ser baixado.
    """
    result = subprocess_download_video(url=url, output="./downloads")
    active_downloads.remove(threading.current_thread().name)
    print(f"Download concluído: {result}")


def subprocess_download_video(url, options=None, output="./downloads"):
    """
    Executa o yt-dlp como um subprocesso para baixar vídeos.

    :param url: URL do vídeo a ser baixado.
    :param options: Lista de opções adicionais para o yt-dlp.
    :param output: Diretório onde os arquivos baixados serão salvos.
    :return: Um dicionário contendo o status, a saída padrão e os erros, se houver.
    """
    try:
        cmd = ["yt-dlp", url, "-o", f"{output}/%(title)s.%(ext)s"]
        if options:
            cmd.extend(options)

        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return {
            "status": "completed" if result.returncode == 0 else "error",
            "output": result.stdout.decode(),
            "error": result.stderr.decode(),
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}
