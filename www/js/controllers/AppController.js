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
		
		
				
				
				
		/* 
		*	Private Methods
		*/
		
		
		
		/*
		*		Event Listeners
		*
		*/
		$rootScope.$on('HardwareService.CONNECTED', statusHandler);
		$rootScope.$on('HardwareService.CONNECTING', statusHandler);
		$rootScope.$on('HardwareService.RECONNECTING', statusHandler);
		$rootScope.$on('HardwareService.DISCONNECTING', statusHandler);
		$rootScope.$on('HardwareService.DISCONNECTED', statusHandler);
		
		
		
		/*
		*		Private Methods
		*
		*/
		
		function statusHandler(event){
			
			switch(event.name){
				case 'HardwareService.CONNECTED':
					$scope.rightButtons = [{
					  type: 'button-icon icon ion-ios7-circle-filled',
				    tap: function(e) {
				      	HardwareService.disconnect();
							}
					}];
				break;
				case 'HardwareService.CONNECTING':
				case 'HardwareService.RECONNECTING':
					$scope.rightButtons = [{
					  type: 'button-icon icon ion-ios7-circle-filled disabled',
				    tap: function(e) {}
					}];
				break;
				case 'HardwareService.DISCONNECTING':
					$scope.rightButtons = [{
					  type: 'button-icon icon ion-ios7-circle-outline disabled',
				    tap: function(e) {}
					}];
				break;
				case 'HardwareService.DISCONNECTED':
					$scope.rightButtons = [{
					  type: 'button-icon icon ion-ios7-circle-outline',
				    tap: function(e) {
				      	HardwareService.connect();
							}
					}];
				break;
				default:
					$scope.rightButtons = [];
				break;
			}
			
		};
		

				
		
	});