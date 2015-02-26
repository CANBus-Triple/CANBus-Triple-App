'use strict';


angular.module('cbt')
	.controller('LoggerController', function ($scope, $location, $timeout, $ionicPopover, HardwareService, UtilsService) {

		$scope.title = "CANBus Triple";
		
		$scope.navTitle = "Packet Logger";
	  
	  $scope.viewPid = function(id){
	  	$scope.selectedPid = id;
		  $location.url('/pidfinder/view');
	  }
	  
	  
	  $scope.busSettings = {
		  can1log: true,
		  can2log: false,
		  can3log: false
	  }
	  
	  $scope.$watchCollection(
	    "busSettings",
	    function( newValue, oldValue ) {
				console.log(newValue);
	    }
    );
	  
	  
	  
	  $scope.interestMids = [];
	  $scope.toggleIntrest = function(mid, event){
	  	
		  if( $scope.interestMids.indexOf(mid) > -1 ){
		  	$scope.interestMids.splice( $scope.interestMids.indexOf(mid), 1 );
		  	//event.target.parentElement.bgColor = '';
		  }else{
				$scope.interestMids.push(mid);
				//event.target.parentElement.bgColor = '#dbdbdb';
				}
			
			$timeout(function(){
				$scope.modeSwitchDisabled = !($scope.interestMids.length > 0);
				},5);
				
	  }
	  $scope.isInterested = function(mid){
		  if( $scope.interestMids.indexOf(mid) > -1 )
		  	return true;
	  }
	  
	  
	  $scope.modeSwitchDisabled = true;
	  
	  $scope.viewMode = "Compact";
	  $scope.switchMode = function(event){
			
			switch($scope.viewMode){
				case 'Compact':
					$scope.viewMode = "Chronological";
				break;
				case 'Chronological':
					$scope.viewMode = "Compact";
				break;
			}
			
			$scope.clearBuffer();
			
	  }
		
	  
	  
	  	  
	  $scope.midBuffer = [];
	  $scope.clearBuffer = function(){
		  $scope.midBuffer.splice(0, $scope.midBuffer.length);
	  }
	  
	  	  
	  $scope.numberToHexString = function(n){
	  	if(typeof n == 'undefined')return 'null';
		  return n.toString(16).toUpperCase();
	  }
	
		$scope.readHandler = function(packet){
			
			// Cron mode
			if( $scope.viewMode === "Chronological" ){
				
				if( $scope.interestMids.indexOf(packet.messageId) > -1 )
					$scope.midBuffer.unshift({mid: packet.messageId, packet: packet});
				
				$timeout(function(){}, 1);
				
				return;
			}
			
			// Compact mode
			
			var obj = _.find($scope.midBuffer, function(obj){ return obj.mid == packet.messageId });

			if( obj )
				obj['packet'] = packet;
			else
				$scope.midBuffer.unshift({mid: packet.messageId, packet: packet});
			

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
