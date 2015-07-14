'use strict';


angular.module('cbt')
	.controller('PipeController', function ($scope, PipeService) {

		$scope.navTitle = "Packet Pipe"

		$scope.pipeName = false;
		$scope.running = false;
		$scope.startEnable = false;

		$scope.$watch(function(){
			return PipeService.running();
		}, function(newVal, oldVal){
			$scope.running = newVal;
		});

		$scope.$watch('hardwareConnected', function(newVal, oldVal){
			$scope.startEnable = !!newVal;
		});


		$scope.toggle = function(){
			if( $scope.running == false )
				$scope.start();
			else
				$scope.stop();
		}

		$scope.start = function(){
			$scope.pipeName = PipeService.start();
		}

		$scope.stop = function(){
			PipeService.stop();
			$scope.pipeName = false;
		}

		$scope.$on('$destroy', function(){
			$scope.stop();
		});


	});
