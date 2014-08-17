'use strict';

/*
*		XGauge style CAN Packet processing
*		Derek K
*		etx313@gmail.com
*/


var XGauge = (function() {

	var mult;
	var div;
	var add;

	/*
	*	@constructor
	*/
	function XGauge( txd, rxf, rxd, math, name ){
		
		if(txd != undefined) this.txd = hexToUint8Array(txd, 8);
		if(rxf != undefined) this.rxf = hexToUint8Array(rxf, 6);
		if(rxd != undefined) this.rxd = hexToUint8Array(rxd, 2);
		if(math != undefined) this.math = hexToUint8Array(math, 6);
		this.name = name;
		
		mult = (this.math[0]<<8) + this.math[1];
		div  = (this.math[2]<<8) + this.math[3] ? (this.math[2]<<8) + this.math[3] : 1;
		add  = (this.math[4]<<8) + this.math[5];
		
	}
	
	
	/**
	 * Converts a hex string into an Uint8Array.
	 * @param {string} hexString Hex string of 16-bit integers (two characters
	 *     per integer).
	 * @return {!Uint8Array.<number>} Uint8Array of {0,255} integers for the given string.
	 */
	function hexToUint8Array(hexString, l) {
	  if( hexString === undefined || hexString.length % 2 != 0 ){
	    throw 'Key string length must be multiple of 2 '+hexString;
	    return false;
	    }
	  var buf = new ArrayBuffer( l ? l : hexString.length/2 );
	  var bufView = new Uint8Array(buf);
	  for (var i = 0; i < hexString.length; i += 2) {
	    bufView[i/2] = parseInt(hexString.substring(i, i + 2), 16);
	  }
	  return bufView;
	};
	
	
	/*
	*	Run XGauge style processing on supplied packet
	*	@param {CANPacket} packet
	* @return {String} String representation of computed value
	*/
	XGauge.prototype.processPacket = function(packet){
		
		
		if( !(packet instanceof CANPacket) ){
			new Error('checkPacket requires a CANPacket instance');
			return false;
			}
		
		// Check packet for Message ID with TXD Message ID + flipped MSB on first byte. (+8)
		if( packet.messageId != (this.txd[0]<<8)+this.txd[1]+8 ) return false;
		
		
		// Check RXF
		var dataStart = 2,
				i = 0;
		
		while( i<=6 && this.rxf[i] != 0){
			if( packet.payload[ dataStart+(this.rxf[i]-1) ] != this.rxf[i+1] ) return false;
			i+=2;
		}
		
		
		// Extract data using RXD
		var output = 0,
				i = this.rxd[0]/8;
				
		while( i <= this.rxd[1]/8 ){
			output = (output << 8) + packet.payload[ i+2 ];
			i++;
			}
		
		
		// Apply Math
		//output *= mult;
/*
		output /= div;
		output += add;
*/
		
		return output;
	}
	

	
	return XGauge;
})();






