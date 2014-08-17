'use strict';


angular.module('cbt')
	.controller('LoggerController', function ($scope, $location, $timeout, $ionicPopover, HardwareService, UtilsService) {

		$scope.title = "CANBus Triple";
		
		$scope.navTitle = "Packet Logger";
	  
	  $scope.viewPid = function(id){
	  	$scope.selectedPid = id;
		  $location.url('/pidfinder/view');
	  }
	  
		
	  
	  
	  	  
	  $scope.midBuffer = [];	  
	  
	  	  
	  $scope.numberToHexString = function(n){
	  	if(typeof n == 'undefined')return 'null';
		  return n.toString(16).toUpperCase();
	  }
	
		$scope.readHandler = function(packet){
			
			// console.log( packet.toString() );
			
			var obj = _.find($scope.midBuffer, function(obj){ return obj.mid == packet.messageId });

			if( obj )
				obj['packet'] = packet;
			else
				$scope.midBuffer.push({mid: packet.messageId, packet: packet});
			

			$timeout(function(){}, 1);
				
				
		}
	
		HardwareService.registerPacketHandler($scope.readHandler);
		$scope.$on("$destroy", function() {
    	HardwareService.deregisterPacketHandler($scope.readHandler);	
    });


	  
	  $ionicPopover.fromTemplateUrl('popover.html', {
	    scope: $scope,
	  }).then(function(popover) {
	    $scope.popover = popover;
	  });
	  $scope.openPopover = function($event) {
	    $scope.popover.show($event);
	  };
	  $scope.closePopover = function() {
	    $scope.popover.hide();
	  };
	  //Cleanup the popover when we're done with it!
	  $scope.$on('$destroy', function() {
	    $scope.popover.remove();
	  });
	  // Execute action on hide popover
	  $scope.$on('popover.hidden', function() {
	    // Execute action
	  });
	  // Execute action on remove popover
	  $scope.$on('popover.removed', function() {
	    // Execute action
	  });
		
		
	});
