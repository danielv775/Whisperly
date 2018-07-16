// Promp user to enter display_name if not set yet
if (!localStorage.getItem('display_name')) {
    var username = prompt('Enter a display name ');
    localStorage.setItem('display_name', username);
}

// Load current value of display_name
document.addEventListener('DOMContentLoaded', () => {

    // Get existing display name from local storage and display on site
    var username = localStorage.getItem('display_name');
    document.querySelector('#user').innerHTML = username;

    // Send AJAX request to GET all channels currently stored on the server

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
        const li = document.createElement('li');
        const channel_name = document.querySelector('#channel').value;
        li.innerHTML = channel_name;
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
    };


});

