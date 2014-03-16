'use strict';

/* Controllers */

angular.module('myApp.controllers', ['btford.socket-io','myApp.services']).
controller('AppCtrl', function ($scope, socket, gameService) {

	var MAX_NAME_LENGTH = 15;
	var MAX_MESSAGE_LENGTH = 120;
	var MESSAGE_HISTORY = 75;
	$scope.messages = [];
	$scope.notInit = true;

	/* Bind to gameService */
	$scope.$watch( function (){ return gameService.getAll(); }, function (newVal, oldVal) {
		$scope.host = newVal.host;
		$scope.gameStarted = newVal.gameStarted;
		$scope.secretHint = newVal.secretHint;
		$scope.questionsList = newVal.questionsList;
		$scope.questionsLeft = newVal.questionsLeft;

		// Values to control host-button, unhost-button, question-form
		$scope.hostExists = $scope.host ? true : false;
		$scope.cantBecomeHost = $scope.hostExists || $scope.notInit;
		$scope.isNotHost = $scope.host !== $scope.name;
		$scope.cantAskQuestions = (!$scope.gameStarted) || $scope.isHost || ($scope.questionsLeft <= 0);
	}, true);


	/* Socket listeners */
	socket.on('init', function (data){
		$scope.name = data.name;
		$scope.users = data.users;

		// Enable buttons
		$scope.notInit = false;
		$scope.cantBecomeHost = $scope.hostExists;

		pushMessage('Server', 'You have joined as ' + $scope.name + '.');

		//init game logic as well
		gameService.setAll(data.game);
	});

	socket.on('message', function (message) {
		pushMessage(message.user, message.text);
	});

	socket.on('changeName', function (data) {
		changeName(data.oldName, data.newName);
	});

	socket.on('userJoin', function (data) {
		$scope.users.push(data.name);
		pushMessage('Server', data.name + ' has joined.');
	});

  	socket.on('userLeft', function (data) {
  		var i, user;
  		for (i = 0; i < $scope.users.length; i++) {
  			user = $scope.users[i];
  			if (user === data.name) {
  				$scope.users.splice(i, 1);
  				pushMessage('Server', data.name + ' has left');
  				break;
  			}
  		}
  	});

  	socket.on('changeHost', function (data) {
  		gameService.changeHost(data.name);
  		pushMessage('Server', data.name + ' has become the game host.');
  	});

  	socket.on('freeHost', function (data) {
  		gameService.changeHost('');
  		pushMessage('Server', data.name + ' has stopped hosting.');
  	});

  	socket.on('addQuestion', function (data) {
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
		}

		var i;
		for (i = 0; i < $scope.users.length; i++){
			if ($scope.users[i] === oldName) {
				$scope.users[i] = newName;
				pushMessage('Server', oldName + ' is now known as ' + newName + '.');
				break;
			}
		}
	};

	// add message to list, prune as needed
	var pushMessage = function (myUser, myText){
		$scope.messages.push({
			user: myUser,
			text: myText
		});

		trimMessages();
		scrollBottom();
	};

	// reduce message count to MESSAGE_HISTORY
	var trimMessages = function () {
		var overflow = $scope.messages.length - MESSAGE_HISTORY;
		if (overflow > 0){
			$scope.messages = $scope.messages.slice(overflow);
		}
	};

	// scroll to bottom to view new messages
	var scrollBottom = function () {
		var $chatList = $('#chat-line-list');
		$chatList.animate({scrollTop:$chatList[0].scrollHeight});
	};


	/* Methods available to scope */

	$scope.changeName = function () {
		socket.emit('changeName', {
			name: $scope.newName
		}, function (result){
			if (!result) {
				alert('Error: Name is already in use.');
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

		socket.emit('sendQuestion', { question: $scope.newQuestion });

		$scope.newQuestion = '';
	};

	$scope.answerQuestion = function (qid, ans) {
		var answerObj = {
			id: qid,
			answer: ans
		};

		gameService.answerQuestion(answerObj);

		socket.emit('answerQuestion', answerObj);
	};

	$scope.deleteQuestion = function (qid) {
		gameService.deleteQuestion(qid);

		socket.emit('deleteQuestion', { id: qid });
	};

	$scope.claimHost = function () {
		socket.emit('claimHost', {});
	};

	$scope.freeHost = function () {
		socket.emit('freeHost', {});
	};

});