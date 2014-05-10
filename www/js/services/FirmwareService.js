'use strict';

/*
*		A FSM for uploading firmware to the CBT via the HardwareService 
*/

angular.module('cbt')
	.factory('FirmwareService', function($rootScope, $q, $http, $timeout, HardwareService, UtilsService){
		
		var pageSize = 128,
				sendMaxBytes = 128,
				intelHexEnd = ':00000001FF',
				okCommand = 0x0D,
				errorCommand = 0x3F,
				hexHashMap = {},
				hexSendIndex = 0,
				lastState = '',
				state = '',
				errorCount = 0,
				opTimeoutTime = 3000,
				opTimeout;
		
		
			
		/*
		*	State Machine States
		* Not the greatest implementation, TODO make mo betta.
		*/
		var states = {
			
			reset:{ enter: function(){
								
								hexSendIndex = 0;
								errorCount = 0;
								
								var oneShot;
								oneShot = $rootScope.$on('HardwareService.RESET', function(){ oneShot(); gotoState('getDevice'); });
								
								resetTimeout();
								HardwareService.reset();
								
							},
							update: function(data){
							}
			},
			getDevice:{ 	enter: function(data){
											resetTimeout();
											HardwareService.send( 'S' );
										},
										update: function(data){
											if( data && data.buffer && UtilsService.ab2str(data.buffer) == "CANBusT" ){
												gotoState('setPmode');
											}else if( data[0] == errorCommand ){
												$timeout(function(){
													HardwareService.send( 'S' );
												}, 500);
											}
											
										}
			},
			setPmode:{		enter: function(){
											resetTimeout();
											HardwareService.send( 'P' );
										},
										 update:function(data){
										 		
											 if(data[0] == okCommand) gotoState('setAddress');
											 	else if(data[0] == errorCommand)
											 		$rootScope.$broadcast('FirmwareService.FLASH_ERROR', 'Set program mode failed');
											 	
										 }
										},
			setAddress:{		enter: function(){
												resetTimeout();
												// Set start address
												var startAddress = Object.keys(hexHashMap)[hexSendIndex];
												HardwareService.send( String.fromCharCode( 0x41, (startAddress >> 8), (startAddress & 0xFF) ) );
										 },
										 update:function(data){
											 if(data[0] == okCommand){
												 gotoState('sendFlash');	 
											 } else if(data[0] == errorCommand)
											 		$rootScope.$broadcast('FirmwareService.FLASH_ERROR', 'Set addressfailed');
										 }
										},										
			sendFlash:{ 	enter: function(){
											resetTimeout();
											sendNextFlashPage();
										 },
										 update:function(data){
										 
										 	if(data[0] == okCommand && hexHashMap[Object.keys(hexHashMap)[hexSendIndex+1]] != undefined ){
											 	
											 	$rootScope.$broadcast('FirmwareService.FLASH_PROGRESS', hexSendIndex/Object.keys(hexHashMap).length );
											 	
											 	resetTimeout();
											 	
										 		$timeout(function(){
										 			sendNextFlashPage();
										 			}, 30 );
										 		
											 	} else if(data[0] == errorCommand){
											 		
											 		errorCount++;
											 		if( errorCount >= 3 )
											 			$rootScope.$broadcast('FirmwareService.FLASH_ERROR', 'Send flash page failed');
											 		else
												 		$timeout(function(){ sendNextFlashPage(); }, 1000);	
												 	
												 	resetTimeout();
											 			
											 	} else if(data[0] == okCommand)
											 		gotoState('finish');
											 	else
											 		$rootScope.$broadcast('FirmwareService.FLASH_ERROR', 'Unknown Error');
											 		
										 }
										},
			verify:{			enter: function(){
											 
										 },
										 update:function(data){
											 
										 }
										},
			finish:{      enter: function(){
											// SEND L then send E to finish up
											HardwareService.send( 'L' );
									  },
									  update:function(data){
									  	resetTimeout(true);
									  	HardwareService.send( 'E' );
										  HardwareService.deregisterReadHandler( readHandler );
										  $rootScope.$broadcast('FirmwareService.FLASH_SUCCESS');
									  }
									 },
			wait:{			enter: function(){
											 
										 },
										 update:function(data){
											 
										 }
										}
		};
		
		
		
		/*
		*	Reset timeout after a successful call to hardware.
		*	@param {Boolean} off Switch to cancel the timeout timer, true to disable
		*/
		function resetTimeout(off){
			
			if( opTimeout != null ) $timeout.cancel(opTimeout);
			
			if( off != true )
				opTimeout = $timeout(function(){
					$rootScope.$broadcast('FirmwareService.FLASH_TIMEOUT');
					gotoState('wait');
				}, opTimeoutTime );
			
		}
		
		
		
		
		/*
		*	Send 128 bit data page to the hardware
		*/
		function sendNextFlashPage(){
			
			var i = 0,
					lines = 0,
					linesSent = 0,
					setAddressAfterPage = false,
					pageLength = 0;
			
			console.log("sendNextFlashPage", hexSendIndex, Object.keys(hexHashMap).length);
			
			// Calculate length of the page we're about to send
			for(lines=0; lines<pageSize/hexHashMap[Object.keys(hexHashMap)[0]].length && hexHashMap[Object.keys(hexHashMap)[hexSendIndex+lines]] != undefined; lines++){
				
				pageLength += hexHashMap[Object.keys(hexHashMap)[hexSendIndex+lines]].length;
				
				linesSent++;
				
				// If we have less bytes here than the first line of the hex break, so the next set of the machine can set a new address.
				if( parseInt(Object.keys(hexHashMap)[hexSendIndex+lines])
						+ hexHashMap[Object.keys(hexHashMap)[hexSendIndex+lines]].length
						!= parseInt(Object.keys(hexHashMap)[hexSendIndex+lines+1]) ){
					setAddressAfterPage = true;
					break;
					}
				
			}
			 
			
			// B (Write Command), 16 bit length, F (for flash E for eeprom) then Data
			var pageArray = new Uint8Array(4);
			pageArray[0] = 0x42; // B
			pageArray[1] = pageLength >> 8;
			pageArray[2] = pageLength & 0xFF;
			pageArray[3] = 0x46; // F
			
			HardwareService.send( pageArray );
			
			
			
			var page, bytesSent = 0;
			
			for( i=0; bytesSent < pageLength; i++){
				
				page = hexHashMap[Object.keys(hexHashMap)[hexSendIndex+i]];
				
				console.log(Object.keys(hexHashMap).length, hexSendIndex+i, page, bytesSent, pageLength);
				
				if( sendMaxBytes >= page.length ){
					// Send all bytes at once
					HardwareService.send( page );
				}else{
					// Send bytes in smaller chunks
					for(var ii=0; ii*sendMaxBytes < page.length; ii++){
						var sub = page.buffer.slice(ii*sendMaxBytes, (ii*sendMaxBytes)+sendMaxBytes );
						HardwareService.send( sub );
					}
				}
				
				bytesSent += page.length;
				
			}
			
			
			hexSendIndex += linesSent;
			
			if(setAddressAfterPage && hexSendIndex < Object.keys(hexHashMap).length )
				gotoState('setAddress');
			
		}
		
		
		
		
		/*
		*	Send State Machine to specified state
		*	@param {String} s
		*/
		function gotoState(s){
			state = s;
			machineRun();
		}
		
		function startMachine(){
			lastState = '';
			state = 'reset';
			machineRun();
		}
		
		
		
		
		/*
		*	State Machine run tick with optional data object (Usually data returned from the hardware device)
		*	@param {Object} data
		*/
		function machineRun(data){
		
			var statePhase;
			if( state == lastState )
				statePhase = 'update';
			else {
				statePhase = 'enter';
				lastState = state;
			}
				
			// console.log('Machine running state', state, statePhase, data);
			states[state][statePhase](data);
		}
		
		
		
		
		/*
		*	Load Hex file for parsing into ArrayBuffer
		*/
		function fetchFirmware(){
			
			var deferred = $q.defer();
			
			$http({method: 'GET', url: '/firmware/blink.hex'}).
		    success(function(data, status, headers, config) {
					deferred.resolve(data);
		    }).
		    error(function(data, status, headers, config) {
		      deferred.reject(status);
		    });
			
			return deferred.promise;
		}
		
		
		
		
		/*
		*	Parse loaded Hex into ArrayBuffer
		*	@param {String} hex
		*/
		function parseHex(hex){
			
			var deferred = $q.defer(),
					checksumError = -1;
			
					hexHashMap = {};
			
			// Fix any line ending weirdness
			hex = hex.replace(/\r?\n/g, "\r\n");
			
			angular.forEach(hex.split('\r\n'), function(value, key){
      	
      	if( value.slice(0,11) == intelHexEnd || value[0] != ':' || value.length < 1 )
	      	return;
      	
      	
      	var size = parseInt( value.slice(1,3), 16 );
      	var address = parseInt( value.slice(3,7), 16 );
				var buffer = new ArrayBuffer(size);
				var view = new Uint8Array(buffer);
				
				for(var i=0; i<size; i++)
					view[i] = parseInt(value.slice(9+(i*2), 11+(i*2)), 16);
				
				checksumError = !checksum(value) ? address : checksumError;
				
				hexHashMap[ address ] = view;
				
				
			}, this);
			
			// Checksum error?
			if(checksumError > 0){
				console.log('checksumError', checksumError);
				$rootScope.$broadcast('FirmwareService.INTEL_HEX_INVALID', 'invalid checksum ' );
				deferred.reject();
			}
			
			console.log(hexHashMap);
			deferred.resolve();
			
			return deferred.promise;	
		}
		
		
		
		
		
		/*
		*	Verify checksum of a line from Intel Hex format.
		*	Checksum is verified by adding all hex values, excluding the checksum byte. 
		*	Then calculating the 2's complement and checking against the last byte of the value string
		*	@param {String} value
		* @return {Boolean} success / fail
		*/
		function checksum(value){
			var sum = 0;
			
			var check = parseInt(value.slice(-2), 16);
			value = value.slice(1, value.length-2)
			
			for(var i=0; i<value.length; i+=2){
				sum += parseInt(value.slice(i, i+2), 16);
				}
			
			if( parseInt((~sum + 1 >>> 0).toString(16).slice(-2), 16) == check ){
				return true
			}else{
				console.log('invalid checksum:', value, check, parseInt((~sum + 1 >>> 0).toString(16).slice(-2), 16));
				return false;
				}
			
		}
		
		
		
		
		
		/*
		*	Callback registered with HardwareService to handle responses from the hardware device
		*	@param {String} data
		*/
		function readHandler(data){
			machineRun(new Uint8Array(data));
		}
		
		
		
		
		
		
		/*
		*	Send firmware to Hardware. 
		* Registers a read callback with the HwardwareService, Resets hardware to Bootloader, then parses hex and sends it.
		*/
		function send(){
			
			HardwareService.registerReadHandler( readHandler );
			
			fetchFirmware()
				.then( function(d){
								parseHex(d).then(function(){
									startMachine();
									});
								});
			
		}
		
		
		
		
		
		return {
			send: function(n){ send(n) },
		};
		
	});





