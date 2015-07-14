'use strict';


angular.module('cbt')
	.controller('HomeController', function ($scope, $state, appVersion) {

    $scope.version = appVersion;

    $scope.items = [
      {
        name: 'Watch CAN Packets',
        icon: 'ion-settings',
        sref: 'logger',
      },
      {
        name: 'Pipe CAN packets to Wireshark',
        icon: 'ion-arrow-right-c',
        sref: 'pipe',
      },
      {
        name: 'Settings',
        icon: 'ion-gear-b',
        sref: 'settings',
      },
    ];

    $scope.listItemClick = function(n){
      $state.go( $scope.items[n].sref );
    }

});
