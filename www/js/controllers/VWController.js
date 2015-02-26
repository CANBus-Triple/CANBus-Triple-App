'use strict';  


angular.module('cbt')

	.run(function($templateCache, MenuService){
		
		/*
	  *	Template
	  */
	  
	  $templateCache.put('templates/plugins/volkswagen.html', '<ion-view title="{{navTitle}}" hide-back-button="true" left-buttons="leftButtons" right-buttons="rightButtons" hide-back-button="true">'+
												'	<ion-nav-buttons side="left">'+
												'    <button class="button" ng-click="showSendCommandModal()">Serial Command</button>'+
												'  </ion-nav-buttons>'+
												'	<ion-content padding="true">'+
												'		<button class="button button-positive" ng-click="windowUp()">Driver Window Up</button>'+
												'		<button class="button button-positive" ng-click="windowDown()">Driver Window Down</button>'+
												'		<button class="button button-positive" ng-click="windowUpBack()">Driver Rear Window Up</button>'+
												'		<button class="button button-positive" ng-click="windowDownBack()">Driver Rear Window Down</button>'+
												'		<button class="button button-positive" ng-click="bothUp()">Both Windows Up</button>'+
												'	</ion-content>'+
												'</ion-view>');
												
												
		/*
		*	Add to Menu
		*/
		
		MenuService.addPlugin('Volkswagen', 'ion-model-s', 'vw');
		
	  
		
	})
	
	.config(function($stateProvider){
		
		/*
		*	Add Route
		*/
		
		$stateProvider.state('vw', {
			url: '/vw',
			controller: 'VWController',
			templateUrl: 'templates/plugins/volkswagen.html'
    });
		
	})

	.controller('VWController', function ($scope, $interval, HardwareService) {
	
	  $scope.navTitle = "VW";
	  
	  
	  $scope.windowDown = function(){
		  HardwareService.send( String.fromCharCode(0x02, 0x02, 0x01, 0x81, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02 ) );
	  }
	  
	  $scope.windowUp = function(){
		  HardwareService.send( String.fromCharCode(0x02, 0x02, 0x01, 0x81, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02 ) );
	  }
	  
	  
	  $scope.windowDownBack = function(){
		  HardwareService.send( String.fromCharCode(0x02, 0x02, 0x01, 0x81, 0x00, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02 ) );
	  }
	  
	  $scope.windowUpBack = function(){
		  HardwareService.send( String.fromCharCode(0x02, 0x02, 0x01, 0x81, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02 ) );
	  }
	  
	  $scope.bothUp = function(){
		  HardwareService.send( String.fromCharCode(0x02, 0x02, 0x01, 0x81, 0x02, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02 ) );
	  }
	  
	  
	  $scope.lock = function(){
		  HardwareService.send( String.fromCharCode(0x02, 0x02, 0x03, 0x91, 0x00, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03 ) );
	  }
	  
	  $scope.unlock = function(){
		  HardwareService.send( String.fromCharCode(0x02, 0x02, 0x03, 0x91, 0x00, 0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03 ) );
	  }
	  		
		
		
	});
