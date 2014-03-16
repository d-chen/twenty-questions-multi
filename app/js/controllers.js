'use strict';

/* Controllers */

angular.module('myApp.controllers', ['btford.socket-io','myApp.services']).
controller('AppCtrl', function ($scope, socket, gameService) {

	var MAX_NAME_LENGTH = 15;
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


  	socket.on('newQuestion', function (data) {
  		gameService.addQuestion(data);
  	});

  	socket.on('answerQuestion', function (data) {
  		var questionObj = gameService.answerQuestion(data.id, data.answer);

  		var host = gameService.getHost();
  		var response = data.answer ? "YES" : "NO";
  		var text = response + " to '" + questionObj.question + "'";

  		pushMessage(host, text);
  	});

  	socket.on('deleteQuestion', function (data) {
  		gameService.deleteQuestion(data.id);
  	});

  	/* Helper functions */

	// rename user within user list
	var changeName = function (oldName, newName) {
		if (newName.length > MAX_NAME_LENGTH){
			var text = 'Please choose a shorter name. Limit: ' + MAX_NAME_LENGTH + ' characters';
			alert(text);
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
			var text = 'Message too long. Limit: ' + MAX_MESSAGE_LENGTH + ' characters';
			pushMessage('Server', text);
			return;
		}

		// don't set sender's name locally to prevent spoofing other users
		socket.emit('sendMessage', {
			message: $scope.message
		});

		// add message to local model
		pushMessage($scope.name, $scope.message);

		// clear message box after submission
		$scope.message = '';
	};

	$scope.sendQuestion = function () {
		if ($scope.newQuestion.length === 0) return;

		socket.emit('sendQuestion', {
			question: $scope.newQuestion
		});

		$scope.newQuestion = '';
	};

});