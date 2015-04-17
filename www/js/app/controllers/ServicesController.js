'use strict';


angular.module('cbt')
	.controller('ServicesController', function ($scope, HardwareService, CBTSettings) {

		$scope.navTitle = "Services Settings";


		if( $scope.hwConnected )
			CBTSettings.load();

		$scope.init = function(){
			CBTSettings.load();
		}

	  $scope.resetStockCmd = function(){
	    HardwareService.command('restoreEeprom');
	  }

	  $scope.dbg = function(){
	    // CBTSettings.debugEeprom();
	    console.log( CBTSettings );
	  }

	  $scope.sendEeprom = function(){
	    CBTSettings.sendEeprom();
	  }

		$scope.resetHardware = function(){
			HardwareService.command('bootloader');
		}


	  $scope.pids = CBTSettings.pids;

	  $scope.$on("hardwareEvent", function(event, data){
	    switch(data.event){
	      case 'eepromSave':
					console.info(data);
	      break;
				case 'eepromReset':
					console.info('eepromReset', data);
	      break;
	    }
	  });


		$scope.$on('HardwareService.CONNECTED', function(){
			CBTSettings.load();
		});





		$scope.$on('$destroy', function(){

		});


	});
