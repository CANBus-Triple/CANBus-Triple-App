'use strict';


angular.module('cbt')
	.controller('ConnectionController', function ($scope, $state, $timeout, HardwareService, BluetoothService, SerialService, SettingsService) {

		$scope.navTitle = "Connect to your CANBus Triple";
		$scope.title = "Connect";


		$scope.rightButtons = [{
			type: 'button-icon icon ion-ios7-circle-filled',
			tap: function(e) {
					HardwareService.disconnect();
				}
		}];

		/*
		*	Init
		*/


		$scope.btDiscovered = BluetoothService.discovered;
		$scope.serialDiscovered = SerialService.discovered;

		//if( SettingsService.getAutoconnect() == "false" )
			$timeout(function(){
				HardwareService.search(true);
			}, 400);





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

		$scope.$on('HardwareService.CONNECTED',function(){
			$timeout(function(){
				$state.go('hardware.status');
			}, 1000);
		});

		$scope.$on('$destroy', function(){
    	HardwareService.search(false);
		});



	});
