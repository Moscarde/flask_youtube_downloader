import os

from flask import Flask


def create_app():
    app = Flask(__name__)

    app.config["SECRET_KEY"] = os.urandom(24)

    with app.app_context():
        from .routes import bp

        app.register_blueprint(bp)

    return app
