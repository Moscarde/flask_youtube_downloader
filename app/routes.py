from flask import Blueprint, flash, redirect, render_template, request, url_for

from .models import Video, db

bp = Blueprint("main", __name__)


@bp.route("/adicionar_videos", methods=["GET", "POST"])
def adicionar_videos():
    if request.method == "POST":
        url = request.form["url"]
        title = request.form["title"]
        file_path = request.form.get("file_path")
        duration_s = request.form.get("duration_s", type=int)
        views = request.form.get("views", type=int)
        upload_date = request.form.get("upload_date")
        thumbnail_url = request.form.get("thumbnail_url")
        uploader = request.form.get("uploader")
        status = request.form.get("status", "pending")

        if not url or not title:
            flash("Os campos URL e Título são obrigatórios!", "danger")
        else:
            novo_video = Video(
                url=url,
                title=title,
                file_path=file_path,
                duration_s=duration_s,
                views=views,
                upload_date=upload_date,
                thumbnail_url=thumbnail_url,
                uploader=uploader,
                status=status,
            )
            db.session.add(novo_video)
            db.session.commit()
            flash("Vídeo adicionado com sucesso!", "success")
            return redirect(url_for("main.adicionar_videos"))

    return render_template("adicionar_video.html")


@bp.route("/")
def index():
    return render_template("index.html")
