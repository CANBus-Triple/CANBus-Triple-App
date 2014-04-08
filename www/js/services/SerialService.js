'use strict';

angular.module('cbt')
	.factory('SerialService', function( $q, $rootScope, $interval, UtilsService ) {

		

		var serialOpened = false,
				baudRate = 115200,
				searching = null,
				usbSerialPermissionGranted = false,
				readBuffer = "",
				discovered = {};
				
		
		

		/**
		 * Open serial port
		 */	
		function open(){
			
			var deferred = $q.defer();
			
			function doOpen(){
				serial.open({
					baudRate: baudRate,
					dtr: true
					},
					function success(){
						serialOpened = true;
						$rootScope.$broadcast('SerialService.OPEN');
						deferred.resolve();
					},
					function error(){
						serialOpened = false;
						$rootScope.$broadcast('SerialService.OPEN_ERROR');
						deferred.reject(new Error("Failed to open Serial port"));
					}
				);
			}
			
			
			if( !usbSerialPermissionGranted ){
				
				serial.requestPermission(
					function success(){
						usbSerialPermissionGranted = true;
						$rootScope.$broadcast('SerialService.PERMISSION_GRANTED');
						doOpen();
					},
					function error(){
						usbSerialPermissionGranted = false;
						$rootScope.$broadcast('SerialService.PERMISSION_DENIED');
						deferred.reject(new Error("Permission Denied by OS/User"));
					}
				);
				
			}
			else
				doOpen();
			
			
			return deferred.promise;
			
		}


		/**
		 * Close the serial port
		 */	
		function close(){
			var deferred = $q.defer();
			
			serial.close(
				function success(){
					serialOpened = false;
					$rootScope.$broadcast('SerialService.CLOSE');
					deferred.resolve();
				},
				function error(){
					deferred.reject(new Error("Failed to close Serial port"));
				});
			
			return deferred.promise;
		}




		/**
		 * Write data to serial port 
		 * @param {String} string data to write
		 */	
		function write( data ){
			
			var deferred = $q.defer();
			serial.write(
				data,
				function success(){
					deferred.resolve();
				},
				function error(){
					deferred.reject(new Error());
				}
			);
			
			return deferred.promise;
			
		}
		
		
		/**
		 * Manually read from serial port
		 */	
		function read(){
			
			var deferred = $q.defer();
			serial.read(
				function success(data){
					var byteArray = new Uint8Array(data);
					deferred.resolve( UtilsService.byteArrayToString(byteArray) );
				},
				function error(){
					deferred.reject(new Error());
				}
			);
			
			return deferred.promise;
			
		}
		
		
		/**
		 * Register a callback function that is called when the plugin reads data
		 * @return null
		 */	
		function registerReadCallback(){
			
			serial.registerReadCallback(handleData,
				function error(){
					new Error("Failed to register read callback");
				});
			
		}
		
		
		/**
		 * Handles incoming data from the Serial plugin
		 * @param {ArrayBuffer} data 
		 * @return null
		 */		
		function handleData(data){
			
			if(searching != null){
				handleSearchResponse(data);
				return;
			}
			
			$rootScope.$broadcast('SerialService.READ_DATA', data);
			
		}
		
		/**
		 * Handle read data if in search mode
		 * @return null
		 */	
		function handleSearchResponse(data){
			
			var view = new Uint8Array(data);
			readBuffer += UtilsService.byteArrayToString(view);
			
			var line = readBuffer.split("\r\n", 1);
			
			try{
				var message = JSON.parse(line);
				
				if(line.length > 0){
					readBuffer = readBuffer.slice(line[0].length);
					search( false );
					close();
					}
				
				if(!$rootScope.$$phase)
						$rootScope.$apply(function(){
							discovered['serial'] = message;
						});
				
			}catch(error){}
			
			
		}
		
		
		
		
		/**
		 * Start pinging the serial port looking for CBT hardware
		 * @param {boolean} b 
		 * @return null
		 */	
		function search( b ){
			
			if(b){
			
				if( !serialOpened )
					open().then(registerReadCallback);
			
				// Clear discovered
				readBuffer = "";
				for(var k in discovered)
					delete discovered[k];
			
				searching = $interval( function(){
					write( String.fromCharCode(0x01, 0x01) );
					}, 1000, 120 );
				}
			else{
				$interval.cancel(searching);
				searching = null;
				}
			
		}
		
		
		
		
		
		

		/*
		*	Return Interface
		*/
	  return {
	    open: function openConnection(){
		    open().then(registerReadCallback);
	    },
	    close: close,
	    read: read,
	    write: write,
	    discovered: discovered,
	    search: search
	  }
	  
	});
	
	
	
	
	
	