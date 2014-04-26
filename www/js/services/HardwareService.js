'use strict';

/*
*		Derek K etx313@gmail.com
*		HardwareService manages Bluetooth LE and Serial Connections into a common API
*	
*/

angular.module('cbt')
	.factory('HardwareService', function( $rootScope, $q, $timeout, SettingsService, SerialService, BluetoothService, UtilsService ) {
		
		var connectionMode = null,
				readHandlers = [],
				ConnectionMode = {
					USB:'usb',
					BT:'bt'
				};
		
		var debugString = {data:'Derp'};
		
		
		/*
		*		CANBus Triple API Commands
		*/
		var commands = {
			info: String.fromCharCode(0x01, 0x01), // Get Device Info
			
		}
		
		
		
		/*
		*	Enable/Disable hardware search
		*	@param {Boolean} b
		*/
		function searchForDevices(b){
			
			if(b){
			
				// Disconnect if connected
				/*
				if(connectionMode)
					disconnect();
					*/
			
				BluetoothService.scan(true);
				if(window.device && window.device.platform == 'Android')
					SerialService.search(true);
			}else{
				BluetoothService.scan(false);
				if(window.device && window.device.platform == 'Android')
					SerialService.search(false);
			}
			
		}
		
		
		/*
		*	Connect to a device
		*	@param {?} ?
		*/
		function connect(){
			/*
			*		Get selected device from Local storage and connect
			*/
			var device = SettingsService.getDevice();
			
			if(device.address == 'serial')
				SerialService.open(readHandler);
			else
				BluetoothService.connect(device, readHandler);
			
		}
		
		/*
		*	Disconnect from a device
		*/
		function disconnect(){
			
			switch(connectionMode){
				case ConnectionMode.BT:
					BluetoothService.disconnect();
				break;
				case ConnectionMode.USB:
					SerialService.close();
				break;
			}				
			
		}


		/*
		*	Write to connected service
		*/
		function write(data){
			
			switch(connectionMode){
				case null:
					console.log("HardwareService cannot write, not connected");
					return;
				case ConnectionMode.BT:
					BluetoothService.write(data);
				break;
				case ConnectionMode.USB:
					SerialService.write(data);
				break;
			}
			
			
		}
		
		
		/*
		*	Register a callback to be called when we recieve data
		*/
		function registerReadHandler( callback ){
			if( !(callback instanceof Function) ) return;
				
			console.log("registerReadHandler", readHandlers.indexOf(callback));
			// NEEDS TESTINGs
			
			if( readHandlers.indexOf(callback) < 1 )
				readHandlers.push(callback);
		}
		
		function deregisterReadHandler( callback ){
			//// TODO TEST
			readHandlers.splice(readHandlers.indexOf(callback), 1);
		}
		
		
		/*
		*	Read Handler
		*	Call all read callbacks
		*/
		function readHandler(data){
			
			$timeout(function(){
				debugString.data += UtilsService.ab2str(data);
			});
			
			console.log("readHandler", UtilsService.ab2str(data) );
			
			for(var f in readHandlers)
				readHandlers[f](data);
			
			}
		
		
		
		
		/*
		*	Store and broadcast connected event
		*/
		function serviceStatusHandler( event ){
		
			$timeout(function(){
				switch(event.name){
					case "BluetoothService.CONNECTED":
						connectionMode = ConnectionMode.BT;
						$rootScope.$broadcast( 'HardwareService.CONNECTED' );
					break;
					case "SerialService.OPEN":
						connectionMode = ConnectionMode.USB;
						$rootScope.$broadcast( 'HardwareService.CONNECTED' );
					break;
					case "BluetoothService.CONNECTING":
						$rootScope.$broadcast( 'HardwareService.CONNECTING' );
					break;
					case "BluetoothService.RECONNECTING":
						$rootScope.$broadcast( 'HardwareService.RECONNECTING' );
					break;
					case "BluetoothService.DISCONNECTING":
						$rootScope.$broadcast( 'HardwareService.DISCONNECTING' );
					break;
					case "BluetoothService.DISCONNECTED":
					case "SerialService.CLOSE":
						connectionMode = null;
						$rootScope.$broadcast( 'HardwareService.DISCONNECTED' );
					break;
					case "BluetoothService.RESET":
					case "SerialService.RESET":
						$rootScope.$broadcast( 'HardwareService.RESET' );
					break;	
				}
				
			});
			
		}
		
		
		/*
		*	Reset Connected CBT Hardware
		*/
		// TODO: Finish
		function resetHardware(){
			
			switch( connectionMode ){
				case ConnectionMode.BT:
					BluetoothService.reset();
				break;
				case ConnectionMode.USB:
					SerialService.reset();
				break;
				default:
					$rootScope.$broadcast( 'HardwareService.RESET_FAIL', 'Not Connected' );
				break;
			}
			
		}
		

		
		/*
		*	Connect to last device
		*/
		$timeout(function(){
			if( SettingsService.getAutoconnect() == "true" && SettingsService.getDevice())
				connect();
		}, 1500);


		
		
		
		/*
		*	Event Listeners
		*/
		$rootScope.$on('BluetoothService.CONNECTED', serviceStatusHandler);
		$rootScope.$on('BluetoothService.DISCONNECTED', serviceStatusHandler);
		$rootScope.$on('BluetoothService.CONNECTING', serviceStatusHandler);
		$rootScope.$on('BluetoothService.DISCONNECTING', serviceStatusHandler);
		$rootScope.$on('SerialService.OPEN', serviceStatusHandler);
		$rootScope.$on('SerialService.CLOSE', serviceStatusHandler);
		$rootScope.$on('BluetoothService.RESET', serviceStatusHandler);
		$rootScope.$on('SerialService.RESET', serviceStatusHandler);

		
		
		
		
	  return {
	    /* Interface Properties */
	    connectionMode: function(){ return connectionMode; },
	    debugString: debugString,
	    
	    /* Interface Methods */
	    search: searchForDevices,
	    connect: connect,
	    disconnect: disconnect,
	    send: function(s){
		    write(s);
		    },
		  reset: function(){ resetHardware(); },
		  registerReadHandler: registerReadHandler,
		  deregisterReadHandler: deregisterReadHandler
		  
	    }
	   
	});
	
	
	
	
	
	
	
	
	