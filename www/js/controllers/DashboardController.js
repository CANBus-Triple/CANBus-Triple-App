'use strict';  


angular.module('cbt')
	.controller('ConnectionController', function ($scope, $location, MenuService) {
		
		$scope.title = "CANBus Triple";
		
		$scope.list = MenuService.all();
		
		$scope.goTo = function(page) {
		  console.log('Going to ' + page);
		  $scope.sideMenuController.toggleLeft();
		  $location.url('/' + page);
		};
		
		
	});