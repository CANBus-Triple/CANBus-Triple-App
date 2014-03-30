'use strict';  


angular.module('cbt')
	.controller('ConnectionController', function ($scope, $location, MenuService) {
		
		$scope.navTitle = "Connect to your CANBus Triple";
		$scope.title = "Connect";
		
		$scope.leftButtons = [{
		  type: 'button-icon icon ion-navicon',
	    tap: function(e) {
	      $scope.sideMenuController.toggleLeft();
	    }
		}];
		
		$scope.rightButtons = [];
		
		
	});