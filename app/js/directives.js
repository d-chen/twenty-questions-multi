'use strict';

/* Directives */

var appDirectives = angular.module('myApp.directives', []);

appDirectives.directive('pendingQuestionList', function () {
	return {
		restrict: 'E',
		
		templateUrl: '/partials/pendingQuestionsList.html',
		replace: true,

		scope: {

		}
	}

});