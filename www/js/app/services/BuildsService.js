'use strict';

angular.module('cbt')
	.factory('BuildsService', function($rootScope, $timeout, $http, HardwareService){

    var rootPath = 'https://raw.githubusercontent.com/CANBus-Triple/CANBus-Triple-Builds/master/',
        sources = [];



    function updateSources(){

      $http({method: 'GET', url: rootPath+'builds.json'})
		    .success(function(data, status, headers, config) {
          sources = data;
          $rootScope.$broadcast('BuildsService.LOAD', data);
		    })
		    .error(function(data, status, headers, config) {
          throw new Error( "BuildsService: Error loading sources "+status );
		    });

    }

    updateSources();

    HardwareService.command( 'info' );


		return {
      rootPath: rootPath,
      getSources: function(){ return sources },
		};

	});
