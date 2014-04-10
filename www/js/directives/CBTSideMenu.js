
'use strict';

/*
*		Derek K etx313@gmail.com
*		Android style left slide-in menu
*	
*/


angular.module('cbt')
.directive('cbtSideMenu', function($timeout, $ionicGesture){
	
	var showing = false;
	
	
  return {
    restrict: 'E',
    controller: function($scope){
	    
	    
	    angular.extend(this, ionic.controllers.SideMenuController.prototype);

      ionic.controllers.SideMenuController.call(this, {
        left: { width: 275 },
        right: { width: 275 }
      });
      
      
      
	    
	    $scope.cbtSideMenu = function(){};
	    $scope.cbtSideMenu.toggle = function(){
				showing = !showing;
		    
		    console.log();
		    
		    $scope.element[0].style["transition"] = '-webkit-transform 0.33s cubic-bezier(.50,.0,.5,.99)';
		    
		    if(showing)
		    	$scope.element[0].style[ionic.CSS.TRANSFORM] = 'translate3d(0, 0, 0)';
		    	else
		    	$scope.element[0].style[ionic.CSS.TRANSFORM] = 'translate3d(-105%, 0, 0)';
		    	
		    
		    
		    // End a drag with the given event
		    function _endDrag(e) {
		      if(this._isDragging) {
		        this.snapToRest(e);
		      }
		      this._startX = null;
		      this._lastX = null;
		      this._offsetX = null;
		    }
		    
		
		    // Handle a drag event
		    function _handleDrag(e) {
		    
		    	console.log(e);
		    
		      // If we don't have start coords, grab and store them
		      if(!this._startX) {
		        this._startX = e.gesture.touches[0].pageX;
		        this._lastX = this._startX;
		      } else {
		        // Grab the current tap coords
		        this._lastX = e.gesture.touches[0].pageX;
		      }
		
		      // Calculate difference from the tap points
		      if(!this._isDragging && Math.abs(this._lastX - this._startX) > this.dragThresholdX) {
		        // if the difference is greater than threshold, start dragging using the current
		        // point as the starting point
		        this._startX = this._lastX;
		
		        this._isDragging = true;
		        // Initialize dragging
		        this.content.disableAnimation();
		        this._offsetX = this.getOpenAmount();
		      }
		
		      if(this._isDragging) {
		        this.openAmount(this._offsetX + (this._lastX - this._startX));
		      }
		    }
  
		    
	    }
	    
	    
	    	    
    },
    compile: function(element, attr) {
      return { pre: prelink };
      function prelink($scope, $element, $attr, controller) {
	    	
	    	var defaultPrevented = false;
        var isDragging = false;
        var slideX = 0;
        
	    	
	    	$scope.element = $element;
	    	
	    	// Hide 
				$element[0].style[ionic.CSS.TRANSFORM] = 'translate3d(-105%, 0, 0)';
				
				
				
				var dragFn = function(e) {
          if(defaultPrevented) return;
          isDragging = true;
          // controller._handleDrag(e);
          // console.log(e.gesture);
          slideX += e.gesture.deltaX;
          $element[0].style[ionic.CSS.TRANSFORM] = 'translate3d('+slideX+'px, 0, 0)';
          e.gesture.srcEvent.preventDefault();
        };
        
        var dragReleaseFn = function(e) {
          isDragging = false;
          if(!defaultPrevented) {
            controller._endDrag(e);
          }
          defaultPrevented = false;
        };
        
        
        
        var dragRightGesture = $ionicGesture.on('dragright', dragFn, $element);
	      var dragLeftGesture = $ionicGesture.on('dragleft', dragFn, $element);
	      var releaseGesture = $ionicGesture.on('release', dragReleaseFn, $element);
				
				$scope.$on('$destroy', function() {
		      $ionicGesture.off(dragLeftGesture, 'dragleft', dragFn);
		      $ionicGesture.off(dragRightGesture, 'dragright', dragFn);
		      $ionicGesture.off(releaseGesture, 'release', dragReleaseFn);
				});
				
				
				
	    	
			}
      
    },
		replace: true,
    transclude: true,
    template: '<div class="view cbt-side-menu" ng-transclude></div>'
  };
  
});
