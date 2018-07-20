// Promp user to enter display_name if not set yet
if (!localStorage.getItem('display_name') && !localStorage.getItem('current_channel') && !localStorage.getItem('comment_stack') ) {
    var username = prompt('Enter a display name ');
    localStorage.setItem('display_name', username);
    localStorage.setItem('current_channel', 'general');
    localStorage.setItem('comment_stack', JSON.stringify({'general': 110}));
}


const template = Handlebars.compile(document.querySelector('#load-messages').innerHTML);

// Load current value of display_name
document.addEventListener('DOMContentLoaded', () => {

    // Connect to a web-socket. Used for sending and recieving messages dynamically
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // Get existing display name from local storage and display on site
    var username = localStorage.getItem('display_name');
    document.querySelector('#user').innerHTML = username;

    let comment_stack = JSON.parse(localStorage.getItem('comment_stack'));
    let current_channel = localStorage.getItem('current_channel');
    document.querySelector('#comment-list').style.paddingTop = `${comment_stack[current_channel]}%`;
    var comment_count = document.querySelector('#comment-list').childElementCount;
    if (comment_count > 0) {
        document.querySelector('#comment-list').lastElementChild.scrollIntoView();
    }

    // When connected to socket, configure send message button, and emit message_data to FLASK server
    socket.on('connect', () => {

       document.querySelector('#submit-send-message').onclick = () => {
           let message_content = document.querySelector('#message-input').value
           let timestamp = new Date();
           timestamp = timestamp.toLocaleString('en-US');
           let user = username;
           let message_data = {"message_content": message_content, "timestamp": timestamp, "user":user, "current_channel": localStorage.getItem('current_channel') };
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
        div_media_body.setAttribute('class', 'media-body comment-media');

        const h5 = document.createElement('h5');
        h5.setAttribute('class', 'mt-0 mb-1 comment-user');
        let midpt = '&middot';
        let space = '\u0020';
        h5.innerHTML = `${message_data["user"]}${space}${midpt}${space}`;

        const div_time = document.createElement('div');
        div_time.setAttribute('class', 'comment-comment');
        div_time.setAttribute('id', 'time');
        div_time.innerHTML = message_data["timestamp"];

        const div_comment = document.createElement('div');
        div_comment.setAttribute('class', 'comment-comment');
        div_comment.innerHTML = message_data["message_content"];

        div_media_body.appendChild(h5);
        div_media_body.appendChild(div_time);
        div_media_body.appendChild(div_comment);

        li.appendChild(div_media_body);

        document.querySelector('#comment-list').append(li);
        let comment_stack = JSON.parse(localStorage.getItem('comment_stack'));
        let current_channel = localStorage.getItem('current_channel');
        comment_stack[current_channel] -= 15;
        localStorage.setItem('comment_stack', JSON.stringify(comment_stack));
        document.querySelector('#comment-list').style.paddingTop = `${comment_stack[current_channel]}%`;
        li.scrollIntoView();

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
            //button.setAttribute('id', 'submit-switch-channel');
            button.id = 'submit-switch-channel';
            button.setAttribute('type', 'submit');
            button.setAttribute('value', channel_name);

            const li = document.createElement('li');
            li.innerHTML = `# ${channel_name}`;
            li.setAttribute('id','channel-option');

            button.appendChild(li);
            form.appendChild(button);
            console.log(form);
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
            console.log(this.value);

            // Clear messages from current view when switching to next channel
            if(this.value != localStorage.getItem('current_channel')) {
                var switching_channel = this.value;
                localStorage.setItem('current_channel', switching_channel);
                document.querySelector('#comment-list').innerHTML = '';

                var comment_stack = JSON.parse(localStorage.getItem('comment_stack'));
                if( !(switching_channel in comment_stack) ) {
                    comment_stack[switching_channel] = 110;
                    localStorage.setItem('comment_stack', JSON.stringify(comment_stack));
                }
                /*
                else {
                    document.querySelector('#comment-list').style.paddingTop = `${comment_stack[switching_channel]}%`;
                    console.log(document.querySelector('#comment-list').lastElementChild);
                }
                */

                // Send Asynch AJAX request to FLASK to tell server what channel was selected
                const request = new XMLHttpRequest();
                request.open('POST', '/');

                // Parse JSON response for unique channel data
                // i.e. past 100 messages, where each message has a timestamp, displayname, and text content
                // Use JS to render the data into the message view without reloading the page
                request.onload = () => {
                    const data = JSON.parse(request.responseText);
                    console.log(data);
                    for(var i = 0; i < data.length; i++) {
                        const comment = template({'comment': data[i]});
                        document.querySelector('#comment-list').innerHTML += comment;
                    }
                    document.querySelector('#comment-list').style.paddingTop = `${comment_stack[switching_channel]}%`;
                    var comment_count = document.querySelector('#comment-list').childElementCount;
                    if (comment_count > 0) {
                        document.querySelector('#comment-list').lastElementChild.scrollIntoView();
                    }
                }

                const data = new FormData();
                data.append('channel_name', localStorage.getItem('current_channel'));
                request.send(data);

                return false;

            }
            else {
                return false;
            }
        };
    });


});

