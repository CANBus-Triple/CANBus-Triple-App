'use strict';

angular.module('cbt')
	.factory('BluetoothService', function($rootScope, $timeout) {
		
		/*
		*		TODO: Clean this mess up boy.
		*/
		
		// Fake bt lib for local testing
		if(typeof bluetoothle == "undefined")
			var bluetoothle = {
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
		
		
		
		var deviceInfo = {
			name: 'CANBus Triple',
			serviceUUID: '7a1fb359-735c-4983-8082-bdd7674c74d2',
			characteristicUUID: 'b0d6c9fe-e38a-4d31-9272-b8b3e93d8657'
		}
		
		var connected = false,
				initialized = false,
				device = {},
				discovered = {};
		
		
		
		
		function init(){
			bluetoothle.initialize(function initializeSuccessCallback(status){
				initalized = true;
			}, function initializeErrorCallback(status){
				console.log("initializeErrorCallback");
			});
		}
		
		function scan(){
			
			bluetoothle.startScan(function startScanSuccessCallback(status){
				console.log("startScanSuccessCallback", status );
				console.log(JSON.stringify(status));
				// console.log( bluetoothle.getBytes( status.advertisement ) );
				
				// Add to discovered array
				if( status.status = 'scanResult' && status.address ){
					discovered[status.address] = status;
					}
				
				
			}, function startScanErrorCallback(v){
				console.log("startScanErrorCallback", status );
			}, {});
			
			$timeout(function(){
				bluetoothle.stopScan(function stopScanSuccessCallback(){}, function stopScanErrorCallback(){});
			}, 200);
			
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
		
		
		
		
		
		
		init();
		
	  return {
	    scan: scan,
	    connect: connect,
	    disconnect: disconnect,
	    setDevice: function(i){ device = discovered[i] },
	    
	    discovered: discovered
	    
	  }
	  
	});
	
	
