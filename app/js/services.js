'use strict';

/* Services */

// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).
service('gameService', function (){
	var host = '';
	var gameStarted = false;
	var secretHint = '';
	var questionList = [];
	var questionsLeft = 20;

	var secretObject = '';

	return {
		getAll: function () {
			return {
				host: host,
				gameStarted: gameStarted,
				secretHint: secretHint,
				questionList: questionList,
				questionsLeft: questionsLeft,
				secretObject: secretObject
			};
		},

		setAll: function (data) {
			host = data.host;
			gameStarted = data.gameStarted;
			secretHint = data.secretHint;
			questionList = data.questionList;
			questionsLeft = data.questionsLeft;
		},

		startGame: function (data) {
			gameStarted = true;
			secretHint = data.secretHint;
			questionList = [];
			questionsLeft = 20;
			if (data.secretObject){ secretObject = data.secretObject; }
		},

		// used for when game ends
		resetGame: function () {
			host = '';
			gameStarted = false;
			secretHint = '';
			secretObject = '';
			questionList = [];
			questionsLeft = 20;
		},

		changeHost: function (hostName) { 
			host = hostName; 
		},

		setHint: function (hint) {
			secretHint = hint;
		},

		setSecret: function (secret) {
			secretObject = secret;
		},

		addQuestion: function (question) { 
			questionList.push(question); 
		},

		answerQuestion: function (data) {
			for (var i = 0; i < questionList.length; i++){
				if (questionList[i].id === data.id){
					questionList[i].answer = data.answer;
					
					if (questionList[i].isAnswered === false){
						questionList[i].isAnswered = true;
						questionsLeft -= 1;
					}
					
					return (questionsLeft === 0);
				}
			}
		},

		deleteQuestion: function (data) {
			for (var i = 0; i < questionList.length; i++){
				if (questionList[i].id === data.id){
					if (questionList[i].isAnswered === true){
						questionsLeft += 1;
					}
					questionList.splice(i, 1);
					return;
				}
			}
		}

	};

});