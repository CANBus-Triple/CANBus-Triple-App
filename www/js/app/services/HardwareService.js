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
				rawHandlers = [],
				packetHandlers = [],
				ConnectionMode = {
					USB:'usb',
					BT:'bt'
				},
				hardwareInfo = {version:'0.4.0'};


		var debugString = {data:''};

		var commands = {
			'info':[0x01, 0x01],
			'bootloader':[0x01, 0x16],
			'getEeprom':[0x01, 0x02],
			'setEeprom':[0x01, 0x03],
			'restoreEeprom':[0x01, 0x04],
			'bus1status':[0x01, 0x10, 0x01],
			'bus2status':[0x01, 0x10, 0x02],
			'bus3status':[0x01, 0x10, 0x03],
			'bus1logOn': [0x03, 0x01, 0x01],
			'bus2logOn': [0x03, 0x02, 0x01],
			'bus3logOn': [0x03, 0x03, 0x01],
			'bus1logOff': [0x03, 0x01, 0x00],
			'bus2logOff': [0x03, 0x02, 0x00],
			'bus3logOff': [0x03, 0x03, 0x00],
			'autobaud': [0x01, 0x08],
			'bitrate': [0x01, 0x09],
		};





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

				if(typeof process == 'undefined')
					BluetoothService.scan(true);

				if(window.device && window.device.platform == 'Android' || typeof process != 'undefined' )
					SerialService.search(true);

			}else{

				if(typeof process == 'undefined')
					BluetoothService.scan(false);

				if(window.device && window.device.platform == 'Android' || typeof process != 'undefined' )
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
				SerialService.open(device, readHandler, rawHandler).then(function(){
					$timeout(function(){ command( 'info' ); }, 200);
					$timeout(function(){ command( 'info' ); }, 500);
					$timeout(function(){ command( 'info' ); }, 700);
				});
			else
				BluetoothService.connect(device, readHandler, rawHandler);

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
					return BluetoothService.write(data);
				break;
				case ConnectionMode.USB:
					return SerialService.write(data);
				break;
			}


		}


		/*
		*	Send a CBT command with additional data
		*/
		function command(name, props){

			if( commands[name] )
				return write( props ? commands[name].concat(props) : commands[name]  );
			else
				throw new Error( 'HardwareService Command not found ' + name );
		}


		/*
		*	Register a callback to be called when we recieve read line data
		*/
		function registerReadHandler( callback ){
			if( !(callback instanceof Function) ) return;

			if( readHandlers.indexOf(callback) < 1 )
				readHandlers.push(callback);
		}

		function deregisterReadHandler( callback ){
			readHandlers.splice(readHandlers.indexOf(callback), 1);
		}



		/*
		*	Register a callback to be called when we recieve raw data
		*/
		function registerRawHandler( callback ){
			if( !(callback instanceof Function) ) return;

			if( readHandlers.indexOf(callback) < 1 )
				rawHandlers.push(callback);
		}

		function deregisterRawHandler( callback ){
			rawHandlers.splice(rawHandlers.indexOf(callback), 1);
		}



		/*
		*	Register a callback to be called when we recieve 0x03 (CAN Packet)
		*/
		function registerPacketHandler( callback ){
			if( !(typeof callback == "function") ) return;
			if( packetHandlers.indexOf(callback) < 1 )
				packetHandlers.push(callback);
		}

		function deregisterPacketHandler( callback ){
			packetHandlers.splice(packetHandlers.indexOf(callback), 1);
		}


		/*
		*	Read Line Handler
		*	Call all read callbacks
		*/
		function readHandler(dataBuffer){

			// console.log('serial data', new Uint8Array(dataBuffer));

			var data = new Uint8Array(dataBuffer);

			// Check packet for 0x03 prefix, which is a CAN Packet
			if( data[0] === 0x03 ){
				// console.log('packet', data);
				var packet = new CANPacket( data[1], data[2], data[3], data[4], data[5], data[6], data[7], data[8], data[9], data[10], data[11], data[12], data[13] );
				for(var p in packetHandlers)
					packetHandlers[p](packet);

			}else if( data[0] === 123 || data[1] === 123 ){

				// Dispatch an event with the JSON object
				var eventObject,
						string = UtilsService.ab2str( data );

				try{
					eventObject = JSON.parse( string );
				}catch(e){
					console.error(e, UtilsService.ab2str( data ));
				}

				if( eventObject ){
					if( eventObject.version ) setHardwareInfo( eventObject );
					$rootScope.$broadcast('hardwareEvent', eventObject);
				}

				// console.log("JSON Event Recieved ", eventObject );

			}else{
				// console.log('raw data', data);
				// Otherwise dispatch raw packet
				for(var f in readHandlers)
					readHandlers[f](dataBuffer);

			}

		}



		/*
		*	Raw Data Handler
		*	Call all read callbacks
		*/
		function rawHandler(dataBuffer){
			for(var f in rawHandlers)
				rawHandlers[f](dataBuffer);
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
		function resetHardware(){

			// CBT API Reset Hardware command
			write( String.fromCharCode(0x01, 0x16) );
			//disconnect();

			$timeout(function(){
				SerialService.reconnect();
				// SerialService.open();
				// connect();
			}, 100);

		}



		/*
		*	Connect to last device
		*/
		$timeout(function(){
			if( SettingsService.getAutoconnect() == "true" && SettingsService.getDevice())
				connect();
		}, 1500);


		function setHardwareInfo(obj){
			hardwareInfo = obj;
		}



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
			commands: commands,
			getHardwareInfo: function(){ return hardwareInfo },

			/* Interface Methods */
			search: searchForDevices,
			connect: connect,
			disconnect: disconnect,
			send: function(s){
				return write(s);
				},
			command: command,
			reset: function(){ resetHardware(); },
			registerReadHandler: registerReadHandler,
			deregisterReadHandler: deregisterReadHandler,
			registerPacketHandler: registerPacketHandler,
			deregisterPacketHandler: deregisterPacketHandler,
			registerRawHandler: registerRawHandler,
			deregisterRawHandler: deregisterRawHandler
	    }

	});
