'use strict';  


angular.module('cbt')
	.controller('SettingsController', function ($scope, $location, SettingsService) {
		
		$scope.navTitle = "Settings";
		$scope.title = "Settings";
		
		$scope.itemToggle = function(index){
			return $scope.settingsList[index].checked === false;
		}
		
		$scope.settingsList = [
							{
								name: 'Autoconnect',
								text: 'Autoconnect to last device',
								checked: SettingsService.getAutoconnect() === "true",
								setter: SettingsService.setAutoconnect
							},
							{
								name: 'debugMode',
								text: 'Show developer options',
								checked: SettingsService.getDebugMode() === "true",
								setter: SettingsService.setDebugMode
							}
						];
													
													
		
	});