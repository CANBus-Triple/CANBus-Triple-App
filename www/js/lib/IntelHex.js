'use strict';

/*
*		Parse and verify Intel Hex
*		Derek K
*		etx313@gmail.com
*/


var IntelHex = (function() {

	/*
	*	@constructor
	*/
	function IntelHex(hexString){
		
		this.buffer = {};
		this.intelHexEnd = ':00000001FF';
		this.startAddress = 0;
		
		
		if(hexString) this.parse(hexString);
		
	}
	
	
	
	/*
	*	Parse loaded Hex into ArrayBuffer
	*	@param {String} hex
	*/
	IntelHex.prototype.parse = function(hex){
		
		var checksumError = -1,
				index = 0,
				bufferSize;
		
		// Fix any line ending weirdness
		hex = hex.replace(/\r?\n/g, "\r\n");
		
		// Determine buffer size
		var hexLines = hex.split('\r\n');
		
		// Start at the end and find the last memory address
		for(index=hexLines.length-1; index > -1; index--){
			var line = hexLines[index];
			if( line.length > 4 && line.slice(0,11) != this.intelHexEnd ){
				bufferSize = parseInt(line.slice(3,7), 16) + parseInt( line.slice(1,3), 16 );
				break;
			}
		}
		
		
		this.startAddress = parseInt( hexLines[0].slice(3,7), 16 );
		
		
		// Init a new buffer to hold the data
		this.buffer = new ArrayBuffer(bufferSize);
		var view = new Uint8Array(this.buffer);
		
		
		// Fill with FF
		for( index=0; index<bufferSize; index++ )
			view[index] = 0xFF;
		
		// Copy String data from hex file into the buffer
		hexLines.forEach((function(value, index, array){
	  	
	  	if( value.slice(0,11) == this.intelHexEnd || value.length < 2 )
	    	return;
	  	
	  	var size = parseInt( value.slice(1,3), 16 );
	  	var address = parseInt( value.slice(3,7), 16 );
			
			for(var i=0; i<size; i++)
				view[address+i] = parseInt(value.slice(9+(i*2), 11+(i*2)), 16);
			
			checksumError = !this.checksum(value) ? address : checksumError;
			
		}).bind(this));
		
		
		
		// Checksum error?
		if(checksumError > -1){
			console.log('checksumError', checksumError);
		}
		
		this.length = bufferSize;
		
	}
	
	
	
	
	
	/*
	*	Convert buffer back to Intel Hex String
	*	@param {Int} size 16 bit or 32 bit lines
	*/
	IntelHex.prototype.encode = function(size){
		// TODO
	}
	
	
	
	
	
	
	/*
	*	Verify checksum of a line from Intel Hex format.
	*	Checksum is verified by adding all hex values, excluding the checksum byte. 
	*	Then calculating the 2's complement and checking against the last byte of the value string
	*	@param {String} value
	* @return {Boolean} success / fail
	*/
	IntelHex.prototype.checksum = function(value){
	
		var sum = 0;
		
		var check = parseInt(value.slice(-2), 16);
		value = value.slice(1, value.length-2)
		
		for(var i=0; i<value.length; i+=2){
			sum += parseInt(value.slice(i, i+2), 16);
			}
		
		if( parseInt((~sum + 1 >>> 0).toString(16).slice(-2), 16) == check ){
			return true
		}else{
			console.log('invalid checksum:', value, check, parseInt((~sum + 1 >>> 0).toString(16).slice(-2), 16));
			return false;
			}
		
	}
	
	
	
	
	/*
	*	Return a slice of the ArrayBuffer
	*	@param {int} begin
	* @param {int} end Optional
	*/
	IntelHex.prototype.slice = function(start, end){
		return this.buffer.slice(start, end);
	}
	
	
	/*
	*	Return buffer length
	*	@param {int} begin
	* @param {int} end Optional
	*/
	IntelHex.prototype.length = function(){
		return this.buffer.length;
	}
	
	
	

	
	return IntelHex;
})();

















/*
*	Parse loaded Hex into ArrayBuffer
*	@param {String} hex
*/
/*

function parseHex(hex){
	
	var deferred = $q.defer(),
			checksumError = -1;
	
			hexHashMap = {};
	
	// Fix any line ending weirdness
	hex = hex.replace(/\r?\n/g, "\r\n");
	
	angular.forEach(hex.split('\r\n'), function(value, key){
  	
  	if( value.slice(0,11) == intelHexEnd || value[0] != ':' || value.length < 1 )
    	return;
  	
  	
  	var size = parseInt( value.slice(1,3), 16 );
  	var address = parseInt( value.slice(3,7), 16 );
		var buffer = new ArrayBuffer(size);
		var view = new Uint8Array(buffer);
		
		for(var i=0; i<size; i++)
			view[i] = parseInt(value.slice(9+(i*2), 11+(i*2)), 16);
		
		checksumError = !checksum(value) ? address : checksumError;
		
		hexHashMap[ address ] = view;
		
		
	}, this);
	
	// Checksum error?
	if(checksumError > 0){
		console.log('checksumError', checksumError);
		$rootScope.$broadcast('FirmwareService.INTEL_HEX_INVALID', 'invalid checksum ' );
		deferred.reject();
	}
	
	console.log(hexHashMap);
	deferred.resolve();
	
	return deferred.promise;	
}
*/


		
		
		
		
