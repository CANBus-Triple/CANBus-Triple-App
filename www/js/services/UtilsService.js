'use strict';

angular.module('cbt')
	.factory('UtilsService', function(){
		
		var Util = {};
		
		/**
		 * Turns a string into an array of bytes; a "byte" being a JS number in the
		 * range 0-255.
		 * @param {string} str String value to arrify.
		 * @return {!Array.<number>} Array of numbers corresponding to the
		 *     UCS character codes of each character in str.
		 */
		Util.stringToByteArray = function(str) {
		  var output = [], p = 0;
		  for (var i = 0; i < str.length; i++) {
		    var c = str.charCodeAt(i);
		    while (c > 0xff) {
		      output[p++] = c & 0xff;
		      c >>= 8;
		    }
		    output[p++] = c;
		  }
		  return output;
		};
		
		
		/**
		 * Turns an array of numbers into the string given by the concatenation of the
		 * characters to which the numbers correspond.
		 * @param {Array} array Array of numbers representing characters.
		 * @return {string} Stringification of the array.
		 */
		Util.byteArrayToString = function(array) {
		  return String.fromCharCode.apply(null, array);
		};
		
		
		/**
		 * Turns an array of numbers into the hex string given by the concatenation of
		 * the hex values to which the numbers correspond.
		 * @param {Array} array Array of numbers representing characters.
		 * @return {string} Hex string.
		 */
		Util.byteArrayToHex = function(array) {
		  var a = [];
		  for(var i=0; i<array.length; i++){
		    var hexByte = array[i].toString(16);
		    a.push( hexByte.length > 1 ? hexByte : '0' + hexByte );
		  }
		  return a.join('');
		};
		
		
		/**
		 * Converts a hex string into an integer array.
		 * @param {string} hexString Hex string of 16-bit integers (two characters
		 *     per integer).
		 * @return {!Array.<number>} Array of {0,255} integers for the given string.
		 */
		Util.hexToByteArray = function(hexString) {
		  if(hexString.length % 2 != 0){
		    throw 'Key string length must be multiple of 2';
		    return false;
		    }
		  var arr = [];
		  for (var i = 0; i < hexString.length; i += 2) {
		    arr.push(parseInt(hexString.substring(i, i + 2), 16));
		  }
		  return arr;
		};



		
		return Util;

		
		
		
		
	});





