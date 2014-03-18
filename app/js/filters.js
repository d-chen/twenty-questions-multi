'use strict';

/* Filters */

var appFilters = angular.module('myApp.filters', []);

appFilters.filter('hostStatus', function() {
	return function (name){
		return (name) ? name : "<No Current Host>";
	}
});

appFilters.filter('gameStatus', function() {
	return function (bool){
		return (bool) ? "Game started." : "Awaiting host." ;
	};
});

appFilters.filter('hintStatus', function() {
	return function (hint){
		return (hint) ? hint : "..." ;
	}
});

appFilters.filter('yesOrNo', function() {
	return function (answer){
		return (answer) ? "Yes" : "No";
	}
});

appFilters.filter('isAnswered', function() {
	return function (questArr, answered){
		if (!questArr) return;
		var output = [];
		var i;

		for (i = 0; i < questArr.length; i++){
			if (questArr[i].isAnswered === answered) {
				output.push(questArr[i]);
			}
		}
		return output;
	};
});
