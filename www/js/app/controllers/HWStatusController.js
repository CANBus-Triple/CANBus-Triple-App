'use strict';


angular.module('cbt')
	.controller('HWStatusController', function ($rootScope, $scope, $state, $http, $interval, $timeout, $ionicModal, HardwareService) {

    $scope.navTitle = "Hardware";
		$scope.title = "Connect";

		var updateIndex = 0,
				updateFrequency = 400,
				commandMap = ['info', 'bus1status', 'bus2status', 'bus3status'],
				autobaud = 'Auto Detect',
				speeds = [10,20,50,83,100,125,250,500,800,1000,autobaud];


		if( !$scope.hardwareConnected ) $state.go('connect');

		$scope.speeds = speeds;

		$scope.$watch(function(){
			if( $scope.hwState['bitrate-bus1'] )
				return $scope.hwState['bitrate-bus1'].rate;
		},function(newVal, oldVal){
			$scope.bus1speed = speeds.indexOf(newVal);
		});

		$scope.$watch(function(){
			if( $scope.hwState['bitrate-bus2'] )
				return $scope.hwState['bitrate-bus2'].rate;
		},function(newVal, oldVal){
			$scope.bus2speed = speeds.indexOf(newVal);
		});

		$scope.$watch(function(){
			if( $scope.hwState['bitrate-bus3'] )
				return $scope.hwState['bitrate-bus3'].rate;
		},function(newVal, oldVal){
			$scope.bus3speed = speeds.indexOf(newVal);
		});


		$scope.setRate = function( bus, speed ){

			console.log('setRate', arguments);



			var sp = speeds[speed];

			if( sp == autobaud )
				$scope.autoBaud(bus);
			else{
				cleanup();
				HardwareService.command('bitrate', [ bus, sp >> 8, sp & 0xff ]);
				$timeout(start, 1000);
			}



		}



		$scope.autoBaud = function(bus){

			cleanup();

			$scope.autobaudBus = bus;
			$scope.autobaudFound = null;
			$scope.autobaudComplete = false;

			$ionicModal.fromTemplateUrl('templates/modals/autobaud.html', {
			    scope: $scope,
			    animation: 'slide-in-up',
					backdropClickToClose: false,
					hardwareBackButtonClose: false
			  }).then(function(modal) {
			    $scope.modal = modal;
			    $scope.modal.show();
			  });
			  $scope.closeModal = function() {
					start();
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

				HardwareService.command('autobaud', [parseInt(bus)]);

		}

		$scope.updateStatus = function(){
			if(!$scope.hardwareConnected || $scope.comLock) return;

			HardwareService.command( commandMap[updateIndex++] );
			updateIndex = updateIndex <= 3 ? updateIndex : 0;
		}

		function start(){
			HardwareService.command('bitrate', [0x01]);
			window.hwIntPromise = $interval($scope.updateStatus, updateFrequency);
		}

		function cleanup(){
			if(window.hwIntPromise){
				$interval.cancel(window.hwIntPromise);
				window.hwIntPromise == null;
			}
		}
		$scope.cleanup = cleanup;


		$scope.$on('hardwareEvent', function(event, object){

			switch( object.event ){
				case 'autobaudComplete':
					$scope.autobaudComplete = true;
					$scope.autobaudFound = object.rate;
					$timeout(function(){ HardwareService.command('bitrate', [0x01]) }, 2000);
					break;
				case 'bitrate-bus1':
					HardwareService.command('bitrate', [0x02])
					break;
				case 'bitrate-bus2':
					HardwareService.command('bitrate', [0x03])
					break;
				case 'bitrate-bus3':

					break;
			}

		});

		$scope.$on('$ionicView.enter', start);

		$scope.$on('$ionicView.leave', function(){
			cleanup();
		});



	});
