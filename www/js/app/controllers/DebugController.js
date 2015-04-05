'use strict';


angular.module('cbt')
	.controller('DebugController', function ($scope, $timeout, FirmwareService, HardwareService, UtilsService) {

	  $scope.navTitle = "Debug";

		$scope.showCmdBtn();

	  $scope.sendTest = function(){

		  HardwareService.command( 'info' );

	  };

	  $scope.autobaud = function(){

			HardwareService.command( 'autobaud', [1] );

	  }

	  $scope.sendReset = function(){

		  HardwareService.reset();

	  }


	  $scope.debugString = '';

	  $scope.readHandler = function(data){
			$timeout( function(){ $scope.debugString += UtilsService.ab2str(data)+"\n"; }, 10);
		}

		$scope.$on('hardwareEvent', function(event, data){
			$timeout( function(){
				$scope.debugString += JSON.stringify(data)+"\n";
			});
		});


		HardwareService.registerReadHandler($scope.readHandler);

		$scope.$on("$destroy", function() {
    	HardwareService.deregisterReadHandler($scope.readHandler);
    });



});
