'use strict';

/* Controllers */

angular.module('myApp.controllers', ['btford.socket-io']).
controller('AppCtrl', function ($scope, socket) {

	var MAX_NAME_LENGTH = 16;
	var MAX_MESSAGE_LENGTH = 120;
	var MESSAGE_HISTORY = 75;
	$scope.messages = [];

	/* Socket listeners */
	socket.on('init', function (data){
		$scope.name = data.name;
		$scope.users = data.users;

		$scope.newName = data.name;

		//init game logic as well

	});

	socket.on('message', function (message) {
		pushMessage(message.user, message.text);
	});

	socket.on('changeName', function (data) {
		changeName(data.oldName, data.newName);
	});

	// add message when user joins room
	socket.on('userJoin', function (data) {
		$scope.users.push(data.name);

		var text = data.name + ' has joined.';
		pushMessage('Server', text);
	});

  	// add a message when a user disconnects
  	socket.on('userLeft', function (data) {
  		var i, user;
  		for (i = 0; i < $scope.users.length; i++) {
  			user = $scope.users[i];
  			if (user === data.name) {
  				$scope.users.splice(i, 1);
  				break;
  			}
  		}

  		var text = data.name + ' has left.';
  		pushMessage('Server', text);
  	});

  	/* Helper functions */

	// rename user within user list
	var changeName = function (oldName, newName) {
		if (newName.length > MAX_NAME_LENGTH){
			alert('Please choose a shorter name. (16 characters)');
			return;
			$scope.newName = $scope.name;
		}

		var i;
		for (i = 0; i < $scope.users.length; i++){
			if ($scope.users[i] === oldName) {
				$scope.users[i] = newName;
				break;
			}
		}

		var text = oldName + ' changed name to ' + newName + '.';
		pushMessage('Server', text);
	}

	// add message to list, prune as needed
	var pushMessage = function (myUser, myText){
		$scope.messages.push({
			user: myUser,
			text: myText
		});

		trimMessages();
		scrollBottom();
	}

	// reduce message count to MESSAGE_HISTORY
	var trimMessages = function () {
		var overflow = $scope.messages.length - MESSAGE_HISTORY;
		if (overflow > 0){
			$scope.messages = $scope.messages.slice(overflow);
		}
	}

	// scroll to bottom to view new messages
	var scrollBottom = function () {
		var $chatList = $('#chat-line-list');
		$chatList.animate({scrollTop:$chatList[0].scrollHeight});
	}


	/* Methods available to scope */

	$scope.changeName = function () {
		socket.emit('changeName', {
			name: $scope.newName
		}, function (result){
			if (!result) {
				alert('Error: Name is already in use.');
				$scope.newName = $scope.name;
			} else {
				changeName($scope.name, $scope.newName);

				$scope.name = $scope.newName;
			}
		})
	};

	$scope.sendMessage = function () {
		if ($scope.message.length === 0) return;
		if ($scope.message.length > MAX_MESSAGE_LENGTH){
			$scope.messages.push({
				user: 'Server',
				text: 'Message too long. (Limit: 120 characters)'
			})
			return;
		}

		// don't set sender's name locally to prevent spoofing other users
		socket.emit('sendMessage', {
			message: $scope.message
		});

		// add message to local model
		$scope.messages.push({
			user: $scope.name,
			text: $scope.message
		});

		// clear message box after submission
		$scope.message = '';

		trimMessages();
		scrollBottom();
	};

});