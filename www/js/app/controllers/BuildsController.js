'use strict';


angular.module('cbt')
	.controller('BuildsController', function ($scope, $state, $timeout, $ionicModal, BuildsService, FirmwareService, HardwareService){

		$scope.navTitle = "Firmware Update";
		$scope.title = "Firmware Update";




		$scope.builds = BuildsService.getSources();

		$scope.$watch(function(){
			return BuildsService.getSources();
		},
		function(newVal, oldVal){
			$scope.builds = newVal;
		});


		$scope.selectedBuild = '';
		$scope.$watch('selectedBuild', function(newVal, oldVal){
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

		$scope.flash = function( file ){
			console.log("FLASH:",BuildsService.rootPath + file);
			$scope.cleanup();
			$scope.showFlashModal();
			$timeout(function(){
				FirmwareService.send( BuildsService.rootPath + file );
			}, 200);
		}

		$scope.$on('FirmwareService.FLASH_PROGRESS', function(event, data){
			$scope.flashProgress = Math.ceil(data * 100);
		});

		$scope.$on('FirmwareService.FLASH_SUCCESS', function(event, data){
			$scope.flashComplete = true;
		});

		$scope.$on('FirmwareService.FLASH_ERROR', function(event, data){
			$scope.flashComplete = true;
		});




		/*
		*	Event Listeners
		*/

		$scope.$on('$destroy', function(){
    	HardwareService.search(false);
		});



	});
