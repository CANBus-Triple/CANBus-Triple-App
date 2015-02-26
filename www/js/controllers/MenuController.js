'use strict';


angular.module('cbt')
	.controller('MenuController', function ($scope, $location, MenuService) {

		$scope.title = "CANBus Triple";

		$scope.list = MenuService.all();

		$scope.goTo = function(page) {
		  $location.url('/' + page);
		  $scope.cbtSideMenu.hide();
		};


		$scope.$on('SettingsService.CHANGE', function(event, name){

			switch(name){
				case 'debugMode':
					$scope.list = MenuService.all();
				break;
			}

		});
		
		$scope.listPlugins = MenuService.allPlugins();


		


	});
