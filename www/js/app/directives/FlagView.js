'use strict';

angular.module('cbt')
  .directive('flagView', function(){


    return {
      restrict: 'E',
      template: '{{title}}'+
                '<a class="led" ng-repeat="led in values track by $index" ng-class="{\'active\':values[$index]}" title="{{info[title.toLowerCase()][$index]}}"></a>',
      link: function (scope, elem, attrs) {

        scope.values = Array(8);

        scope.$watch('value',function(newValue,oldValue) {
          for(var i=0; i<8; i++)
            scope.values[i] = !!(newValue & (0x01 << 7-i));
        });

      },
      controller: function($scope){

        // Description Library
        $scope.info = {
          error:[
            'RX1OVR: Receive Buffer 1 Overflow Flag bit',
            'TXBO: Bus-Off Error Flag bit',
            'TXBO: Bus-Off Error Flag bit',
            'TXEP: Transmit Error-Passive Flag bit',
            'RXEP: Receive Error-Passive Flag bit',
            'TXWAR: Transmit Error Warning Flag bit',
            'RXWAR: Receive Error Warning Flag bit',
            'EWARN: Error Warning Flag bit',
          ],
          // Datasheet pg 58
          control:[
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            ''
          ],
          status:[
            'CANINTF.RX0IF',
            'CANINTFL.RX1IF',
            'TXB0CNTRL.TXREQ',
            'CANINTF.TX0IF',
            'TXB1CNTRL.TXREQ',
            'CANINTF.TX1IF',
            'TXB2CNTRL.TXREQ',
            'CANINTF.TX2IF'
          ]
        }

      },
      scope: {
        title: "@",
        value: "@"
      }
    }

  });
