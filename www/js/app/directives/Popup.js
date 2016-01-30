'use strict';

/*
*		Derek K etx313@gmail.com
*		Electron Popup Directive
*
*/


angular.module('cbt')
.directive('popup', function($timeout, UtilsService){

  return {
    restrict: 'A',
    scope: {
      title: '@popup'
    },
    controller: function ($scope){

      $scope.doPop = function(url){
        require('shell').openExternal($scope.url);
      }

    },
    link: function($scope, element, attrs){

      if( typeof attrs.popup == 'undefined' )
        return;

      $scope.url = attrs.popup;
      element.bind('click', $scope.doPop);


    },
    replace: true
  };
});
