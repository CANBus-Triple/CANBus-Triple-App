
'use strict';

/*
*		Derek K etx313@gmail.com
*		Android style left slide-in menu
*
*/


angular.module('cbt')
.directive('cbtSideMenu', function($timeout, $document){

	var showing = false;


  return {
    restrict: 'E',
    controller: function($scope){

      $scope.cbtSideMenu = this;

    },
    link: function(scope, element, attr, controller){

	    var header,
	    		startX = 0,
	    		startY = 0,
			    x = 0,
			    y = 0,
			    deltaX = 0,
			    lastX = 0,
			    peek = 12,
			    intent,
			    containerOutAlpha = 0.7;

			var panel = element[0].childNodes[0],
					container = element[0];

      function init(){
    		controller.updateState();
      }


      element.on('touchstart', function(event) {

      	intent = null;

      	setHeaderOffset();

      	// Expand container to 100% when a drag starts
      	container.style['transition'] = 'background 0.2s cubic-bezier(.50,.0,.5,.99), width 1ms ease';
				container.style['width'] = '100%';

        // Prevent default dragging of selected content
        event.preventDefault();
        lastX = deltaX = 0;
        startX = event.touches[0].pageX - x;
        startY = event.touches[0].pageY - y;
        // startY = event.pageY - y;
        $document.on('touchmove', mousemove);
        $document.on('touchend', mouseup);
        $document.on('touchleave', mouseup);
        $document.on('touchcancel', mouseup);

        panel.style["transition"] = '';

      });


      function mousemove(event) {

      	// Abort if intent is vertical
      	if ( intent == null &&
      			 Math.abs(event.touches[0].pageY - startY) > Math.abs(event.touches[0].pageX - startX) ){
	      		mouseup();
	      		return;
      		}else{
      			intent = 'x';
      		}

        deltaX = (event.touches[0].pageX - lastX) * 65 ;
        lastX = event.touches[0].pageX;
        x = event.touches[0].pageX - startX;


        if(x > 0) x = 0;

        panel.style['webkitTransform'] = 'translate3d('+x+'px, 0px, 0)';
        // container.style['transition'] = '';
        // container.style['background-color'] = 'rgba(0,0,0,'+containerOutAlpha * percentPanelIn()+')';


      }

      function mouseup() {
        $document.unbind('touchmove', mousemove);
        $document.unbind('touchend', mouseup);

        panel.style["transition"] = '-webkit-transform 0.333s ease-out';

        // Tap on shaded container will hide panel
        if( x == 0 && startX > panel.offsetWidth && showing ){
	        showing = false;
	        controller.updateState();
	        return;
        }

        // Ease to final X on touch release
        if( x + deltaX > -panel.offsetWidth*0.5 ){
        	showing = true;
        	controller.updateState();
        }else{
        	showing = false;
        	controller.updateState();
        }
      }

      function percentPanelIn(){
	      return (x/panel.offsetWidth)+1;
      }

      function setHeaderOffset(){

				return;

	      // Set header y offset
      	if(header == undefined)
	      	header = $document.find('header');

	      if(header)
	      	container.style['top'] = header[0].offsetHeight+'px';
      }



      /*
      *	Ng Event listeners
      */

      scope.$on('$destroy', function(){
	      element.unbind('touchstart');
      });


      /*
      *	Event listeners
      */

      // $document.on('resize', init);
      $document.on('orientationchange', init);


      // Init
      $timeout(function(){
      	init();
      });

      /*
      *	Controller methods
      */


      controller.toggle = function(){
	    	showing = !showing;
	    	setHeaderOffset();
				this.updateState();
	    }

			controller.show = function(){
				showing = true;
				setHeaderOffset();
				this.updateState();
			}

			controller.hide = function(){
				showing = false;
				setHeaderOffset();
				this.updateState();
			}



      controller.updateState = function(){

	      panel.style["transition"] = '-webkit-transform 0.333s cubic-bezier(.50,.0,.5,.99) 0s';

	      if(showing){
	      	x = 0;
					container.style['background-color'] = 'rgba(0,0,0,'+containerOutAlpha+')';
					container.style['transition'] = 'background 0.2s cubic-bezier(.50,.0,.5,.99), width 1ms ease';
					container.style['width'] = '100%';
					panel.style['webkitTransform'] = 'translate3d('+x+'px, 0, 0)';
					scope.$broadcast('CBTSideMenu.IN');
	      	}else{
	      	x = -panel.offsetWidth - peek;
					container.style['background-color'] = 'rgba(0,0,0,0)';
					container.style['transition'] = 'background 0.2s cubic-bezier(.50,.0,.5,.99), width 1ms ease 0.2s';
					container.style['width'] = peek+'px';
					panel.style['webkitTransform'] = 'translate3d('+x+'px, 0, 0)';
					scope.$broadcast('CBTSideMenu.OUT');
	      	}




      }





    },
		replace: true,
    transclude: true,
    template: '<div class="side-menu"><div id="panel" ng-transclude></div></div>'
  };

});
