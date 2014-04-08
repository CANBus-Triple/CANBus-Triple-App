'use strict';

/*
*		Derek K etx313@gmail.com
*		Display a selectable list of CANBus hardware discovered
*	
*/


angular.module('cbt')
.directive('deviceList', function($timeout, HardwareService){
	
  return {
    restrict: 'EA',
    scope: {
	    deviceConnect: '=',
	    btDiscovered: '=',
	    serialDiscovered: '=',
    },
    controller: function deviceListController($scope, BluetoothService, SerialService){
	    
	    $scope.found = function(){
			  if( Object.keys($scope.btDiscovered).length > 0 || Object.keys($scope.serialDiscovered).length > 0 )
		    	return true;
			}
	    
    },
    template: '<div class="list card height-animation" ng-show="found()">'+
	    	'<a class="item item-icon-left" ng-repeat="device in btDiscovered" ng-click="deviceConnect(device)"><i class="icon ion-bluetooth"></i>{{device.name}}</a>'+
				'<a class="item item-icon-left" ng-repeat="device in serialDiscovered" ng-click="deviceConnect({address:\'serial\'})"><i class="icon ion-usb"></i>{{device.name}}</a>'+
	    '</div>',
    link: function($scope){
	    
	    // $scope.$on('$destroy', function() {});
			
    },
    replace: true
  };
});
