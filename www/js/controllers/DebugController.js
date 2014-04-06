'use strict';  


angular.module('cbt')
	.controller('DebugController', function ($scope, BluetoothService, SerialService) {
	
	  $scope.navTitle = "Debug";
	  
	  $scope.serial = "";
	  $scope.$on('didGetSerialData', function(event, data){
		  $scope.serial += data;
		  $scope.$apply();
		  console.log("Data:", data);
	  });
	  
	  $scope.discovered = BluetoothService.discovered;
	  /*
	  // Use binding
	  $scope.$on('didFindNewBluetoothDevice', function(event, data){
	  	console.log(BluetoothService.discovered);
		  $scope.discovered = BluetoothService.discovered;
	  });
		*/
	  
	
	  $scope.leftButtons = [{
	    type: 'button-icon icon ion-navicon',
	    tap: function(e) {
	        $scope.sideMenuController.toggleLeft();
			}
		}];
	
		$scope.rightButtons = [];
		
		
		$scope.btScan = function(){
			BluetoothService.scan();
		}
		
		$scope.btConnect = function(address){
			BluetoothService.setDevice(address);
			BluetoothService.connect();
		}
		
		$scope.btDisconnect = function(){
			BluetoothService.disconnect();
		}
		
		
		// SerialService.open();
		
		$scope.serialTest = function(){
			
			SerialService.test();
			
		}
		
		$scope.derp = [{},{},{}];
		$scope.showCard = true;
		$scope.showToggle = function(){
			$scope.showCard = $scope.showCard === true ? false : true;
			// $scope.derp.push({card:1});
		}
		
		
		
	});
