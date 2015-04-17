'use strict';

angular.module('cbt')
  .directive('pidEditor', ['CBTSettings', function(CBTSettings){

    return {
      restrict: 'E',
      template: '<section ui-sortable="{tolerance:100}" ng-model="pids" class="pids">'+
                  '<pid-object ng-repeat="pid in pids" class="pid-object bevel-shadow" index="$index" pid="pid"/>'+
                '</section>',
      link: function (scope, elem, attrs) {

        /*
        scope.pidRows = [];
        var columns = 4;
        for( var i=0; i<CBTSettings.pids.length; i+=columns )
          scope.pidRows.push( CBTSettings.pids.slice( i, i+columns ) );

        if( i < CBTSettings.pids.length && CBTSettings.pids.length-i < columns)
          scope.pidRows.push( CBTSettings.pids.slice( i, CBTSettings.pids.length ) );
          */

      },
      scope: {
        pids: "="
      }
    }

  }]).
  directive('pidObject', ['CBTSettings', function(CBTSettings){

    return {
      restrict: 'E',
      template: '<form class="pid-form">'+
                '<label for="name">NAME</label><input type="text" class="form-control" id="name" ng-model="pid.name" max="8"/>'+
                '<label for="busid">BUS</label><input type="text" class="form-control" id="busid" ng-model="pid.busId" max="1"/>'+
                '<label for="txd">TXD</label><input type="text" class="form-control" id="txd" ng-model="pid.txd" max="8"/>'+
                '<label for="rxf">RXF</label><input type="text" class="form-control" id="rxf" ng-model="pid.rxf" max="8"/>'+
                '<label for="rxd">RXD</label><input type="text" class="form-control" id="rxd" ng-model="pid.rxd" max="8"/>'+
                '<label for="mth">MATH</label><input type="text" class="form-control" id="mth" ng-model="pid.mth" max="8"/>'+
                '</form>',
      link: function (scope, elem, attrs) {
      },
      scope: {
        index: "=",
        pid: "="
      }
    }

  }]);
