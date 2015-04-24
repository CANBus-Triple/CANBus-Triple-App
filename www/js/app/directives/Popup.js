'use strict';

/*
*		Derek K etx313@gmail.com
*		Node-Webkit Popup Directive
*
*/


angular.module('cbt')
.directive('popup', function($timeout, UtilsService){

  var gui = require('nw.gui'),
      nwPopup,
      url = '';

  function doPop(){

    nwPopup = gui.Window.open( url, {
        toolbar: false,
        frame: true,
        nodejs: false
        });

  }

  return {
    restrict: 'A',
    controller: function ($scope){
    },
    link: function($scope, element, attrs){

      if( typeof attrs.popup == 'undefined' )
        return;

      url = attrs.popup;

      element.bind('click', doPop);


    },
    replace: true
  };
});
