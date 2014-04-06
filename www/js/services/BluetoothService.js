'use strict';

angular.module('cbt')
	.factory('BluetoothService', function($rootScope, $timeout) {
		
		/*
		*		TODO: Clean this mess up boy. Use promises, 
		*/
		
		// Fake bt lib for local testing
		if(!('bluetoothle' in window)){
			console.log('making fake btle');
			window.bluetoothle = {
				initialize: function(){},
				startScan: function(){},
				stopScan: function(){},
				connect: function(){},
				read: function(){},
				write: function(){},
				discover: function(){},
				subscribe: function(){},
				services: function(){}
			}
		}
		
		
		var deviceInfo = {
			name: 'CANBus Triple',
			serviceUUID: '7a1fb359-735c-4983-8082-bdd7674c74d2',
			characteristicUUID: 'b0d6c9fe-e38a-4d31-9272-b8b3e93d8657'
		}
		
		var scanSeconds = 10,
				connected = false,
				initialized = false,
				device = {},
				discovered = {};
		
		
		
		
		function init(){
			bluetoothle.initialize(function initializeSuccessCallback(status){
				console.log("initializeSuccessCallback", status);
				initialized = true;
			}, function initializeErrorCallback(status){
				console.log("initializeErrorCallback", status);
			});
		}
		
		function scan(sw){
		
			clearDiscovered();
		
			if(!sw){
				bluetoothle.stopScan(function stopScanSuccessCallback(){}, function stopScanErrorCallback(error){ console.log(error) });
				console.log("Bluetooth scan stopped");
				return;
			}
			
			console.log("Bluetooth scan");
			
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
			}, {});
			
			$timeout(function(){
				bluetoothle.stopScan(function stopScanSuccessCallback(){}, function stopScanErrorCallback(error){ console.log(error) });
			}, scanSeconds*1000);
			
		}
	
	
		function connect(){
			
			bluetoothle.connect(function connectSuccessCallback( status ){
				console.log("connectSuccessCallback", status);
				
				switch(status.status){
					case 'connected':
						$rootScope.$broadcast('bluetoothDidConnect');
						
						console.log("Platform ", window.device.platform, window.device.platform == 'Android');
						if(window.device.platform == 'Android') discover();
						else if(window.device.platform == 'iOS')  services();
						
						
					break;
					case 'disconnected':
						$rootScope.$broadcast('bluetoothDidDisconnect');
					break;
				}
				
			}, function connectErrorCallback(){
				console.log("connectErrorCallback");
			}, { 'address':device.address });
			
			
		}
		
		
		
		function disconnect(){
			
			bluetoothle.disconnect();
			
		};
		
		
		
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
		
		
		function clearDiscovered(){
			for(var k in discovered){
				console.log(discovered[k]);
				delete discovered[k];
			}
		}
		
		
		
		
		/* Hax for testing, this is bad */
		$timeout(init, 300);
		
		
	  return {
	    scan: scan,
	    connect: connect,
	    disconnect: disconnect,
	    setDevice: function(i){ device = discovered[i] },
	    
	    discovered: discovered
	    
	  }
	  
	});
	
	
