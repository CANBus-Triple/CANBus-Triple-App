'use strict';

angular.module('cbt')
	.factory('BluetoothService', function($rootScope, $timeout, $q, UtilsService) {
		
		/*
		*		TODO: Clean this mess up boy. Use promises, 
		*/
		
		
		
				
		var deviceInfo = {
			name: 'CANBus Triple',
			serviceUUID: '7a1fb359-735c-4983-8082-bdd7674c74d2',
			characteristicUUID: 'b0d6c9fe-e38a-4d31-9272-b8b3e93d8657'
		}
		
		var scanSeconds = 10,
				connected = false,
				connectedOnce = false,
				initialized = false,
				reconnectAttempts = 0,
				device = {},
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
		function connect(device){
			
			console.log("Connecting to device via BT:", device);
			
			reconnectAttempts = 0;
			
			scan(false);
			/*

			if(connectedOnce){
				reconnect(device);
				return;
				}
*/
			
			bluetoothle.connect(
				connectSuccessCallback,
				connectErrorCallback, 
				{ 'address': device.address });
			
			
		}
		
		/*
		*	Reconnect to BT
		*	@param {Object} device
		*/
		function reconnect(device){
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
				$rootScope.$broadcast('BluetoothService.CONNECT_ERROR');
				return;
			}
			
			// Try reconnect method
			$rootScope.$broadcast('BluetoothService.RECONNECTING');
			
			console.log( "Reconnect attempt ", reconnectAttempts );
			
			if(reconnectAttempts > 1)
				reconnect( device );
			else
				disconnect().finally(function(){reconnect( device );});
				
			reconnectAttempts++;
			
		}
		
		function connectSuccessCallback( status ){
			
			switch(status.status){
				case 'connected':
					$rootScope.$broadcast('BluetoothService.CONNECTED');
					connected = true;
					connectedOnce = true;
				break;
				case 'disconnected':
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
		
		
		/* !!!!!!! FIX
		*
		*/
		function read(){
			
			bluetoothle.read(function readSuccessCallback(result){
				console.log( "readSuccessCallback", result );
				subscribe();
			}, function readErrorCallback(result){
				console.log( "readErrorCallback", result );
			},
			{
				'serviceAssignedNumber':'7a00',
				'characteristicAssignedNumber':'7a01'
			});
			
		}
		
		
		/*
		*		iOS Service Discovery
		*/
		function services(){
			
			bluetoothle.services(function servicesSuccessCallback(result){
				console.log( "servicesSuccessCallback", result );
				console.log( JSON.stringify(result) );
			}, function servicesErrorCallback(result){
				console.log( "servicesErrorCallback", result );
			},
			{});
			
		}
		
		
		
		/*
		*		Android Service Discovery
		*/
		function discover(){
			console.log("Discovering");
			bluetoothle.discover(function discoverSuccessCallback(result){
				console.log( "discoverSuccessCallback", result );
				subscribe();
			}, function discoverErrorCallback(result){
				console.log( "discoverErrorCallback", result );
			});
			
		}
		
		
		/*
		*
		*/
		function subscribe(){
			
			bluetoothle.subscribe(function subscribeSuccessCallback(result){
				console.log( "subscribeSuccessCallback", result );
				
				switch(result.status){
					case 'subscribedResult':
						console.log( atob( result.value ) );
						$rootScope.$broadcast('didGetSerialData', atob( result.value ));
					break;
				}
				
			}, function subscribeErrorCallback(result){
				console.log( "subscribeErrorCallback", result );
			},
			{
				"serviceAssignedNumber": deviceInfo.serviceUUID,
				"characteristicAssignedNumber": deviceInfo.characteristicUUID,
				"isNotification":false
			});
			
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
	    connect: function(device){
		    if(!initialized)
		    	init().then(function(){connect(device)});
		    	else
		    	connect(device);
	    },
	    disconnect: disconnect,
	    setDevice: function(i){ device = discovered[i] },
	    
	    discovered: discovered
	    
	  }
	  
	});
	
	
