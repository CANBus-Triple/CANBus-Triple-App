'use strict';

angular.module('cbt')
	.factory('SettingsService', function($rootScope, localStorageService, $http){


		
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
					localStorageService.add('autoconnect', true);
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

				console.log(v);

				localStorageService.add('debugMode', v);
				$rootScope.$broadcast('SettingsService.CHANGE', 'debugMode');
			},
		};

	});
