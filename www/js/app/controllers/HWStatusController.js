'use strict';


angular.module('cbt')
	.controller('HWStatusController', function ($rootScope, $scope, $state, $http, $interval, $timeout, HardwareService) {

    $scope.navTitle = "Hardware";
		$scope.title = "Connect";

		var updateIndex = 0,
				updateFrequency = 500,
				commandMap = ['info', 'bus1status', 'bus2status', 'bus3status'],
				speeds = [10,20,50,83,100,125,250,500,800,1000];


		if( !$scope.hardwareConnected ) $state.go('hardware.connect');

		$scope.speeds = speeds;
		$scope.bus1speed = 1;
		$scope.bus2speed = 1;
		$scope.bus3speed = 1;

		$scope.autoBaud = function(bus){
			cleanup();
			HardwareService.command('autobaud', [parseInt(bus)]);
		}

		$scope.updateStatus = function(){

			if(!$scope.hardwareConnected) return;

			HardwareService.command( commandMap[updateIndex++] );
			updateIndex = updateIndex <= 3 ? updateIndex : 0;
		}

		var intPromise = $interval($scope.updateStatus, updateFrequency);
		function cleanup(){
			if(intPromise) $interval.cancel(intPromise);
		}

		$scope.$on('$destroy', function(){
			console.log("DESTROY DESTROY DESTROY DESTROY DESTROY DESTROY DESTROY ");
			cleanup();
		});



	});
