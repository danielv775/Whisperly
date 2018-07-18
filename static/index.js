// Promp user to enter display_name if not set yet
if (!localStorage.getItem('display_name')) {
    var username = prompt('Enter a display name ');
    localStorage.setItem('display_name', username);
}

// Load current value of display_name
document.addEventListener('DOMContentLoaded', () => {

    var current_channel = 'general';
    var comment_stack = 110;

    // Connect to a web-socket. Used for sending and recieving messages dynamically
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // Get existing display name from local storage and display on site
    var username = localStorage.getItem('display_name');
    document.querySelector('#user').innerHTML = username;

    // When connected to socket, configure send message button, and emit message_data to FLASK server
    socket.on('connect', () => {

       document.querySelector('#submit-send-message').onclick = () => {
           let message_content = document.querySelector('#message-input').value
           let timestamp = "Wednesday 10:56AM EST";
           let user = username;
           let message_data = {"message_content": message_content, "timestamp": timestamp, "user":user, "current_channel": current_channel };
           console.log(message_data);
           document.querySelector('#message-input').value = '';
           socket.emit('send message', message_data);

           return false;
       };

    });

    // When a message is broadcast to a channel, recieve the message, and add it to the message view
    socket.on('recieve message', message_data => {
        // Create a comment element and add to message view

        const li = document.createElement('li');
        li.setAttribute('class', 'media comment-item');

        const div_media_body = document.createElement('div');
        div_media_body.setAttribute('class', 'media-body');

        const h5 = document.createElement('h5');
        h5.setAttribute('class', 'mt-0 mb-1 comment-user');
        h5.innerHTML = message_data["user"];

        const div_comment = document.createElement('div');
        div_comment.setAttribute('class', 'comment-comment');
        div_comment.innerHTML = message_data["message_content"];

        const div_time = document.createElement('div');
        div_time.setAttribute('class', 'comment-comment');
        div_time.innerHTML = message_data["timestamp"];

        div_media_body.appendChild(h5);
        div_media_body.appendChild(div_comment);
        div_media_body.appendChild(div_time);

        li.appendChild(div_media_body);

        document.querySelector('#comment-list').append(li);
        comment_stack -= 15;
        document.querySelector('#comment-list').style.marginTop = `${comment_stack}%`;
        console.log(document.querySelector('#comment-list').style.marginTop);


    });

    // By default, you cannot add a channel
    document.querySelector('#submit-add-channel').disabled = true;

    // Enable button only if there is text in the field
    document.querySelector('#channel').onkeyup = () => {
        if(document.querySelector('#channel').value.length > 0) {
            document.querySelector('#submit-add-channel').disabled = false;
        }
        else {
            document.querySelector('#submit-add-channel').disabled = true;
        }
    };

    // Set onsubmit attribute for adding channel
    document.querySelector('#add-channel-form').onsubmit = () => {
        const channel_name = document.querySelector('#channel').value;

        let channels = [];
        document.querySelectorAll('#channel-option').forEach(channel => {
            channels.push(channel.innerHTML);
        });
        let channel_already_exists = (channels.indexOf(`# ${channel_name}`) > -1);

        if(!channel_already_exists) {

            // Create channel which is a form->button->li nested element
            const form = document.createElement('form');
            form.setAttribute('id', 'switch-channel-form');

            const button = document.createElement('button');
            button.setAttribute('id', 'submit-switch-channel');
            button.setAttribute('type', 'submit');
            button.setAttribute('value', channel_name);

            const li = document.createElement('li');
            li.innerHTML = `# ${channel_name}`;
            li.setAttribute('id','channel-option');

            button.appendChild(li);
            form.appendChild(button);

            document.querySelector('#channels').append(form);

            document.querySelector('#channel').value = '';
            document.querySelector('#submit-add-channel').disabled = true;

            // send Asynch AJAX request to POST channel data to FLASK server
            const request = new XMLHttpRequest();
            request.open('POST', '/');

            // Ensure response is OK, and sending data was succusful
            request.onload = () => {
                const data = JSON.parse(request.responseText);
                if(data.success) {
                    console.log("Channel name sent to FLASK server");
                }
                else {
                    console.log("Channel data not recieved by FLASK server");
                }
            }

            const data = new FormData();
            data.append('channel_name', channel_name);
            request.send(data);

            return false;

        }
        else {
            document.querySelector('#channel').value = '';
            document.querySelector('#submit-add-channel').disabled = true;
            alert("Channel already exists");
            return false;
        }
    };

    document.querySelectorAll('#submit-switch-channel').forEach(button => {
        button.onclick = function() {
            //onsubmit??

            // Send Asynch AJAX request to FLASK to tell server what channel was selected
            const request = new XMLHttpRequest();
            request.open('POST', '/');

            // Parse JSON response for unique channel data
            // i.e. past 100 messages, where each message has a timestamp, displayname, and text content
            // Use JS to render the data into the message view without reloading the page
            request.onload = () => {
                const data = JSON.parse(request.responseText);
                console.log(data);
                if(data.success) {
                    console.log("Channel to switch to sent to FLASK server");
                }
                else {
                    console.log("Channel data not recieved by FLASK server");
                }

            }

            current_channel =  this.value;
            const data = new FormData();
            data.append('channel_name', current_channel);
            request.send(data);

            return false;
        };
    });


});

