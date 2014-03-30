'use strict';

angular.module('cbt')
	.factory('SerialService', function(BluetoothService) {


		function requestPermission(){
			
			serial.requestPermission(function success(), function error());
			
		}

		function open(){
			
			serial.open(opts, function success(), function error());
			
		}
		
		
		
			  
	  return {
	    
	  }
	  
	});