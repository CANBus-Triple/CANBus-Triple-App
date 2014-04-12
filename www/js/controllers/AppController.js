angular.module('cbt')
	.controller('AppController', function ($scope, $rootScope, $timeout, HardwareService) {
		
		$scope.navTitle = "AppController";
		$scope.title = "AppController title";
		
		$scope.leftButtons = [{
		  type: 'button-icon icon ion-navicon',
	    tap: function(e) {
	      $scope.cbtSideMenu.toggle();
	    }
		},
		/*{
		  type: 'button-icon icon cbt-icon',
		}*/
		];
		
		$scope.rightButtons = [];
		
		$scope.navShowing = false;
		$scope.$on('CBTSideMenu.IN', navHandler);
		$scope.$on('CBTSideMenu.OUT', navHandler);
		
		function navHandler(event){
			
			$timeout(function(){
				switch(event.name){
					case 'CBTSideMenu.IN':
						$scope.navShowing = true;
					break;
					case 'CBTSideMenu.OUT':
						$scope.navShowing = false;
					break;
				}
			})
				
		}
				
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