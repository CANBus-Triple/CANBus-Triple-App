'use strict';

/*
*		Derek K etx313@gmail.com
*		Display user info 
*	
*/


angular.module('cbt')
.directive('cbtUserInfo', function($timeout, UtilsService){
	
  return {
    restrict: 'EA',
    scope: {
	    email: '=',
	    name: '='
    },
    controller: function userInfoController($scope){
    	if($scope.email == null) $scope.email = "";
	  	$scope.avatarUrl = UtilsService.md5( $scope.email );
    },
    template: '<div class="user-info">'+
    	'<img class="avatar" ng-src="http://www.gravatar.com/avatar/{{avatarUrl}}" />'+
    	'<p>{{name}} <br/>{{email}}</p>'+
	    '</div>',
    link: function($scope){
	    
	    // $scope.$on('$destroy', function() {});
			
    },
    replace: true
  };
});
