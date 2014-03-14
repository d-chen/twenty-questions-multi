var userNames = function () {

	var MAX_NAME_LENGTH = 15;

	// true values for names that already exist
	var names = {};
	var nextGuestId = 1;

	// return all names as an array
	var getNames = function () {
		var ret = [];

		for (user in names){
			ret.push(user);
		}

		return ret;
	};

	// claim ownership of name
	// returns false if name is already claimed
	var claim = function (name) {
		if (!name || name === 'server' || names[name]){
			return false;
		} else {
			names[name] = true;
			return true;
		}
	};

	// forfeit ownership of name
	var free = function (name) {
		if (names[name]){
			delete names[name];
		}
	};

	// create default name for new user
	var getGuestName = function () {
		var name;

		do {
			name = 'Guest ' + nextGuestId;
			nextGuestId += 1;
		} while (!claim(name));

		return name;
	}

	// encapsulate names by assigning result of calling functions
	// to userNames instead
	return {
		getNames: getNames,
		claim: claim,
		free: free,
		getGuestName: getGuestName
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


	// return game data to send to new users
	// or at the start of the game
	var get = function () {
		return {
			host: host,
			gameStarted: gameStarted,
			secretHint: secretHint,
			questionList: questionList,
			questionsLeft: questionsLeft
		};
	};

	// host sends hint and secret object to begin game
	var initGame = function (hint, object) {
		secretHint = hint;
		secretObject = object;
		gameStarted = true;
	};

	// reset game state at end or when host disconnects
	var resetGame = function () {
		host = '';
		gameStarted = false;
		secretHint = '';
		secretObject = '';
		questionList = [];
		questionsLeft = 20;
		nextQuestionId = 1;
	}

	// claim host position; return false if already occupied
	var claimHost = function (name) {
		if (!host){
			host = name;
			return true;
		} else {
			return false;
		}
	};

	// free ownership of host
	var freeHost = function () {
		host = '';
	};

	// add question to server's copy of game
	var addQuestion = function (question) {

	};

	var answerQuestion = function (qid, answer) {
		var i;
		for (i = 0; i < questionList.length; i++){
			if (questionList[i]);
		}
	};

	return {
		get: get,
		claimHost: claimHost,
		freeHost: freeHost,
		initGame: initGame,
		resetGame: resetGame

	}

}( );

module.exports = function (socket) {

	// generate name for new connection
	var name = userNames.getGuestName();

	// send user their default name and list of users
	// include current game state
	socket.emit('init',{
		name: name,
		users: userNames.getNames()

		//game state
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
	});

	// broadcast messages to other users
	socket.on('sendMessage', function (data) {
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

			socket.broadcast.emit('changeName', {
				oldName: oldName,
				newName: name
			});

			response(true);
		} else {
			response(false);
		}
	});

};