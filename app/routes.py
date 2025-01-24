import threading
from flask import Blueprint, render_template, request
from flask.json import jsonify
from .utils import active_downloads, get_video_info, handle_download

bp = Blueprint("main", __name__)

@bp.route("/")
def index():
    """
    Rota principal da aplicação que renderiza a página inicial.
    
    :return: O template HTML da página inicial.
    """
    return render_template("index.html")

@bp.route("/videos/download", methods=["POST"])
def download():
    """
    Rota para iniciar o download de um vídeo a partir de uma URL.
    
    O vídeo será processado em uma thread separada para não bloquear o servidor. 
    As informações sobre o vídeo serão obtidas antes do download começar.

    :return: Um JSON contendo informações sobre o estado da operação e do vídeo.
    """
    data = request.json
    url = data.get("video_url")

    if not url:
        return jsonify({"error": "A URL é obrigatória"}), 400

    video_info = get_video_info(url)
    thread_name = f"download-{len(active_downloads) + 1}"
    active_downloads.append(thread_name)

    thread = threading.Thread(target=handle_download, args=(url,), name=thread_name)
    thread.start()

    return (
        jsonify({"success": True, "thread": thread_name, "video_info": video_info}),
        202,
    )
