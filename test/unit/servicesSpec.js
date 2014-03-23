'use strict';

/* jasmine specs for services go here */

describe('GameService ', function() {
	beforeEach(module('myApp.services'));

	it('should exists', inject(function (gameService){
		expect(gameService).not.toEqual(null);
	}));

	it('cant access private members', inject(function (gameService){
		expect(gameService.host).toEqual(undefined);
		expect(gameService.gameStarted).toEqual(undefined);
	}));

	it('getAll', inject(function (gameService){
		var defaultState = {
			host: '',
			gameStarted: false,
			secretHint: '',
			questionList: [],
			questionsLeft: 20,
			secretObject: ''
		};

		expect(gameService.getAll()).toEqual(defaultState);
	}));

	it('setAll', inject(function (gameService){
		var newState = {
			host: 'Host',
			gameStarted: true,
			secretHint: 'Hint',
			questionList: [],
			questionsLeft: 20
		};

		gameService.setAll(newState);
		newState.secretObject = '';
		expect(gameService.getAll()).toEqual(newState);
	}));

	it('startGame', inject(function (gameService){
		var data = {
			secretHint: 'hint'
		};

		var newState = {
			host: '',
			gameStarted: true,
			secretHint: 'hint',
			questionList: [],
			questionsLeft: 20,
			secretObject: ''
		};

		gameService.startGame(data);
		expect(gameService.getAll()).toEqual(newState);
	}));

	it('endGame', inject(function (gameService){
		gameService.startGame({secretHint: 'hint'});
		gameService.endGame();
		expect(gameService.getAll().secretHint).toEqual('');
	}));

	it('resetGame', inject(function (gameService){
		var defaultState = gameService.getAll();
		var newState = {
			host: 'host',
			gameStarted: true,
			secretHint: 'hint',
			questionList: [],
			questionsLeft: 20,
			secretObject: ''
		};

		gameService.setAll(newState);
		gameService.resetGame();
		expect(gameService.getAll()).toEqual(defaultState);
	}));

	it('changeHost', inject(function (gameService){
		var newHost = 'host';
		gameService.changeHost(newHost);
		expect(gameService.getAll().host).toEqual(newHost);
	}));

	it('setHint', inject(function (gameService){
		var newHint = 'stuff';
		gameService.setHint(newHint);
		expect(gameService.getAll().secretHint).toEqual(newHint);
	}));

	it('setSecret', inject(function (gameService){
		var newSecret = 'thing';
		gameService.setSecret(newSecret);
		expect(gameService.getAll().secretObject).toEqual(newSecret);
	}));

	it('addQuestion', inject(function (gameService){
		expect(gameService.getAll().questionList.length).toEqual(0);
		gameService.addQuestion({});
		expect(gameService.getAll().questionList.length).toEqual(1);
	}));

	it('answerQuestion', inject(function (gameService){
		expect(gameService.getAll().questionList.length).toEqual(0);
		
		gameService.addQuestion({
			id: 1,
			user: 'user',
			question: 'qqq',
			isAnswered: false,
		});

		gameService.answerQuestion({
			id: 1,
			answer: false
		});

		expect(gameService.getAll().questionList[0].isAnswered).toEqual(true);
		expect(gameService.getAll().questionList[0].answer).toEqual(false);
	}));

	it('deleteQuestion', inject(function (gameService){
		var qList = gameService.getAll().questionList;
		expect(qList.length).toEqual(0);

		gameService.addQuestion({id: 1});
		gameService.addQuestion({id: 2});

		qList = gameService.getAll().questionList;
		expect(qList.length).toEqual(2);
		gameService.deleteQuestion({id: 2});

		qList = gameService.getAll().questionList;
		expect(qList.length).toEqual(1);
		expect(qList[0].id).toEqual(1);
	}));

});
