angular.module('cbt')
	.controller('AppController', function ($scope, $rootScope, HardwareService) {
		
		$scope.navTitle = "AppController";
		$scope.title = "AppController title";
		
		$scope.leftButtons = [{
		  type: 'button-icon icon ion-navicon',
	    tap: function(e) {
	      $scope.sideMenuController.toggleLeft();
	    }
		}];
		
		$scope.rightButtons = [];
		
		
		
		var connectedIconButton = {
				  type: 'button-icon icon ion-ios7-circle-filled',
			    tap: function(e) {
			      HardwareService.disconnect();
			    }
				},
				disconnectedIconButton = {
				  type: 'button-icon icon ion-ios7-circle-outline',
			    tap: function(e) {
			      HardwareService.connect();
			    }
				};
		
		
		
		/*
		*		Event Listeners
		*
		*/
		$rootScope.$on('HardwareService.CONNECTED', statusHandler);
		$rootScope.$on('HardwareService.DISCONNECTED', statusHandler);
		
		
		
		/*
		*		Private Methods
		*
		*/
		
		function statusHandler(event){
			
			switch(event.name){
				case 'HardwareService.CONNECTED':
					$scope.$apply(function(){$scope.rightButtons = [connectedIconButton];});
				break;
				case 'HardwareService.DISCONNECTED':
					$scope.$apply(function(){$scope.rightButtons = [disconnectedIconButton];});
				break;
				default:
					$scope.$apply(function(){$scope.rightButtons = [];});
				break;
			}
			
		};
		
				
		
	});