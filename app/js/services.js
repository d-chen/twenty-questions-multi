'use strict';

/* Services */

// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', ['btford.socket-io']).
service('gameService', function (socket) {
	var host = '';
	var secretHint = '';
	var secretObject = '';
	var questionList = [];
	var questionsLeft = 20;

	this.changeHost = function (hostName) {

	};

});