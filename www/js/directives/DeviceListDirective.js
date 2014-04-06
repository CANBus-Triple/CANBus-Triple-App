'use strict';

/*
*		Derek K etx313@gmail.com
*		HardwareService manages Bluetooth LE and Serial Connections
*	
*/


angular.module('cbt')
.directive('deviceList', function($timeout, HardwareService){

	// Init	
	$timeout(function(){
		HardwareService.search(true);
	}, 700);
	
	

  return {
    restrict: 'EA',
    /* scope: {
	    deviceConnect: '&'
    }, */
    controller: function deviceListController($scope, BluetoothService, SerialService){
	    
	    // Move this to controller?
	    $scope.btDiscovered = BluetoothService.discovered;
			$scope.serialDiscovered = SerialService.discovered;
	    $scope.found = function(){
			  if( Object.keys($scope.btDiscovered).length > 0 || Object.keys($scope.serialDiscovered).length > 0 )
		    	return true;
			}
	    
    },
    template: '<div class="list card height-animation" ng-show="found()">'+
	    	'<a class="item item-icon-left" ng-repeat="device in btDiscovered" ng-click="deviceConnect(device.address)"><i class="icon ion-bluetooth"></i>{{device.name}}</a>'+
				'<a class="item item-icon-left" ng-repeat="device in serialDiscovered" ng-click="deviceConnect(\'serial\')"><i class="icon ion-usb"></i>{{device.name}}</a>'+
	    '</div>',
    link: function($scope){
	    
	    $scope.$on('$destroy', function() {
      	HardwareService.search(false);
			});
			
    },
    replace: true
  };
});
