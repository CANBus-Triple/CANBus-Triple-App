'use strict';


angular.module('cbt')
	.factory('PipeService', function($rootScope, SerialService){

		var pipeAdapter = require('cbt-wireshark/adapter'),
				port = SerialService.getSerialPort(),
				running = false;


		// if( port ) start();


		$rootScope.$on('HardwareService.CONNECTED',function(event, data){
			port = SerialService.getSerialPort();
		});


		function start(){
			var pipePath = pipeAdapter.init( port, false );

			if( pipePath ){
				$rootScope.$broadcast('PipeService.OPENED', pipePath);
				running = true;
			}
			return pipePath;
		}

		function stop(){
			pipeAdapter.stop();
			running = false;
			$rootScope.$broadcast('PipeService.CLOSED');
		}

		$rootScope.$on('$destroy', function(){
			stop();
		});


		return {
			start: start,
			stop: stop,
			running: function(){return running;}
		};

	});
