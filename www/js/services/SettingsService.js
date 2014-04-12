'use strict';

angular.module('cbt')
	.factory('SettingsService', function($rootScope, localStorageService){
		
		// window.ls = localStorageService;
		
		
		return {
			// Properties
			
			
			
			// Methods
			getDevice: function(){
				return localStorageService.get('device');
			},
			setDevice: function(v){
				return localStorageService.add('device', v);
			},
			getAutoconnect: function(){
				
				if(localStorageService.get('autoconnect') != null){
					return localStorageService.get('autoconnect');
				}else{
					return localStorageService.add('autoconnect', true);
					return true;
				}
				
			},
			setAutoconnect: function(v){
				localStorageService.add('autoconnect', v === 'true' || v );
				$rootScope.$broadcast('SettingsService.CHANGE', 'autoconnect');
			},
			getDebugMode: function(){
				return localStorageService.get('debugMode');
			},
			setDebugMode: function(v){
				localStorageService.add('debugMode', v);
				$rootScope.$broadcast('SettingsService.CHANGE', 'debugMode');
			},
		};
		
	});





