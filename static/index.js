// Promp user to enter display_name if not set yet
if (!localStorage.getItem('display_name')) {
    var username = prompt('Enter a display name ');
    localStorage.setItem('display_name', username);
}

// Load current value of display_name
document.addEventListener('DOMContentLoaded', () => {

    // Connect to a web-socket. Used for sending and recieving messages dynamically
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // Get existing display name from local storage and display on site
    var username = localStorage.getItem('display_name');
    document.querySelector('#user').innerHTML = username;

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

            // Create form->button->li so that styles apply as soon as the channel is added
            // rather than waiting for it to be pulled from server
            const li = document.createElement('li');
            li.innerHTML = `# ${channel_name}`;
            document.querySelector('#channels').append(li);

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

            // Send Asynch AJAX request to FLASK to tell server what channel was selected
            const request = new XMLHttpRequest();
            request.open('POST', '/');

            // Parse JSON response after request completes to ensure everything was OK
            request.onload = () => {
                const data = JSON.parse(request.responseText);
                if(data.success) {
                    console.log("Channel to switch to send to FLASK server");
                }
                else {
                    console.log("Channel data not recieved by FLASK server");
                }
            }

            const data = new FormData();
            data.append('channel_name', this.value);
            request.send(data);

            return false;
        };
    });


});

