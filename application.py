import os

from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# list of all channels
channel_list = []

@app.route("/", methods=["POST", "GET"])
def index():

    if request.method == "GET":
        return render_template("index.html")

    elif request.method == "POST":
        channel = request.form.get("channel_name")
        if channel:
            channel_list.append(channel)
            print(channel_list)
            return jsonify({"success": True})
        else:
            return jsonify({"success": False})
