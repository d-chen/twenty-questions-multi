var userNames = function () {

	var MAX_NAME_LENGTH = 16;

	// true values for names that already exist
	names = {};
	nextGuestId = 1;


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