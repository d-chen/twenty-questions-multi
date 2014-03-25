var userNames = function () {

	// Private members
	var MAX_NAME_LENGTH = 15;
	var names = {}; // true values for names that already exist
	var nextGuestId = 1;


	return {
		// Public members

		// return all names as an array
		getNames: function () {
			var ret = [];

			for (var user in names){
				// avoid grabbing from prototype
				if (names.hasOwnProperty(user)){
					ret.push(user);
				}
			}

			return ret;
		},

		// claim ownership of name
		// returns false if name is already claimed
		claim: function (name) {
			if (!name || name === 'Server' || names[name] || name.length > MAX_NAME_LENGTH){
				return false;
			} else {
				names[name] = true;
				return true;
			}
		},

		// forfeit ownership of name
		free: function (name) {
			if (names[name]){
				delete names[name];
			}
		},

		// create default name for new user
		getGuestName: function () {
			var name;

			do {
				name = 'Guest ' + nextGuestId;
				nextGuestId += 1;
			} while (!userNames.claim(name));

			return name;
		}
	};
}( );


var gameState = function () {
	var host = '';
	var gameStarted = false;
	var secretHint = '';
	var questionList = [];
	var questionsLeft = 20;

	var secretObject = '';
	var nextQuestionId = 1;


	return {
		// return game data to send to new users or at the start of the game
		getGame: function () {
			return {
				host: host,
				gameStarted: gameStarted,
				secretHint: secretHint,
				questionList: questionList,
				questionsLeft: questionsLeft
			};
		},

		getHost: function () {
			return host;
		},

		getSecretObject: function () {
			return secretObject;
		},

		// host sends hint and secret object to begin game
		startGame: function (hint, object) {
			secretHint = hint;
			secretObject = object;
			gameStarted = true;
			questionList = [];
			questionsLeft = 20;
			nextQuestionId = 1;
		},

		// reset game state
		resetGame: function () {
			host = '';
			gameStarted = false;
			secretHint = '';
			secretObject = '';
			questionList = [];
			questionsLeft = 20;
			nextQuestionId = 1;
		},

		// claim host position; return false if already occupied
		claimHost: function (name) {
			if (!host){
				host = name;
				return true;
			} else {
				return false;
			}
		},

		// rename host
		renameHost: function (name){
			host = name;
		},

		// create question in server's copy of game
		addQuestion: function (user, question) {
			var qid = nextQuestionId;
			nextQuestionId += 1;

			var newQ = {
				id: qid,
				user: user,
				question: question,
				isAnswered: false
			};

			questionList.push(newQ);
			return newQ;
		},


		answerQuestion: function (data) {
			var i;
			for (i = 0; i < questionList.length; i++){
				if (questionList[i].id === data.id && questionList[i].isAnswered === false){
					questionList[i].answer = data.answer;
					questionList[i].isAnswered = true;
					questionsLeft -= 1;

					console.log('Question answered. #' + questionsLeft);
					return;
				}
			}
		},

		deleteQuestion: function (data) {
			var i;
			for (i = 0; i < questionList.length; i++){
				if (questionList[i].id === data.id){
					questionList.splice(i, 1);
				}
			}
		},

		// when renaming user, apply changes to question history
		renameUserGameHistory: function (oldName, newName) {
			for (var i = 0; i < questionList.length; i++){
				if (questionList[i].user === oldName){
					questionList[i].user = newName;
				}
			}
		}

	};
}( );

module.exports = function (socket) {
	var MAX_MESSAGE_LENGTH = 120;

	// generate name for new connection
	var name = userNames.getGuestName();

	// send user their default name and list of users
	// update them with current game state
	socket.emit('init',{
		name: name,
		users: userNames.getNames(),
		game: gameState.getGame()
	});

	// notify other users that user has joined
	socket.broadcast.emit('userJoin',{
		name: name
	});

	// free up name when user disconnects, broadcast to other users
	socket.on('disconnect', function (){
		socket.broadcast.emit('userLeft',{
			name: name
		});

		userNames.free(name);

		// additional case for when host disconnects
		if (gameState.getHost() === name){
			if (gameState.getGame().gameStarted === true){
				gameState.resetGame();
				socket.broadcast.emit('resetGame', {name: name});
			} else {
				gameState.renameHost('');
				socket.broadcast.emit('freeHost', {name: name});
			}
		}
	});

	// broadcast messages to other users
	socket.on('sendMessage', function (data) {
		if (data.message.length > MAX_MESSAGE_LENGTH) {
			return;
		}
		socket.broadcast.emit('message', {
			user: name,
			text: data.message
		});
	});

	// respond to name changes, broadcast if successful
	socket.on('changeName', function (data, response) {
		if (userNames.claim(data.name)){
			var oldName = name;
			userNames.free(oldName);

			name = data.name;

			if (gameState.getHost() === oldName){
				gameState.renameHost(data.name);
			}

			socket.broadcast.emit('changeName', {
				oldName: oldName,
				newName: name
			});

			gameState.renameUserGameHistory(oldName, data.name);

			response(true);
		} else {
			response(false);
		}
	});


	/* Game events 
	*  Update server state, then broadcast change to users
	*/

	socket.on('claimHost', function (data, response) {
		if (gameState.claimHost(name)){

			var dataObj = { name: name };
			socket.emit('changeHost', dataObj);
			socket.broadcast.emit('changeHost', dataObj);

			response(true);
		} else {
			response(false);
		}
	});

	socket.on('freeHost', function (data) {
		if (name === gameState.getHost()){
			gameState.renameHost('');

			var dataObj = { 
				name: name,
				secretObject: gameState.getSecretObject()
			};

			var socketEvent = 'freeHost';
			if (gameState.getGame().gameStarted === true){
				gameState.resetGame();
				socketEvent = 'endGame';
			}

			socket.emit(socketEvent, dataObj);
			socket.broadcast.emit(socketEvent, dataObj);
		}
	});

	socket.on('startGame', function (data) {
		if (name === gameState.getHost()){
			gameState.startGame(data.secretHint, data.secretObject);
			socket.broadcast.emit('startGame', { secretHint: data.secretHint });
		}
	});

	socket.on('endGame', function (data) {
		if (name === gameState.getHost()){
			gameState.resetGame();
			socket.broadcast.emit('endGame', { secretObject: data.secretObject });
		}
	});

	socket.on('sendQuestion', function (data) {
		var question = gameState.addQuestion(name, data.question);

		socket.emit('addQuestion', question);
		socket.broadcast.emit('addQuestion', question);
	});

	socket.on('answerQuestion', function (data) {
		if (name === gameState.getHost()){
			gameState.answerQuestion(data);

			socket.broadcast.emit('answerQuestion', data);
		}
	});

	socket.on('deleteQuestion', function (data) {
		if (name === gameState.getHost()){
			gameState.deleteQuestion(data);

			socket.broadcast.emit('deleteQuestion', data);
		}
	});

};