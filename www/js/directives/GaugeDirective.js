'use strict';

/*
*		Derek K etx313@gmail.com
*		Display a selectable list of CANBus hardware discovered
*	
*/


angular.module('cbt')
.directive('gauge', function($compile, $timeout, HardwareService){
	
	var el;
	
	var updateTimeout;
	
	var displayTemplate = '<div class=""><h3>{{name}}</h3><h1>{{gaugeValue}}</h1>';
  /*
  var radialTemplate = '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="256px" height="128px" viewBox="0 0 256 128" enable-background="new 0 0 256 128" xml:space="preserve">'+
'<g id="gaugeValue">'+
	'<defs>'+
		'<path id="SVGID_1_" d="M248.75,124.25h-33c0-48.386-39.364-87.75-87.75-87.75s-87.75,39.364-87.75,87.75h-33 C7.25,57.668,61.418,3.5,128,3.5S248.75,57.668,248.75,124.25z"/>'+
	'</defs>'+
	'<clipPath id="SVGID_2_">'+
		'<use xlink:href="#SVGID_1_"  overflow="visible"/>'+
	'</clipPath>'+
	'<g clip-path="url(#SVGID_2_)">'+
		'<path fill="#D31F3F" d="M128,246.5c-67.409,0-122.25-54.841-122.25-122.25C5.75,56.841,60.591,2,128,2v36 c-47.559,0-86.25,38.691-86.25,86.25S80.441,210.5,128,210.5V246.5z"/>'+
		'<path fill="none" d="M128,20c57.576,0,104.25,46.674,104.25,104.25S185.576,228.5,128,228.5"/>'+
	'</g>'+
'</g>'+
'<rect x="55.667" y="95.917" fill="none" width="144.667" height="28.333"/>'+
'<text id="gaugeTextValue" text-anchor="start" transform="matrix(1 0 0 1 118.7663 121.4759)" font-family="Helvetica" font-size="36">{{gaugeValue}}</text>'+
'</svg>';
*/

	var radialTemplate = '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="512px" height="512px" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve">'+
'<path id="valuePath" fill="none" stroke="{{color}}" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M404.157,378.13C431.546,344.941,448,302.392,448,256c0-106.039-85.961-192-192-192S64,149.961,64,256 c0,46.052,16.213,88.317,43.243,121.399" stroke-dasharray="900 900" stroke-dashoffset="{{gaugeValue}}"/>'+
'<rect x="84" y="227" fill="none" width="344" height="68"/>'+
'<text id="gaugeValue" transform="matrix(1 0 0 1 179.4502 271.1953)" font-family="RobotoCondensed-Bold" font-size="58">{{gaugeValue}}</text>'+
'<rect x="84" y="349" fill="none" width="344" height="68"/>'+
'<text id="gaugeName" transform="matrix(1 0 0 1 187.125 393.1953)" font-family="RobotoCondensed-Bold" font-size="58">{{name}}</text>'+
'</svg>';


  var getTemplate = function(contentType) {
  
    switch(contentType) {
      case 'display':
        return displayTemplate;
        break;
      case 'radial':
        return radialTemplate;
        break;
    }

  }

  var linker = function(scope, element, attrs) {
  	el = element;
		element.html(getTemplate(scope.style));
		$compile(element.contents())(scope);
  }
	    	
	
  return {
    restrict: 'E',
    scope: {
    	id: "@id", // kill
    	txd: "@txd",
    	rxf: "@rxf",
    	rxd: "@rxd",
    	math: "@mth",
    	name: "@name",
    	style: "@gaugeStyle",
    	color: "@color",
    },
    controller: function gaugeController($scope){
    	
    	$scope.gaugeValue = "0";
    	
    	
    	// Init XGauge processor
    	var xgauge = new XGauge( $scope.txd, $scope.rxf, $scope.rxd, $scope.math, $scope.name );
    	
    	
    	
    	function processRadial(){				
				
			}
			
			function processDisplay(){
				
			}
    
	    
	    
	    
	    $scope.packetHandler = function(packet){
				
				
				var value = xgauge.processPacket(packet);
				
				if( value == false ) return;
				
				$scope.gaugeValue = value;
				
				
				switch($scope.style){
					case 'radial':
						processRadial();
					break;
					default:
					case 'display':
						processDisplay();
					break;
				}
				
				if( updateTimeout )
					$timeout.cancel(updateTimeout);
				updateTimeout = $timeout(function(){}, 50);
				
			}
			
			
			
			
		
			// Packet Listener Setup
			HardwareService.registerPacketHandler($scope.packetHandler);
			$scope.$on("$destroy", function() {
	    	HardwareService.deregisterPacketHandler($scope.packetHandler);	
	    });

	    
    },
    // template: '',
    link: linker,
    replace: true
  };
});
