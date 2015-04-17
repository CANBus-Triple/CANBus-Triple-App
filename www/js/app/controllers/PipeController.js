'use strict';


angular.module('cbt')
	.controller('PipeController', function ($scope, PipeService) {

		$scope.navTitle = "Packet Pipe"

		$scope.pipeName = 'no pipe yet';
		$scope.running = false;

		$scope.$watch(function(){
			return PipeService.running();
		}, function(newVal, oldVal){
			$scope.running = newVal;
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
		}

		$scope.$on('$destroy', function(){
			PipeService.stop();
		});


	});
