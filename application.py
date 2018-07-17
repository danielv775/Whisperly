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
        # Pass channel list to, and use jinja to display already created channels
        return render_template("index.html", channel_list=channel_list)

    elif request.method == "POST":
        channel = request.form.get("channel_name")
        if channel and (channel not in channel_list):
            channel_list.append(channel)
            print(channel_list)
            return jsonify({"success": True})
        else:
            return jsonify({"success": False})
