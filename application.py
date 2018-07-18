import os

from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
import json

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# list of all channels
channel_list = {"general": {} }

@app.route("/", methods=["POST", "GET"])
def index():

    if request.method == "GET":
        # Pass channel list to, and use jinja to display already created channels
        return render_template("index.html", channel_list=channel_list)

    elif request.method == "POST":
        channel = request.form.get("channel_name")

        # Adding a new channel
        if channel and (channel not in channel_list):
            channel_list[channel] = {}
            print(channel_list)
            return jsonify({"success": True})
        # Switching to a different channel
        elif channel in channel_list:
            # send channel specific data to client i.e. messages, who sent them, and when they were sent
            # send via JSON response and then render with JS, or render_template??
            print(f"Switch to {channel}")

            channel_data = channel_list[channel]
            channel_data["success"] = True
            return jsonify(channel_data)
        else:
            return jsonify({"success": False})

@socketio.on("send message")
def send_message(message_data):
    channel = message_data["current_channel"]
    del message_data["current_channel"]
    channel_list[channel][message_data["timestamp"]] = [message_data["user"], message_data["message_content"]]
    print(channel_list)
    emit("recieve message", message_data, broadcast=True)