
angular.module('cbt')
	.controller('AppController', function ($scope, $rootScope, $timeout, $ionicModal, HardwareService, UtilsService) {

		$scope.navTitle = "AppController";
		$scope.title = "AppController title";


		$scope.leftButtons = [{
		  type: 'button-clear',
			content: '<i class="icon ion-navicon"></i>',
	    tap: function(e) {
	      $scope.cbtSideMenu.toggle();
	    }
		},
		];

		$scope.rightButtons = [];

		$scope.navShowing = false;

		$scope.connectIcon = false;
		$scope.connectIconDisable = false;

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


		$scope.toggleMenu = function(){
			$scope.cbtSideMenu.toggle();
		}




		/*
		*		Send Command Modal 
		*/

		$scope.recentCommands = [
			'01 01',
			'03 01 01 0000 0000',
			'03 02 01 0000 0000',
			'03 03 01 0000 0000',
		];
		
		
		$scope.sendCommand = function(command){
		
			$scope.commandInput = command;

			if( typeof command != 'string' ) return;
			
			command = command.replace(/\s/g,'');
			
			if( command.length < 1 ) return;
			
			if( $scope.recentCommands.indexOf(command) == -1 )
				$scope.recentCommands.unshift(command);
			
			HardwareService.send( UtilsService.hexToUint8Array( command ) );
			
		}
		
		$scope.showSendCommandModal = function(){
			
			$ionicModal.fromTemplateUrl('templates/sendCommandModal.html', {
		    scope: $scope,
		    animation: 'slide-in-up'
		  }).then(function(modal) {
		    $scope.modal = modal;
		    $scope.modal.show();
		  });
		  $scope.closeModal = function() {
		    $scope.modal.hide();
		  };
		  //Cleanup the modal when we're done with it!
		  $scope.$on('$destroy', function() {
		    $scope.modal.remove();
		  });
		  // Execute action on hide modal
		  $scope.$on('modal.hidden', function() {
		    // Execute action
		  });
		  // Execute action on remove modal
		  $scope.$on('modal.removed', function() {
		    // Execute action
		  });
			
		}
		
		
		
		
		
		
		
		/*
		*	Watch HardwareService connection status
		*/
		$scope.hardwareConnected = HardwareService.connectionMode();
	  $scope.$watch(
      function(){ return HardwareService.connectionMode() },
      function(newVal) {
        $scope.hardwareConnected = newVal;
      }
    )
    
    
    
		


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

			$timeout(function(){
				switch(event.name){
					case 'HardwareService.CONNECTED':
						$scope.rightButtons = [{
						  type: 'button-icon icon ion-ios7-circle-filled',
					    tap: function(e) {
					      	HardwareService.disconnect();
								}
						}];
						$scope.connectIcon = true;
						$scope.connectIconDisable = true;
						$scope.connectTap = function(){ HardwareService.disconnect(); }
					break;
					case 'HardwareService.CONNECTING':
					case 'HardwareService.RECONNECTING':
						$scope.rightButtons = [{
						  type: 'button-icon icon ion-ios7-circle-filled disabled',
					    tap: function(e) {}
						}];
						$scope.connectIcon = true;
						$scope.connectIconDisable = false;
						$scope.connectTap = function(){}
					break;
					case 'HardwareService.DISCONNECTING':
						$scope.rightButtons = [{
						  type: 'button-icon icon ion-ios7-circle-outline disabled',
					    tap: function(e) {}
						}];
						$scope.connectIcon = false;
						$scope.connectIconDisable = false;
						$scope.connectTap = function(){}
					break;
					case 'HardwareService.DISCONNECTED':
						$scope.rightButtons = [{
						  type: 'button-icon icon ion-ios7-circle-outline',
					    tap: function(e) {
					      	HardwareService.connect();
								}
						}];
						$scope.connectIcon = false;
						$scope.connectIconDisable = true;
						$scope.connectTap = function(){ HardwareService.connect(); }
					break;
					default:
						$scope.rightButtons = [];
						$scope.connectIcon = false;
						$scope.connectIconDisable = true;
						$scope.connectTap = function(){}
					break;
				}
			});

		};




	});
