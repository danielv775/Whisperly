import os

from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
import json

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# Channel Data Global Variables
channel_list = {"general": [] }
present_channel = {"initial":"general"}

@app.route("/", methods=["POST", "GET"])
def index():

    if request.method == "GET":
        # Pass channel list to, and use jinja to display already created channels
        return render_template("index.html", channel_list=channel_list)

    elif request.method == "POST":
        channel = request.form.get("channel_name")
        user = request.form.get("username")

        # Adding a new channel
        if channel and (channel not in channel_list):
            channel_list[channel] = []
            return jsonify({"success": True})
        # Switching to a different channel
        elif channel in channel_list:
            # send channel specific data to client i.e. messages, who sent them, and when they were sent
            # send via JSON response and then render with JS
            print(f"Switch to {channel}")
            present_channel[user] = channel
            channel_data = channel_list[present_channel[user]]
            return jsonify(channel_data)
        else:
            return jsonify({"success": False})

@socketio.on("send message")
def send_message(message_data):
    channel = message_data["current_channel"]
    del message_data["current_channel"]
    channel_list[channel].append(message_data)
    emit("recieve message", message_data, broadcast=True)