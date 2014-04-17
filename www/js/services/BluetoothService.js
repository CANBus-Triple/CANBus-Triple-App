'use strict';

angular.module('cbt')
	.factory('BluetoothService', function($rootScope, $timeout, $q, UtilsService) {
		
		/*
		*		TODO: Clean this mess up boy. Use promises, 
		*/
		
		
		
				
		var deviceInfo = {
			name: 'CANBus Triple',
			serial: {
				serviceUUID: '7a1fb359-735c-4983-8082-bdd7674c74d2',
				characteristicUUID: 'b0d6c9fe-e38a-4d31-9272-b8b3e93d8657'	
			}
		}
		
		var scanSeconds = 10,
				connected = false,
				connectedOnce = false,
				initialized = false,
				reconnectAttempts = 0,
				discovered = {};
		
		
		
		/*
		*
		*/
		function init(){
		
			var deferred = $q.defer();
		
			bluetoothle.initialize(function initializeSuccessCallback(status){
				$rootScope.$broadcast('BluetoothService.INIT');
				initialized = true;
				// disconnect();
				deferred.resolve();
			}, function initializeErrorCallback(error){
				$rootScope.$broadcast('BluetoothService.INIT_ERROR');
				initialized = false;
				deferred.reject(new Error("Failed to init bluetooth"));
			});
			
			return deferred.promise;
		}
		
		
		/*
		*
		*/
		function scan(sw){
			
			if(!sw){
				bluetoothle.stopScan(function stopScanSuccessCallback(){
					$rootScope.$broadcast('BluetoothService.SCAN_COMPLETE');
				}, function stopScanErrorCallback(error){});
				return;
			}
			
			clearDiscovered();
			
			$rootScope.$broadcast('BluetoothService.SCAN_START');
			
			bluetoothle.startScan(function startScanSuccessCallback(status){
				
				// Add to discovered array
				if( status.status = 'scanResult' && status.address ){
					if(!$rootScope.$$phase)
						$rootScope.$apply(function(){
							discovered[status.address] = status;
						});
				}
				
				
			}, function startScanErrorCallback(status){
				console.log("startScanErrorCallback", status );
				$rootScope.$broadcast('BluetoothService.SCAN_ERROR');
			}, {});
			
			$timeout(function(){
				bluetoothle.stopScan(function stopScanSuccessCallback(){
					$rootScope.$broadcast('BluetoothService.SCAN_COMPLETE');
				}, function stopScanErrorCallback(error){
					
				});
			}, scanSeconds*1000);
			
		}
	
		
		
		/*
		*
		*/
		var connectDeferred;
		function connect(device){
			
			reconnectAttempts = 0;
			
			scan(false);
			
			connectDeferred = $q.defer();
			
			if(connectedOnce){
				reconnect(device);
				return connectDeferred.promise;
				}
			
			$rootScope.$broadcast('BluetoothService.CONNECTING');
			
			bluetoothle.connect(
				connectSuccessCallback,
				connectErrorCallback, 
				{ 'address': device.address });
			
			return connectDeferred.promise;
			
		}
		
		/*
		*	Reconnect to BT
		*	@param {Object} device
		*/
		function reconnect(device){
			
			$rootScope.$broadcast('BluetoothService.RECONNECTING');
			bluetoothle.reconnect(
				connectSuccessCallback,
				connectErrorCallback
			);
			
		}
		
		
		/*
		*	Callbacks used by connect and reconnect plugin methods
		*/
		function connectErrorCallback(error){
			
			if( reconnectAttempts > 3 ){
				connectDeferred.reject();
				$rootScope.$broadcast('BluetoothService.CONNECT_ERROR');
				return;
			}
			
			// Try reconnect method
			
			console.log( "Reconnect attempt ", reconnectAttempts );
			
			if(reconnectAttempts == 1)
				reconnect( device );
			else
				disconnect().finally(function(){reconnect( device );});
				
			reconnectAttempts++;
			
		}
		
		function connectSuccessCallback( status ){
			
			switch(status.status){
				case 'connected':
					connectDeferred.resolve();
					$rootScope.$broadcast('BluetoothService.CONNECTED');
					connected = true;
					connectedOnce = true;
				break;
				case 'disconnected':
					connectDeferred.resolve();
					connected = false;
					$rootScope.$broadcast('BluetoothService.DISCONNECTED');
				break;
		
				}
		}
		
		
		
		
		
		
		
		/*
		*
		*/
		function disconnect(){
			
			var deferred = $q.defer();
			
			bluetoothle.disconnect(function disconnectSuccess(status){
				
				switch(status.status){
					case 'disconnecting':
						$rootScope.$broadcast('BluetoothService.DISCONNECTING');
					break;
					case 'disconnected':
						connected = false;
						deferred.resolve();
						$rootScope.$broadcast('BluetoothService.DISCONNECTED');
					break;
				}
				
			}, function disconnectError(){
				deferred.reject(new Error("Failed to init bluetooth"));
			});
			
			return deferred.promise;
			
		};
		
		
		
		/*
		*		iOS Characteristics Discovery
		*/
		function characteristics(){
			
			console.log( "iOS characteristics()" );
			
			var deferred = $q.defer();
			
			bluetoothle.characteristics(function characteristicsSuccessCallback(result){
				console.log( "characteristicsSuccessCallback", result );
				console.log( JSON.stringify(result) );
				deferred.resolve(result);
			}, function characteristicsErrorCallback(result){
				console.log( "characteristicsErrorCallback", result );
				deferred.reject();
			},
			{
				"serviceUuid":deviceInfo.serial.serviceUUID,
				"characteristicUuids":deviceInfo.serial.characteristicUUID
			});
			
			return deferred.promise;
			
		}

		
		/*
		*		Android Service Discovery
		*/
		function discover(){
			
			var deferred = $q.defer();
			
			if( device.platform == "Android" )
				bluetoothle.discover(function discoverSuccessCallback(result){
					deferred.resolve(result);
				}, function discoverErrorCallback(result){
					deferred.reject();
				});
				
			if( device.platform == "iOS" )
				bluetoothle.services(function servicesSuccessCallback(result){
					console.log( "servicesSuccessCallback", result );
					console.log( JSON.stringify(result) );
					deferred.resolve(result);
				}, function servicesErrorCallback(result){
					console.log( "servicesErrorCallback", result );
					deferred.reject();
				},
				{});
			
			return deferred.promise;
			
		}
		
		
		/*
		*	Subscribe to charateristic
		*/
		function subscribeToSerial(callback){
			
			var deferred = $q.defer();
			
			bluetoothle.subscribe(function subscribeSuccessCallback(result){
				
				console.log("subscribeSuccessCallback", JSON.stringify(result));
				
				switch(result.status){
					case 'subscribedResult':
						if(callback instanceof Function)
							callback(result.value);
						deferred.resolve(result);
					break;
					default:
						$rootScope.$broadcast('BluetoothService.SUBSCRIBE', result.status );
					break;
				}
				
			}, function subscribeErrorCallback(result){
				console.log("subscribeErrorCallback", JSON.stringify(result));
				$rootScope.$broadcast('BluetoothService.SUBSCRIBE_ERROR', result.status );
				deferred.reject();
			},
			{
				"serviceUuid": deviceInfo.serial.serviceUUID,
				"characteristicUuid": deviceInfo.serial.characteristicUUID,
				"isNotification": false
			});
			
			return deferred.promise;
			
		}

		function unsubscribeFromSerial(){
			
			var deferred = $q.defer();
			
			bluetoothle.unsubscribe(function unsubscribeSuccessCallback(result){
				switch(result.status){
					case 'unsubscribed':
						$rootScope.$broadcast('BluetoothService.UNSUBSCRIBE' );
						deferred.resolve(result);
					break;
				}
			}, function unsubscribeErrorCallback(result){
				deferred.reject();
			},
			{
				"serviceUuid": deviceInfo.serial.serviceUUID,
				"characteristicUuid": deviceInfo.serial.characteristicUUID
			});
			
			return deferred.promise;
			
		}
		
		
		
		/* 
		*	Manual Read 
		*/
		function read(){
		
			var deferred = $q.defer();
			
			bluetoothle.read(function readSuccessCallback(result){
				deferred.resolve(result.data);
			}, function readErrorCallback(result){
				deferred.reject();
			},
			{
				'serviceUuid': deviceInfo.serial.serviceUUID,
				'characteristicUuid': deviceInfo.serial.serviceUUID
			});
			
			return deferred.promise;
			
		}
		
		/*
		*	Write to serial service
		*/
		function write(data){
			
			var deferred = $q.defer();
			
			if(typeof data == 'string')
				data = btoa(data);
				
			if(data instanceof Uint8Array)
				data = bluetoothle.bytesToEncodedString(data);
			
			
			bluetoothle.write(function writeSuccessCallback(result){
				console.log("writeSuccessCallback",result, atob(result.value));
				deferred.resolve(result);
			}, function writeErrorCallback(result){
				console.log("writeErrorCallback", JSON.stringify(result) );
				deferred.reject(result);
			},
			{
				"value": data,
				"serviceUuid": deviceInfo.serial.serviceUUID,
				"characteristicUuid": deviceInfo.serial.characteristicUUID
			});
			
			return deferred.promise;
		}
		
		
		
		
		
		
		/*
		*	Clears discovered object without destroying ng bindings
		*/
		function clearDiscovered(){
			for(var k in discovered){
				console.log(discovered[k]);
				delete discovered[k];
			}
		}
		
		
		
		
		
		/*
		*	External Interface
		*/
	  return {
	    scan: function(sw){
		    if(!initialized)
		    	init().then(function(){scan(sw);});
		    	else
		    	scan(sw);
	    },
	    connect: function(device, readHandler){
	    	
		    if(!initialized)
		    	init().then(function(){connect(device)});
		    	else
		    		connect(device).then(discover).then(function(){ 
		    			if(device.platform == "Android")
		    				subscribeToSerial(readHandler);
		    				else
		    					characteristics().then( function(){ subscribeToSerial(readHandler) });
									
		    			});
		    	
	    },
	    disconnect: function(){
		    unsubscribeFromSerial().then(disconnect);
	    },
	    setDevice: function(i){ device = discovered[i] },
	    
	    discovered: discovered,
	    write: function(data){
				write(data);
	    },
	    
	  }
	  
	});
	
	
