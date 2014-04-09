'use strict';  


angular.module('cbt')
	.controller('ConnectionController', function ($scope, $timeout, HardwareService, BluetoothService, SerialService, SettingsService) {
		
		$scope.navTitle = "Connect to your CANBus Triple";
		$scope.title = "Connect";
		
		
		/*
		*	Init
		*/
		
		
		$scope.btDiscovered = BluetoothService.discovered;
		$scope.serialDiscovered = SerialService.discovered;
		
		$timeout(function(){
			HardwareService.search(true);
		}, 1200);
	
	

		
		
		/*
		*	Methods
		*/
		
		$scope.deviceConnect = function( device ){
			SettingsService.setDevice(device);
			HardwareService.connect();
		}
		
		$scope.search = function(){
			HardwareService.search(true);
		}
		
		
		
		
		
		
		/*
		*	Event Listeners
		*/
		
		$scope.$on('$destroy', function(){
    	HardwareService.search(false);
		});
		
		
		
	});