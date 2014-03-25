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
		$scope.questionList = newVal.questionList;
		$scope.questionsLeft = newVal.questionsLeft;
		$scope.secretObject = newVal.secretObject;

		console.log($scope.questionList);

		// Values to disable buttons
		$scope.hostExists = $scope.host ? true : false;
		$scope.cantBecomeHost = $scope.hostExists || $scope.notInit;
		$scope.isNotHost = $scope.host !== $scope.name;
		$scope.cantAskQuestions = (!$scope.gameStarted) || !$scope.isNotHost || ($scope.questionsLeft <= 0);
		$scope.cantSetSecret = $scope.isNotHost || $scope.gameStarted;
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
		renameUserChatHistory(data.oldName, data.newName);
		renameUserGameHistory(data.oldName, data.newName);
	});

	socket.on('userJoin', function (data) {
		$scope.users.push(data.name);
	});

	socket.on('userLeft', function (data) {
		var i, user;
		for (i = 0; i < $scope.users.length; i++) {
			user = $scope.users[i];
			if (user === data.name) {
				$scope.users.splice(i, 1);
				break;
			}
		}
	});

	socket.on('changeHost', function (data) {
		gameService.changeHost(data.name);
		pushMessage('Server', data.name + ' is the game host.');
	});

	socket.on('freeHost', function (data) {
		gameService.changeHost('');
		pushMessage('Server', data.name + ' has stopped hosting.');
	});

	socket.on('startGame', function (data) {
		gameService.startGame(data);
		pushMessage('Server', 'Game has started. The topic is: "' + data.secretHint + '"');
	});

	socket.on('endGame', function (data) {
		pushMessage('Server', 'Game ended. The answer was "' + data.secretObject + '"');
		gameService.resetGame();
	});

	socket.on('resetGame', function (data) {
		gameService.resetGame();
		pushMessage('Server', data.name + ' has stopped hosting. Game reset.');
	});

	socket.on('addQuestion', function (data) {
		gameService.addQuestion(data);
	});

	socket.on('answerQuestion', function (data) {
		gameService.answerQuestion(data);

		var response = data.answer ? "YES" : "NO";
		pushMessage('Server', $scope.host + " answered " + response + " to '" + data.question + "'");
	});

	socket.on('deleteQuestion', function (data) {
		gameService.deleteQuestion(data);

		var deleteMsg = " Please reformat question to be answered with 'Yes/No'.";
		pushMessage('Server', $scope.host + " ignored '" + data.question + "'." + deleteMsg);
	});

	/* Helper functions */

	// rename user within user list
	var changeName = function (oldName, newName) {
		var i;
		for (i = 0; i < $scope.users.length; i++){
			if ($scope.users[i] === oldName) {
				$scope.users[i] = newName;
				pushMessage('Server', oldName + ' is now known as ' + newName + '.');

				// change host as well
				if ($scope.host === oldName){
					gameService.changeHost(newName);
				}
				break;
			}
		}
	};

	// when renaming user, apply changes to chat history as well
	var renameUserChatHistory = function (oldName, newName) {
		for (var i = 0; i < $scope.messages.length; i++){
			if ($scope.messages[i].user === oldName){
				$scope.messages[i].user = newName;
			}
		}
	};

	// when renaming user, apply changes to question history
	var renameUserGameHistory = function (oldName, newName) {
		for (var i = 0; i < $scope.questionList.length; i++){
			if ($scope.questionList[i].user === oldName){
				$scope.questionList[i].user = newName;
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
		if ($scope.newName.length > MAX_NAME_LENGTH){
			var text = 'Please choose a shorter name. Limit: ' + MAX_NAME_LENGTH + ' characters';
			alert(text);
			return;
		}

		socket.emit('changeName', {
			name: $scope.newName
		}, function (result){
			if (!result) {
				alert('Error: Name is already in use.');
			} else {
				// change host as well
				if ($scope.host === $scope.name){
					gameService.changeHost($scope.newName);
				}

				changeName($scope.name, $scope.newName);
				renameUserChatHistory($scope.name, $scope.newName);
				renameUserGameHistory($scope.name, $scope.newName);
				$scope.name = $scope.newName;
			}
		});
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

	$scope.answerQuestion = function (qid, qst, ans) {
		var answerObj = {
			id: qid,
			question: qst,
			answer: ans
		};

		var shouldEndGame = gameService.answerQuestion(answerObj);
		socket.emit('answerQuestion', answerObj);

		var response = ans ? "YES" : "NO";
		pushMessage('Server', $scope.host + " answered " + response + " to '" + qst + "'");

		if (shouldEndGame){
			$scope.endGame();
		}
	};

	$scope.deleteQuestion = function (qid, qst) {
		gameService.deleteQuestion({ id: qid});

		var deleteMsg = " Please reformat question to be answered with 'Yes/No'.";
		pushMessage('Server', $scope.host + " ignored '" + qst + "'." + deleteMsg);
		socket.emit('deleteQuestion', { id: qid, question: qst });
	};

	$scope.claimHost = function () {
		socket.emit('claimHost', {});
	};

	$scope.freeHost = function () {
		socket.emit('freeHost', {});
	};

	$scope.startGame = function () {
		if (!$scope.newSecretHint || !$scope.newSecretObject){
			alert('Please fill in both the hint and secret answer.');
			return;
		}

		var data = {
			secretHint: $scope.newSecretHint,
			secretObject: $scope.newSecretObject
		};
		$scope.newSecretHint = '';
		$scope.newSecretObject = '';

		gameService.startGame(data);
		pushMessage('Server', 'Game has started. The topic is: "' + data.secretHint + '"');
		socket.emit('startGame', data);
	};

	$scope.endGame = function () {
		pushMessage('Server', 'Game ended. The answer was "' + $scope.secretObject + '"');
		socket.emit('endGame', {secretObject: $scope.secretObject});
		gameService.resetGame();
	};

});