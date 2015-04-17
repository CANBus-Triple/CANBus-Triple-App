'use strict';

/*
*		A FSM for uploading firmware to the CBT via the HardwareService
*/

angular.module('cbt')
	.factory('FirmwareService', function($rootScope, $q, $http, $timeout, HardwareService, UtilsService){

		var pageSize = 128,
				sendMaxBytes = 16,
				okCommand = 0x0D,
				errorCommand = 0x3F,
				hexSendIndex = 0,
				lastState = '',
				state = '',
				errorCount = 0,
				opTimeoutTime = 10000,
				opTimeout,
				sendDataDelay = 5,
				hex;



		/*
		*	State Machine States
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
												gotoState('getPageSize');
											}else if( data[0] == errorCommand ){
												$timeout(function(){
													HardwareService.send( 'S' );
												}, 500);
											}

										}
			},
			getPageSize:{	 enter: function(){
											 HardwareService.send( 'b' );
										 },
										 update:function(data){
											 pageSize = (data[1] >> 8)+(data[2] & 0xFF);
											 console.log('pageSize set to', pageSize);
											 gotoState('setPmode');
										 }
										},
			setPmode:{		enter: function(){
											resetTimeout();
											HardwareService.send( 'P' );
										},
										 update:function(data){

											if(data[0] == okCommand)
												gotoState('setAddress');
											else if(data[0] == errorCommand)
												$rootScope.$broadcast('FirmwareService.FLASH_ERROR', 'Set program mode failed');

										 }
										},
			setAddress:{		enter: function(){
												resetTimeout();
												// Set start address
												HardwareService.send( String.fromCharCode( 0x41, (hex.startAddress >> 8), (hex.startAddress & 0xFF) ) );
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

										 	if(data[0] == okCommand && hex.length > hexSendIndex ){

											 	$rootScope.$broadcast('FirmwareService.FLASH_PROGRESS', hexSendIndex/hex.length );

											 	resetTimeout();

										 		$timeout(function(){
										 			sendNextFlashPage();
										 			}, sendDataDelay );

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
										  HardwareService.deregisterRawHandler( readHandler );
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
		*	@param {Boolean} off Switch to cancel the timeout timer, true to clear
		*/
		function resetTimeout(off){

			if( opTimeout != null ) $timeout.cancel(opTimeout);

			if( off != true )
				opTimeout = $timeout(function(){
					$rootScope.$broadcast('FirmwareService.FLASH_TIMEOUT');
					HardwareService.deregisterRawHandler( readHandler );
					gotoState('wait');
				}, opTimeoutTime );

		}




		/*
		*	Send 128 bit data page to the hardware
		*/
		function sendNextFlashPage(){

			var i = 0,
				lines = 0,
				pageLength = 0;

			// console.log("sendNextFlashPage", hexSendIndex, hex.length);

			// Calculate length of the page we're about to send
			pageLength = (hex.length - hexSendIndex) > pageSize ? pageSize : hex.length - hexSendIndex ;


			// B (Write Command), 16 bit length, F (for flash E for eeprom) then Data
			var pageArray = new Uint8Array(4);
			pageArray[0] = 0x42; // B
			pageArray[1] = pageLength >> 8;
			pageArray[2] = pageLength & 0xFF;
			pageArray[3] = 0x46; // F

			HardwareService.send( pageArray ).then(function(){});


			var page, bytesSent = 0;
			for( i=0; bytesSent < pageLength; i++){

				page = new Uint8Array(hex.slice(hexSendIndex, hexSendIndex+pageLength));

				if( page.length < 1 )
					break;

				if( sendMaxBytes >= page.length ){
					// Send all bytes at once
					HardwareService.send( page );
				}else{
					// Send bytes in smaller chunks
					for(var ii=0; ii*sendMaxBytes < page.length; ii++){
						var sub = page.buffer.slice(ii*sendMaxBytes, (ii*sendMaxBytes)+sendMaxBytes );
						$timeout((function(s){return function(){ HardwareService.send(s); }})(sub), sendDataDelay*ii );

					}
				}

				bytesSent += page.length;

			}

			hexSendIndex += pageLength;

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
		function fetchFirmware(s){

			var deferred = $q.defer();

			$rootScope.$broadcast('FirmwareService.HEX_LOAD_START');
			$http({method: 'GET', url: s}).
		    success(function(data, status, headers, config) {
					$rootScope.$broadcast('FirmwareService.HEX_LOAD_COMPLETE');
					deferred.resolve(data);
		    }).
		    error(function(data, status, headers, config) {
					$rootScope.$broadcast('FirmwareService.HEX_LOAD_ERROR', status);
		     	deferred.reject(status);
		    });

			return deferred.promise;
		}









		/*
		*	Callback registered with HardwareService to handle responses from the hardware device
		*	@param {String} data
		*/
		function readHandler(data){
			// console.log('FirmwareService readHandler', new Uint8Array(data));
			console.log('FirmwareService readHandler', UtilsService.byteArrayToString(new Uint8Array(data)));
			machineRun(new Uint8Array(data));
		}






		/*
		*	Send firmware to Hardware.
		* Registers a read callback with the HwardwareService, Resets hardware to Bootloader, then parses hex and sends it.
		*/
		function send(s){

			fetchFirmware(s)
				.then( function(d){
					HardwareService.registerRawHandler( readHandler );
					hex = new IntelHex( d );
					startMachine();
					})
				.catch(function (error){
					$rootScope.$broadcast('FirmwareService.HEX_ERROR', error);
				});

		}





		return {
			send: function(s){ send(s) },
		};

	});
