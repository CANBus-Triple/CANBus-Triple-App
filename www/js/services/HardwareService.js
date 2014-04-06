'use strict';

/*
*		Derek K etx313@gmail.com
*		HardwareService manages Bluetooth LE and Serial Connections
*	
*/

angular.module('cbt')
	.factory('HardwareService', function( $rootScope, $q, SerialService, BluetoothService ) {
		
		var ConnectionMode = {
			USB:'usb',
			BT:'bt'
		}
		
		
		var connected = false,
				connectionMode = ConnectionMode.USB;
	
	
		/*
		*		CANBus Triple API Commands
		*/
		var commands = {
			info: String.fromCharCode(0x01, 0x01),
			
		}
		
		/*
		*	Enable/Disable hardware search
		*	@param {Boolean} b
		*/
		function searchForDevices(b){
			
			if(b){
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
			console.log( localStorageService.get('device') );
			
			HardwareService.connect();
			
			
		}
		
		
		
		
		
	  return {
	    /* Interface Properties */
	    connected: connected,
	    ConnectionMode: ConnectionMode,
	    connect: connect,
	    
	    /* Interface Methods */
	    search: searchForDevices,
	    
	  }
	});