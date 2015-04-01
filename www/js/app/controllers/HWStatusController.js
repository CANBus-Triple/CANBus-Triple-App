'use strict';  


angular.module('cbt')
	.controller('HWStatusController', function ($rootScope, $scope, $http, $interval, HardwareService) {
  
    $scope.navTitle = "Connect to your CANBus Triple";
		$scope.title = "Connect";

/*

		$scope.rightButtons = [{
			type: 'button-icon icon ion-ios7-circle-filled',
			tap: function(e) {
					HardwareService.disconnect();
				}
		}];
*/



	$rootScope.$on( 'hardwareEvent', hardwareEventHandler );
	
	
	function hardwareEventHandler( eventName, eventObject ){
		
		console.log( eventObject );
		
	}
	
	
	
	
	$scope.updateStatus = function(){
		// Send bus one status inquiry
		HardwareService.send( String.fromCharCode(0x01, 0x10, 0x01) );
	}
	
	
	


  
	});
