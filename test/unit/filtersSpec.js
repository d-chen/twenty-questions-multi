'use strict';

/* jasmine specs for filters go here */

describe('Filters. ', function() {
	//load module
	beforeEach(module('myApp.filters'));
	var myFilter;

	describe('hostStatus: ', function() {
		// load filter into var
		beforeEach(inject(function ($filter) {
			myFilter = $filter('hostStatus');
		}));

		it('filter should exist', function() {
			expect(myFilter).not.toEqual(null);
		});

		it('name is displayed', function() {
			expect(myFilter('SOME NAME')).toEqual('SOME NAME');
		});

		it('no host msg is shown', function() {
			expect(myFilter('')).toEqual("<No Current Host>");
		});

	});

	describe('gameStatus: ', function () {
		beforeEach(inject(function ($filter) {
			myFilter = $filter('gameStatus');
		}));

		it('filter should exist', function() {
			expect(myFilter).not.toEqual(null);
		});

		it('game started msg', function() {
			expect(myFilter(true)).toEqual("Game started.");
		});

		it('awaiting host msg', function() {
			expect(myFilter(false)).toEqual("Awaiting host.");
		});

	});

	describe('hintStatus: ', function () {
		beforeEach(inject(function ($filter) {
			myFilter = $filter('hintStatus');
		}));

		it('filter should exist', function() {
			expect(myFilter).not.toEqual(null);
		});

		it('displays hint', function() {
			expect(myFilter('hint')).toEqual('hint');
		});

		it('displays "..."', function() {
			expect(myFilter('')).toEqual('...');
		});

	});

	describe('yesOrNo: ', function () {
		beforeEach(inject(function ($filter) {
			myFilter = $filter('yesOrNo');
		}));

		it('filter should exist', function() {
			expect(myFilter).not.toEqual(null);
		});

		it('displays Yes', function() {
			expect(myFilter(true)).toEqual('Yes');
		});

		it('displays No', function() {
			expect(myFilter(false)).toEqual('No');
		});
	});

	describe('isAnswered: ', function() {
		var mockQ = [
			{isAnswered: true},
			{isAnswered: true},
			{isAnswered: false},
			{isAnswered: true},
			{isAnswered: false}
		];

		beforeEach(inject(function ($filter) {
			myFilter = $filter('isAnswered');
		}));

		it('filter should exist', function() {
			expect(myFilter).not.toEqual(null);
		});

		it('should filter 3 answered', function() {
			expect(myFilter(mockQ, true).length).toEqual(3);
		});

		it('should filter 2 unanswered', function() {
			expect(myFilter(mockQ, false).length).toEqual(2);
		});

	});


});
