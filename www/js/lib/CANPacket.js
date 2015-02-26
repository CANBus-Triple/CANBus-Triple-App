'use strict';

/*
*		CAN Packet Data Structure and helper methods
*		Derek K
*		etx313@gmail.com
*/


var CANPacket = (function() {

	/*
	*	@constructor
	*/
	function CANPacket( bus, mid0, mid1, byte1, byte2, byte3, byte4, byte5, byte6, byte7, byte8, length, busStatus ){
		
		this.buffer = new ArrayBuffer(10);
		this.payload = new Uint8Array(this.buffer);
		
		this.busId = bus || 0;
		this.length = length || 0;
		this.status = busStatus || 0;
		this.messageId = (mid0 << 8) + mid1;
		
		for(var i=0; i<8; i++)
			this.payload[i] = arguments[i+1] || 0;
		
		
	}
	
	
	
	
	
	
	
	/*
	*	Return a string explination of the packet
	* @return {String} String 
	*/
	CANPacket.prototype.toString = function(){
		return 'Bus '+this.busId+' MessageID '+this.messageId.toString(16).toUpperCase()+' Payload '+this.getPayloadString();
	}
	
	
	/*
	*	Return a string of payload data in hex format
	* @return {String} String of Hex formatted CAN Data
	*/
	CANPacket.prototype.getPayloadHexString = function(){
	
		var dataString = '';
		for(var i=2;i<this.payload.length;i++)
			dataString += this.payload[i].toString(16).toUpperCase()+' ';
	
		return dataString;
	}
	
	
	/*
	*	Return a string of payload data
	* @return {String} String
	*/
	CANPacket.prototype.getPayloadString = function(){
		
		var dataString = '';
		for(var i=2;i<this.payload.length;i++)
			dataString += String.fromCharCode( this.payload[i] );
	
		return dataString;
		
	}
	
	
	
	
	/*
	*	Return buffer length
	*	@param {int} begin
	* @param {int} end Optional
	*/
	CANPacket.prototype.length = function(){
		return this.length;
		// return this.buffer.length;
	}
	
	
	

	
	return CANPacket;
})();






