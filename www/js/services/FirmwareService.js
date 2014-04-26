'use strict';

/*
*		A FSM for uploading firmware to the CBT via the HardwareService 
*/

angular.module('cbt')
	.factory('FirmwareService', function($rootScope, $q, $http, $timeout, HardwareService, UtilsService){
		
		var pageSize = 16,
				intelHexEnd = ':00000001FF',
				hexHashMap = {},
				lastState = '',
				state = '';
		
		var states = {
			
			reset:{ enter: function(){
								
								var oneShot;
								oneShot = $rootScope.$on('HardwareService.RESET', function(){ oneShot(); machineRun(); });
			
								HardwareService.reset();
							},
							update: function(data){
								console.log(data)
								gotoState('getDevice');
							}
			},
			getDevice:{ enter: function(data){
									HardwareService.send( 'S' );
									},
									update: function(data){
										if( UtilsService.ab2str(data.buffer) == "CANBusT" ){
											console.log('Found CBT Bootloader');
											gotoState('sendAddress');
										}
										
									}
			},
			sendAddress:{ enter: function(){
											 HardwareService.send( 'A' );
										 },
										 update:function(data){
											 console.log( 'sendAddress', data );
										 }
										},
			sendPage: enter: function(){
											 HardwareService.send( 'B' );
										 },
										 update:function(data){
											 
										 }
										},
			verify: enter: function(){
											 
										 },
										 update:function(data){
											 
										 }
										},
			finish:{ enter: function(){
								 HardwareService.deregisterReadHandler( readHandler );
							 },
							 update:function(data){
								 
							 }
							}
			
		};
		
		
		function gotoState(s){
			state = s;
			machineRun();
		}
		
		function startMachine(data){
			lastState = '';
			state = 'reset';
			machineRun();
		}
		
		function machineRun(data){
		
			var statePhase;
			if( state == lastState )
				statePhase = 'update';
			else {
				statePhase = 'enter';
				lastState = state;
			}
				
			console.log('Machine running state', state, statePhase);
			states[state][statePhase](data);
		}
		
		
		function fetchFirmware(){
			
			var deferred = $q.defer();
			
			$http({method: 'GET', url: '/firmware/test.hex'}).
		    success(function(data, status, headers, config) {
					deferred.resolve(data);
		    }).
		    error(function(data, status, headers, config) {
		      deferred.reject(status);
		    });
			
			return deferred.promise;
		}
		
		function parseHex(hex){
			
			var deferred = $q.defer(),
					checksumError = false;
			
			hexHashMap = {};
			
			angular.forEach(hex.split('\n'), function(value, key){
      	
      	if( value == intelHexEnd || value[0] != ':' )
	      	return;
      	
      	
      	var size = parseInt( value.slice(1,3), 16 );
      	var address = parseInt( value.slice(3,7), 16 );
				var buffer = new ArrayBuffer(size);
				var view = new Uint8Array(buffer);
				
				for(var i=0; i<size; i++)
					view[i] = parseInt(value.slice(9+(i*2), 11+(i*2)), 16);
				
				
				checksumError = !checksum(value);
				if(checksumError) return;	
				
				
				hexHashMap[ address ] = view;
				
			}, this);
			
			// Checksum error?
			if(checksumError){
				$rootScope.$broadcast('FirmwareService.INTEL_HEX_INVALID', 'invalid checksum');
				deferred.reject();
			}
			
			// Check length of hashmap to verify data was read
			if(0){
				$rootScope.$broadcast('FirmwareService.INTEL_HEX_INVALID', 'invalid intel hex on line '+key);
				deferred.reject();
			}
			
			console.log(hexHashMap);
			
			
			return deferred.promise;	
		}
		
		
		function checksum(value){
			var sum = 0;
			
			var check = parseInt(value.slice(-3), 16);
			value = value.slice(1, value.length-3)
			
			for(var i=0; i<value.length; i+=2){
				sum += parseInt(value.slice(i, i+2), 16);
				}
			
			if( parseInt((~sum + 1 >>> 0).toString(16).slice(-2), 16) == check )
				return true
			else
				return false;
			
		}
		
		
		function readHandler(data){
			console.log('FirmwareService', data);
			
			machineRun(new Uint8Array(data));
		}
		
		
		
		
		
		
		
		function send(id){
			
			HardwareService.registerReadHandler( readHandler );
			
			fetchFirmware()
				.then( function(d){
								parseHex(d);
								startMachine();
								});
			
		}
		
		
		
		
		
		return {
			send: function(n){ send(n) },
		};
		
	});





