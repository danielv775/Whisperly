# Project 2

Web Programming with Python and JavaScript

<h1>HTML</h1>

<h2>layout.html</h2>
<p>
layout.html isn't used extensivley for its usual purpose--to allow many similar html pages to inherit from it. In this single page app,
only index.html inherits from layout.html. Still, it is useful in factoring out all of the frameworks and libraries that I use
such as Bootstrap 4, GoogleFonts, Ajax, Handlebars, and my own custom css and js files. Because I didn't use too many Handlebars
JS Clientside templates, I just included the ones I used directly in my layout.html rather than factoring them out.
</p>

<h2>index.html</h2>
<p>
index.html inherits from layout.html, and defines the positioning, of the two main areas of the page--the channel list view, and
the message view. I make use of a single bootstrap 4 row, with 2 columns, where the left column is the channel list view, and
the right column is the message view. I apply combinations of custom css, and bootstrap 4 classes to get the layout I want.
Essentially, I styled it so that each column takes up 100% of the page, and the channel view column size remains constant, while
the message view column dynamically resizes as the browser resizes horizontally.
</p>

<h1>CSS and SCSS</h1>
<h2>styles.css & styles.scss</h2>
<p>Similar to my other projects, these files contain the styling that I use throughout my website.</p>

<h1>Javascript: Client</h1>
<h2>index.js</h2>
<p>index.js contains all of the client side code for my single page app. It is asynchronous, event-driven code.
Various events that trigger JS code to execute include, the page loading via GET request, a user clicking on a channel from
the channel list to switch channels, a user clicking on the send button to send a message to a message view. In addition to events
that are directly the result of the user taking an action, other events are defined as recieving a signal from the Python server
via socketio. There are two key components that make the app dynamic--AJAX and Socketio. With AJAX, asynchronous POST requests
deliver client data to the server. Based on the client data, the Python FLASK server responds with the relevant JSON data.
The client who initiated the request then recieves the JSON data, and the JS code in their browser parses the JSON to dynamically
add the right data to the right view. With Socketio, I am able to implement live messaging between users. When the client sends a
message, first it is routed to the server where it is stored for later retrieval, then it is broadcast to all users in the channel
that it was sent via the emit function. Back on the client side, a socket.on() listener listens for the broadcast message. Because
the JS code in the socket.on() listener recieves data via broadcast, the code executed in this block affects all clients in the channel.
With respect to local storage, I store display name, current channel, and padding data per channel. The padding data is used
to more accuratley layout the comments view as a new comment is entered.
</p>

<h1>Python: Server</h1>
<h2>application.py</h2>
<p>application.py contains all of the server side code for my single page app. It has one route function, index, and
5 socketio listeners that respond to signals sent via emit from the JS client. Also, it has global variables to store data
more permanently. The first global variable is a dictionary where each key is a channel name, and each value is a list of
dictionaries. Each dictionary in the list of dictionaries can be thought of as a comment, so within each comment dictionary
are the key value pairs about the user, timestamp, and message content. The second global variable is a simple dictionary
where each key is a user, and each value is the channel that they're on. The first function index behaves differently depending
on if a GET or a POST request were sent. If a GET request was sent--happens on the 1st page load, or if a user manually refreshes
the page--then the page is refreshed, and data about the channels created so far is sent to the page. If a POST request was
sent--which happens immediatley after a manual page refresh, on a channel switch, or on a channel add--the POST part of the function
executes. The socketio listeners send message, on join, and on leave are responsible for handling the live messaging in a given channel.
The send message function adds a new message the server side storage, deletes the last message from global storage if there are
more than 100 messages, and then broadcasts the message that it recieved to all clients in the channel that it was sent from.
To know what clients are in what channels, I use on leave and on join, which respond to emit signals from the client side telling
the server when a specific client is leaving or joining a room. The last important socketio listener is responsible for handling
the "personal touch" or extra feature that I added to the app. Read more about that under "Personal Touch"
</p>

<h1>Personal Touch: Moderator</h1>
<p>For my personal touch, I gave the display name "superuser" special privileges. More specifically, I gave them the power
to delete any channel and its comments from the server, and from the view of any other user using the app. To delete a channel,
the display name "superuser" has to be in the channel that it wants to delete, and type "command delete {channel name here}".
When the superuser does this, all users using the app are booted from whatever channel they are in and moved to general, along with
the superuser. A message is broadcast to general about what channel the superuser just deleted. To prevent random users from
easily deleting channels willy nilly, I obfuscate the true display name of the superuser. So, the only way for a person to know how
to get the superuser's ability is to look at the code. An average user probably wouldn't figure it out unless somebody told them.
When the superuser sends a message, his display name shows up as mod, but the client side code that gives the superuser this ability checks
for the username "superuser". This feature is also generally useful to have a "controlled cleanup" of channels from the server. Without
a feature like this the only way to cleanup the channels would be to restart the server.
</p>

