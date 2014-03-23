'use strict';

/* jasmine specs for controllers go here */

describe('AppCtrl ', function(){
	beforeEach(module('myApp.controllers'));
	beforeEach(module('myApp.services'));
	
	var scope, service, ctrl, sock;
	beforeEach(inject(function ($controller, $rootScope, socket, gameService) {
		scope = $rootScope.$new();
		service = gameService;
		sock = socket;
		ctrl = $controller('AppCtrl', {$scope: scope, socket: socket, gameService: service});
}));


	it('should be able to listen on an event', inject(function (){
		expect(sock.on('test-event', function(){})).not.toBe(false);
	}));

	it('should be able to emit an event', inject(function () {
		expect(sock.emit('test-event', {})).not.toBe(false);
	}));

	/*
	it('should ', inject(function () {
		
	}));
*/
});
