'use strict';  


angular.module('cbt')
	.controller('DashboardController', function ($scope, $location, MenuService) {
		
		$scope.navTitle = "Dashboard";
		$scope.title = "Dashboard";
		
		$scope.leftButtons = [{
		  type: 'button-icon icon ion-navicon',
	    tap: function(e) {
	      $scope.sideMenuController.toggleLeft();
	    }
		}];
		
		$scope.rightButtons = [];
		
		
	});