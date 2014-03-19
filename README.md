twenty-questions-multi
======================
Web application for playing 20 Questions. 
Current version hosted at (http://q20.herokuapp.com/)

Written using Node.js/Express.js, Socket.io, and AngularJS.

Playing 20 Questions
--------------------
The game host selects an object without revealing it to the others. The remaining players are given a category/hint as to what the object is. They must guess the object only by asking questions that can be answered with a basic "Yes" or "No". If they discover the answer within 20 questions, the game host is the victor.

Running locally
---------------
Install dependencies:

    npm install

Run the app:

    node ./scripts/server.js

Access the app at `localhost:5000`


Testing
-------
Run Karma/Jasmine tests:

	./scripts/test.sh