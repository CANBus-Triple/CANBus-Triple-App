'use strict';


angular.module('cbt')
	.controller('LoggerController', function ($scope, $state, $location, $timeout, $ionicPopover, HardwareService, UtilsService) {

		var maxMessages = process ? 128:32, // 128 messsages on desktop, 32 on mobile
				viewMode = {
					CRON: 'Chronological',
					COMPACT: 'Compact'
				};

		$scope.title = "CANBus Triple";
		$scope.navTitle = "Packet Logger";

		$scope.filterMids = [];

		$scope.showCmdBtn();

	  $scope.viewPid = function(id){
	  	$scope.selectedPid = id;
		  $location.url('/pidfinder/view');
			// use $state
	  }


	  $scope.busSettings = {
		  can1log: false,
		  can2log: false,
		  can3log: false
	  }

	  $scope.$watchCollection(
	    "busSettings.can1log",
	    function( newValue, oldValue ) {
				if($scope.hardwareConnected) HardwareService.command('bus1log'+(newValue?'On':'Off'),[0,0,0,0]);
	    }
    );
		$scope.$watchCollection(
			"busSettings.can2log",
			function( newValue, oldValue ) {
				if($scope.hardwareConnected) HardwareService.command('bus2log'+(newValue?'On':'Off'),[0,0,0,0]);
			}
		);
		$scope.$watchCollection(
	    "busSettings.can3log",
	    function( newValue, oldValue ) {
				if($scope.hardwareConnected) HardwareService.command('bus3log'+(newValue?'On':'Off'),[0,0,0,0]);
	    }
    );

		// $scope.$watchCollection(
	  //   "hardwareConnected",
	  //   function( newValue, oldValue ) {
		// 		console.log(arguments);
	  //   }
    // );


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

	  $scope.viewMode = viewMode.COMPACT;
		$scope.showFilter = true;
	  $scope.switchMode = function(event){

			switch($scope.viewMode){
				case viewMode.COMPACT:
					$scope.viewMode = viewMode.CRON;
					$scope.showFilter = false;
				break;
				case viewMode.CRON:
					$scope.viewMode = viewMode.COMPACT;
					$scope.showFilter = true;
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
			if( $scope.viewMode === viewMode.CRON ){

				if( $scope.interestMids.length < 1 || $scope.interestMids.indexOf(packet.messageId) > -1 )
					$scope.midBuffer.unshift({mid: packet.messageId, packet: packet});

				// Check max length
				if( $scope.midBuffer.length > maxMessages )
					$scope.midBuffer = $scope.midBuffer.slice(0, maxMessages);

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
