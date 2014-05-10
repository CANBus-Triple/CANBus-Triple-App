'use strict';

angular.module('cbt')
	.factory('SerialService', function( $q, $rootScope, $interval, $timeout, UtilsService ) {

		

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
			
			if( searching ) search( false );
			
			function doOpen(){
				serial.open({
					baudRate: baudRate,
					dtr: true
					},
					function success(){
						serialOpened = true;
						$rootScope.$broadcast('SerialService.OPEN');
						$timeout(function(){deferred.resolve();}, 100);
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
					function error(error){
						usbSerialPermissionGranted = false;
						$rootScope.$broadcast('SerialService.PERMISSION_DENIED', error);
						deferred.reject(new Error(error));
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
					$timeout(function(){deferred.resolve();}, 100);
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
			
			
			if( data instanceof Uint8Array )
				data = UtilsService.ab2str( data.buffer );
				
			if( data instanceof ArrayBuffer )
				data = UtilsService.ab2str( data );
			
			if( !( typeof data == 'string' ) ){
				console.log('SerialService write: Data must be string or Uint8Array', typeof data );
				return;
			}
			
			console.log("SerialService Sending:", UtilsService.string2hexString(data) );
			
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
		function registerReadCallback(callback){
			
			serial.registerReadCallback(callback,
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
			readHandler(data);
			
		}
		
		/**
		 * Handle read data if in search mode
		 * @return null
		 */	
		function handleSearchResponse(data){
			
			var view = new Uint8Array(data);
			readBuffer += UtilsService.byteArrayToString(view);
			
			console.log(view);
			
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
			/*

			if(b){
			
				if( !serialOpened )
					open().then(function(){ registerReadCallback() }, function(e){ console.log(e); return; });
			
				// Clear discovered
				readBuffer = "";
				for(var k in discovered)
					delete discovered[k];
			
				// Search for 30 seconds
				searching = $interval( function(){
					if(serialOpened == false) return;
					write( String.fromCharCode(0x01, 0x01) );
					}, 1000, 30 );
					
				}
			else{
				$interval.cancel(searching);
				searching = null;
				}
*/
			if( !usbSerialPermissionGranted ){
			
				// Clear discovered 
				for(var k in discovered)
							delete discovered[k];
				
				serial.requestPermission(
					function success(){
						usbSerialPermissionGranted = true;
						$rootScope.$broadcast('SerialService.PERMISSION_GRANTED');
						
						$rootScope.$apply(function(){
							discovered['serial'] = {name:'CANBus Triple USB Serial'};
						});
						
					},
					function error(error){
						usbSerialPermissionGranted = false;
						$rootScope.$broadcast('SerialService.PERMISSION_DENIED', error);
					}
				);
				
			}
			
			
		}
		
		
		
		
		/**
		 * Reset the CBT by connecting at 1200 baud
		 * @return null
		 */	
		function reset(){
			
			var oldBaudRate = baudRate;
			baudRate = 1200;
			
			close()
				.then(open)
				.then(close)
				.then(function(){
					baudRate = oldBaudRate;
					open();
					$timeout(function(){
						$rootScope.$broadcast('SerialService.RESET' );
					}, 500);
					
			});
			
		}
		
		
		
		

		/*
		*	Return Interface
		*/
	  return {
	    open: function openConnection(callback){
		    open().then(function(){ registerReadCallback(callback) });
	    },
	    close: close,
	    read: read,
	    write: write,
	    discovered: discovered,
	    search: search,
	    reset: reset
	  }
	  
	});
	
	
	
	
	
	