'use strict';  


angular.module('cbt')
	.controller('MenuController', function ($scope, $location, MenuService) {
		
		$scope.title = "CANBus Triple";
		
		$scope.list = MenuService.all();
		
		$scope.goTo = function(page) {
		  console.log('Going to ' + page);
		  $scope.sideMenuController.toggleLeft();
		  $location.url('/' + page);
		};
				
		
		
		
	});