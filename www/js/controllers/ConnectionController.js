'use strict';  


angular.module('cbt')
	.controller('ConnectionController', function ($scope, $timeout, HardwareService, BluetoothService, SerialService, localStorageService) {
		
		$scope.navTitle = "Connect to your CANBus Triple";
		$scope.title = "Connect";
		
		$scope.leftButtons = [{
		  type: 'button-icon icon ion-navicon',
	    tap: function(e) {
	      $scope.sideMenuController.toggleLeft();
	    }
		}];
		
		$scope.rightButtons = [];
		
		
		
		
		$scope.btDiscovered = BluetoothService.discovered;
		$scope.serialDiscovered = SerialService.discovered;
		
		
		/*
		*	Methods
		*/
		
		$scope.deviceConnect = function( id ){
			console.log("Connect to ", id);
			
			localStorageService.add('device', id);
			/*
			*	Save device in local storage and then call hardwareservice.connect
			*/
			
		}
		
		$scope.search = function(){
			HardwareService.search(true);
		}
		
		
		/*
		*	Init
		*/
		
		
		
		/*
		*	Event Listeners
		*/
		
		$scope.$on('$destroy', function(){
			
		});
		
		
		
	});