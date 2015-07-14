'use strict';


angular.module('cbt')
	.controller('MenuController', function ($scope, $state, $location, MenuService) {

		$scope.title = "CANBus Triple";

		$scope.list = MenuService.all();

		$scope.$on('SettingsService.CHANGE', function(event, name){

			switch(name){
				case 'debugMode':
					$scope.list = MenuService.all();
				break;
			}

		});

		$scope.$on('$stateChangeStart', function(event, name){
			$scope.cbtSideMenu.hide();
		});


		$scope.listPlugins = MenuService.allPlugins();


	});
