'use strict';

angular.module('cbt')
	.factory('BluetoothService', function($rootScope, $timeout, $q, UtilsService) {
		
		
				
		var deviceInfo = {
			name: 'CANBus Triple',
			services: {
				serial: {
					serviceHandle: 0,
					characteristicHandle: 0,
					clientConfigHandle: 0,
					serviceUUID: '7a1fb359-735c-4983-8082-bdd7674c74d2',
					// characteristicUUID: 'b0d6c9fe-e38a-4d31-9272-b8b3e93d8658' // Notifcation Charateristic
					characteristicUUID: 'b0d6c9fe-e38a-4d31-9272-b8b3e93d8657' // Indication Charateristic
				},
				wakeup: {
					serviceHandle: 0,
					characteristicHandle: 0,
					serviceUUID: '35e71686-b1c3-45e7-9da6-1ca2393a41f3',
					characteristicUUID: '5fcd52b7-4cfb-4095-aeb2-5c5511646bbe'
				}
			}
		}
		
		var specUUIDs = {
			clientConfiguration: "00002902-0000-1000-8000-00805f9b34fb"
		};
		
		var scanSeconds = 10,
				connected = 0,		// Holds BLE Device handle
				discovered = {};
		
		var recieveBuffer,
				recieveBufferIndex = 0;
				
		var rawCallback;
		

		
		/*
		*
		*/
		function scan(sw){
			
			if(!sw){
				evothings.ble.stopScan();
				$rootScope.$broadcast('BluetoothService.SCAN_COMPLETE');
				return;
			}
			
			clearDiscovered();
			
			$rootScope.$broadcast('BluetoothService.SCAN_START');
			
			evothings.ble.startScan(
				function(device)
				{
					$timeout(function(){
						discovered[device.address] = device;
					});
				},
				function(errorCode)
				{
					$rootScope.$broadcast('BluetoothService.SCAN_ERROR');
				}
			);

			// Set timeout timer to cancel the scanning
			$timeout( scan, scanSeconds*1000);
			
			
			
		}
	
		
		
		/*
		*
		*/
		var connectDeferred;
		function connect(device){
			
			scan(false);
			
			connectDeferred = $q.defer();
			
			$rootScope.$broadcast('BluetoothService.CONNECTING');
			evothings.ble.connect(
				device.address,
				connectSuccessCallback,
				connectErrorCallback );

			return connectDeferred.promise;
			
		}
		
		
				
		
		
		
		/*
		*	Callbacks used by connect
		*/
		function connectErrorCallback(errorCode){
			$rootScope.$broadcast('BluetoothService.CONNECT_ERROR');
			connectDeferred.reject(errorCode);
		}
		
		function connectSuccessCallback( info ){
			
			console.log('BLE connect status for device: '
			+ info.deviceHandle
			+ ' state: '
			+ info.state, evothings.ble.connectionState[info.state] );
			
			
			switch(evothings.ble.connectionState[info.state]){
				case 'STATE_CONNECTED':
					connectDeferred.resolve();
					$rootScope.$broadcast('BluetoothService.CONNECTED');
					connected = info.deviceHandle;
				break;
				case 'STATE_DISCONNECTED':
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
			
			$timeout(function(){
				deferred.resolve();
			}, 5);
			
			console.log("disconnect ", connected);
			evothings.ble.close(connected);
			$rootScope.$broadcast('BluetoothService.DISCONNECTED');
			
			return deferred.promise;
			
		};
		
		
		
		/*
		*		Characteristics Discovery
		*/
		function characteristics(){
			
			var deferred = $q.defer();
			var last = false;
			var keys = 0;
			
			var process = function(characteristics)
				{
					for(var i = 0; i < characteristics.length; i++)
						for( var srv in deviceInfo.services )
							if( characteristics[i].uuid == deviceInfo.services[srv].characteristicUUID )
								deviceInfo.services[srv].characteristicHandle = characteristics[i].handle;
						
					if(last) deferred.resolve(characteristics);
					
				}
			
			for( var service in deviceInfo.services ){
				
				keys++;
				
				if( Object.keys(deviceInfo.services).length == keys ) last = true;
				
				evothings.ble.characteristics(
					connected,
					deviceInfo.services[service].serviceHandle,
					process,
					function(errorCode)
					{
						$rootScope.$broadcast('BluetoothService.CHARATERISTICS_DISCOVERY_ERROR', errorCode);
						deferred.reject();
					});
			}
			
			return deferred.promise;
			
		}

		
		/*
		*		Service Discovery
		*/
		function discover(){
			
			var deferred = $q.defer();
			
			evothings.ble.services(
				connected,
				function(services)
				{
					for(var i = 0; i < services.length; i++)
					//if( services[i].uuid == deviceInfo.serial.serviceUUID ) deviceInfo.serial.serviceHandle = services[i].handle;
						for( var srv in deviceInfo.services )
							if( services[i].uuid == deviceInfo.services[srv].serviceUUID )
								deviceInfo.services[srv].serviceHandle = services[i].handle;
					
					deferred.resolve(services);
				},
				function(errorCode)
				{
					$rootScope.$broadcast('BluetoothService.SERVICES_ERROR', errorCode);
					deferred.reject(errorCode);
				}
			);
			
			return deferred.promise;
			
		}
		
		/*
		*		Discover Descriptors
		*/
		function descriptors(){
			
			var deferred = $q.defer();
		
			evothings.ble.descriptors(
				connected,
				deviceInfo.services.serial.characteristicHandle,
				function(descriptors)
				{
					console.log('BLE descriptors: ',descriptors); 
					
					for (var i = 0; i < descriptors.length; i++)
						if( descriptors[i].uuid == specUUIDs.clientConfiguration )
							deviceInfo.services.serial.clientConfigHandle = descriptors[i].handle;
					
					deferred.resolve(descriptors);
				},
				function(errorCode)
				{
					console.log('BLE descriptors error: ' + errorCode);
					deferred.reject(errorCode);
				});
				
				return deferred.promise;
		}
		
		
		/*
		*		Subscribe to charateristic
		*/
		function subscribeToSerial(callback){
			
			var deferred = $q.defer();
			
			$rootScope.$broadcast('BluetoothService.SUBSCRIBE');
			
			recieveBuffer = new Uint8Array(512);
			
			evothings.ble.enableNotification(
				connected,
				deviceInfo.services.serial.characteristicHandle,
				function(dataBuffer)
				{
					
					// Send raw first
					if(typeof rawCallback == "function") rawCallback(dataBuffer);
					
					
					// Read line for \r\n
					
					var dataBufferView = new Uint8Array(dataBuffer);
					
					recieveBuffer.set( dataBufferView, recieveBufferIndex );
					recieveBufferIndex += dataBuffer.byteLength;
					
					
					for( var end=0; end<recieveBufferIndex; end++ ){
						if( recieveBuffer[end] === 0x0D /* && recieveBuffer[end+1] === 0x0A  */) break;
					}
					
					// Dispatch slice before end of line, if end index was less than the incoming data length
					if( end > 0 && end < recieveBufferIndex ){
						
						var data = recieveBuffer.subarray(0, end);
						
						recieveBufferIndex -= end;
						recieveBuffer.set( recieveBuffer.subarray( end, recieveBufferIndex ) );
						
						if(callback instanceof Function)
								callback(data);
						
						deferred.resolve(data);
						
					}else{
						deferred.resolve();
					}
					
					
						
				},
				function(errorCode)
				{
					$rootScope.$broadcast('BluetoothService.SUBSCRIBE_ERROR', errorCode );
					deferred.reject(errorCode);
				}
			);			
			
			return deferred.promise;
			
		}

		function unsubscribeFromSerial(){
			
			var deferred = $q.defer();
			
			evothings.ble.disableNotification(
				connected,
				deviceInfo.services.serial.characteristicHandle,
				function()
				{
					$rootScope.$broadcast('BluetoothService.UNSUBSCRIBE' );
					deferred.resolve();
				},
				function(errorCode)
				{
					$rootScope.$broadcast('BluetoothService.UNSUBSCRIBE_ERROR', errorCode );
					deferred.reject(errorCode);
				});
			
			return deferred.promise;
			
		}
		
		
		
		/* 
		*		Write Descriptor
		*/
		function writeDescriptor(data){
			
			var deferred = $q.defer();
			
			if(typeof data == 'string')
				data = new Uint8View( UtilsService.str2ab( data ) );
			
			/*
			if(data instanceof Uint8Array)
				data = data.buffer;
				*/
			
			console.log(data)
			evothings.ble.writeDescriptor(
				connected,
				deviceInfo.services.serial.clientConfigHandle,
				data,
				function(data)
				{
					console.log( 'BLE Write descriptor: ', arguments );
					deferred.resolve(data);
				},
				function(errorCode)
				{
					console.log('BLE writeDescriptor error: ' + errorCode);
					deferred.reject(errorCode);
				});
			
			return deferred.promise;
			
		}
		
		
		
		
		/* 
		*		Read Descriptor
		*/
		function readDescriptor(){
			
			var deferred = $q.defer();
			
			evothings.ble.readDescriptor(
				deviceHandle,
				deviceInfo.services.serial.descriptorHandle,
				function(data)
				{
					console.log('BLE descriptor data: ' + evothings.ble.fromUtf8(data));
					deferred.resolve(data);
				},
				function(errorCode)
				{
					console.log('BLE readDescriptor error: ' + errorCode);
					deferred.reject(errorCode);
				});
				
			
			return deferred.promise;
			
		}
		
		
		
		
		
		/*
		*		Write indication setting to client configuration descriptor
		*/
		function writeSerialIndicationDescriptor(){
			
			var b = new ArrayBuffer(2);
			var view = new Uint8Array(b);
			view[0] = 0x02;
			view[1] = 0x00;
			
			return writeDescriptor( view );
			
		}
		
		function writeSerialNotificationDescriptor(){
			
			var b = new ArrayBuffer(2);
			var view = new Uint8Array(b);
			view[0] = 0x01;
			view[1] = 0x00;
			
			return writeDescriptor( view );
			
		}
		
		
		
		
		/* 
		*	Manual Read 
		*/
		function read(){
		
			var deferred = $q.defer();
			
			evothings.ble.readCharacteristic(
				connected,
				deviceInfo.services.serial.characteristicHandle,
				function(data)
				{
					// console.log('BLE characteristic data: ' + evothings.ble.fromUtf8(data));
					console.log('BLE characteristic data: ', UtilsService.ab2str(data));
					deferred.resolve(data);
				},
				function(errorCode)
				{
					console.log('BLE readCharacteristic error: ' + errorCode);
					deferred.reject(errorCode);
				});
			
			return deferred.promise;
			
		}
		
		window.read = read;
		
		/*
		*	Write to serial service
		*/
		function write(data){
			
			var deferred = $q.defer();
			
			if(typeof data == 'string')
				data = UtilsService.str2ab( data );
				
			if(data instanceof ArrayBuffer)
				data = new Uint8Array(data);
				
			if( !(data instanceof Uint8Array) ){
				console.log("write requires String, ArrayBuffer, or Uint8Array");
				return;
			}
			
			console.log( "Write: ", data );
			
			evothings.ble.writeCharacteristic(
				connected,
				deviceInfo.services.serial.characteristicHandle,
				data,
				function(data)
				{
					console.log( arguments );
					deferred.resolve(data);
				},
				function(errorCode)
				{
					console.log('BLE writeCharacteristic error: ' + errorCode);
					deferred.reject(errorCode);
				});
			
			return deferred.promise;
			
		}
		
		window.write = write;
		
		

		/*
		*	Write to wakeup service to wakeup the MCU
		*/
		function wakeup(){
			
			var deferred = $q.defer();
			
			
			var resetCommand = new Uint8Array(new ArrayBuffer(1));
			resetCommand[0] = 0x01;
			
			evothings.ble.writeCharacteristic(
				connected,
				deviceInfo.services.wakeup.characteristicHandle,
				resetCommand,
				function()
				{
					$timeout(function(){$rootScope.$broadcast('BluetoothService.RESET');}, 500);
					deferred.resolve();
				},
				function(errorCode)
				{
					deferred.reject(errorCode);
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
		    scan(sw);
	    },
	    connect: function(device, readHandler, rawCb){
	    	
	    	rawCallback = rawCb;
	    	
	  		connect(device)
	  			.then(discover)
	  			.then(characteristics)
	  			.then(descriptors)
	  			// .then(writeSerialNotificationDescriptor)
	  			.then(writeSerialIndicationDescriptor)
	  			.then(function(){
  								subscribeToSerial(readHandler);
  								});
					
	    },
	    disconnect: function(){
	    	disconnect();
		    // unsubscribeFromSerial().then(disconnect);
	    },
	    setDevice: function(i){ device = discovered[i] },
	    
	    discovered: discovered,
	    write: function(data){
				write(data);
	    },
	    read: function(){
		    
	    },
	    wakeup: function(){
		    wakeup();
	    }
	    
	  }
	  
	});
	
	
