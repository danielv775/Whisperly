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
        li.innerHTML = document.querySelector('#channel').value;
        document.querySelector('#channels').append(li);

        // send Asynch AJAX request to POST channel data to FLASK server
        const request = new XMLHttpRequest();

        document.querySelector('#channel').value = '';
        document.querySelector('#submit-add-channel').disabled = true;

        return false;
    };


});

