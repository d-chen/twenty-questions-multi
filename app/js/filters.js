'use strict';

/* Filters */

var appFilters = angular.module('myApp.filters', []);

appFilters.filter('interpolate', ['version', function(version) {
	return function(text) {
		return String(text).replace(/\%VERSION\%/mg, version);
    }
  }]);


appFilters.filter('isAnswered', function() {
	return function (questArr, answered){
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
