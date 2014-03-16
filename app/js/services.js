'use strict';

/* Services */

// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', ['btford.socket-io']).
service('gameService', function (socket) {
	var host = '';
	var gameStarted = false;
	var secretHint = '';
	var questionList = [];
	var questionsLeft = 20;

	var secretObject = '';

	return {
		getHost: function () { return host; },
		getGameStarted: function () { return gameStarted; },
		getSecretHint: function () { return secretHint; },
		getQuestionList: function () { return questionList; },
		getQuestionsLeft: function () { return questionsLeft; },


		changeHost: function (hostName) { 
			host = hostName; 
		},

		addQuestion: function (question) { 
			questionList.push(question); 
		},

		answerQuestion: function (qid, ans) {
			var i;
			for (i = 0; i < questionList.length; i++){
				if (questionList[i].id === qid){
					questionList[i].answer = ans;
					questionList[i].isAnswered = true;

					questionsLeft -= 1;
					return questionList[i];
				}
			}
		},

		deleteQuestion: function (qid) {
			var i;
			for (i = 0; i < questionList.length; i++){
				if (questionList[i].id === qid){
					questionList.splice(i, 1);
					return;
				}
			}
		}

	};

});