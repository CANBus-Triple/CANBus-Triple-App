'use strict';


angular.module('cbt')
	.controller('BuildsController', function ($scope, $state, $timeout, $ionicModal, BuildsService, FirmwareService, HardwareService){

		$scope.navTitle = "Firmware Update";
		$scope.title = "Firmware Update";

		$scope.message = 'Loading Firmware File...';
		$scope.showProgress = true;
		$scope.startFlashButton = false;


		$scope.builds = BuildsService.getSources();

		$scope.$watch(function(){
			return BuildsService.getSources();
		},
		function(newVal, oldVal){
			$scope.builds = newVal;
		});


		$scope.selectedBuild = '';
		$scope.selectedBuildVersion = '';

		$scope.$watch('selectedBuildVersion', function(newVal, oldVal){
			console.info(arguments);
		});




		$scope.flashProgress = 0;
		$scope.flashComplete = false;

		$scope.showFlashModal = function(){

			$ionicModal.fromTemplateUrl('templates/modals/flash.html', {
		    scope: $scope,
		    animation: 'slide-in-up',
				backdropClickToClose: false,
				hardwareBackButtonClose: false
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

		$scope.flash = function( ){

				console.log( $scope.selectedBuildVersion );

			$scope.cleanup();
			$scope.showFlashModal();

			$timeout(function(){
				FirmwareService.load( BuildsService.rootPath + $scope.selectedBuildVersion );
			}, 1000);
		}

		$scope.startFlash = function(){

			$scope.startFlashButton = false;
			$scope.flashComplete = false;
			$scope.message = 'Flash in progress...';

			$scope.cleanup();
			$timeout(FirmwareService.sendLoaded, 1000);

		}


		$scope.$on('FirmwareService.HEX_LOAD_ERROR', function(event, data){
			$scope.message = 'Error loading the firmware file. Are you connected to the internet?';
			$scope.showProgress = false;
			$scope.flashProgress = 0;
			$scope.flashComplete = true;
		});

		$scope.$on('FirmwareService.HEX_LOAD_START', function(event, data){
			$scope.message = 'Loading Firmware File...';
			$scope.showProgress = true;
			$scope.flashComplete = false;
		});

		$scope.$on('FirmwareService.HEX_LOAD_COMPLETE', function(event, data){
			$scope.message = 'Firmware loaded, ready to flash.\nDo not close the app or disconnect your CANBus Triple until flashing is complete.\nPress the \'Flash Now\' button below to start.';
			$scope.showProgress = false;
			$scope.flashComplete = true;
			$scope.startFlashButton = true;
		});


		$scope.$on('FirmwareService.FLASH_PROGRESS', function(event, data){
			$scope.flashProgress = Math.ceil(data * 100);
		});

		$scope.$on('FirmwareService.FLASH_SUCCESS', function(event, data){
			$scope.message = 'Flash Complete';
			$scope.flashComplete = true;
		});

		$scope.$on('FirmwareService.FLASH_ERROR', function(event, data){
			$scope.message = 'Flash Error - Try flashing from Arduino IDE.';
			$scope.flashComplete = true;
		});




		/*
		*	Event Listeners
		*/

		$scope.$on('$destroy', function(){
    	HardwareService.search(false);
		});



	});
