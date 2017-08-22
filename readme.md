# Sample of web application for making, editing and saving notes.
Deploy application and use it for saving / editing notes. It can be easily improved since code is pretty simple.

## Technologies that are used
* nodejs
* express
* socket.io
* angularjs
* semantic ui

## Application workflow
The application has 2 pages - auth page, main page.
Server-side logic works with database through REST API with token access. Token lifetime equals 24 hours (can be changed in /config/config.json). After token lifetime is over - user have to login again for getting a new token.
User can't get access to notes of other users through API.
There is also made synchronization of notes using WebSokets with socket.io.
Logging actions goes to the file "access.log" in the project root.

## About storage
The project uses mongodb as database.
For simplicity assumes that mongo is launched on the project host and default mongodb port.
Connect available without username and password (also in favor of simplicity).

## How to run
Firstly, install node modules with command:

```npm i``` in the project folder.

Assumes that 3000 port is free in system, otherwise it can be changed in the application config.

To run application: 

```node index.js```
