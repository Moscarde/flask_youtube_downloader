from datetime import datetime
from . import db

class Video(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String(255), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    file_path = db.Column(db.String(255), nullable=True)  # Caminho opcional
    duration_s = db.Column(db.Integer, nullable=True)  # Duração em segundos
    views = db.Column(db.Integer, default=0)  # Número de visualizações
    upload_date = db.Column(db.Date, nullable=True)  # Data de upload
    thumbnail_url = db.Column(db.String(255), nullable=True)  # URL do thumbnail
    uploader = db.Column(db.String(100), nullable=True)  # Nome do uploader
    status = db.Column(db.String(50), default="pending")  # Status do vídeo
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # Criado em
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)  # Atualizado em


    def __repr__(self):
        return f'<Video {self.titulo}>'
