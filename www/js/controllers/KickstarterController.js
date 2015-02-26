'use strict';  


angular.module('cbt')

	.run(function($templateCache, MenuService){
		
		/*
	  *	Template
	  */
	  
	  $templateCache.put('templates/plugins/kickstarter.html', '<ion-view title="{{navTitle}}" hide-back-button="true" left-buttons="leftButtons" right-buttons="rightButtons" hide-back-button="true">'+
																															'	<ion-nav-buttons side="left">'+
																															'    <button class="button" ng-click="showSendCommandModal()">Serial Command</button>'+
																															'  </ion-nav-buttons>'+
																															'	<ion-content padding="true">'+
																															'<button class="button button-positive" ng-click="updateData()">Update Kickstarter</button>'+
																																																			'<h2>{{backers}}</h2>'+
																																																			'<h2>{{dollars}}</h2>'+
																																																		'</div>'+
																															'	</ion-content>'+
																															'</ion-view>');
												
												
		/*
		*	Add to Menu
		*/
		
		MenuService.addPlugin('Kickstarter', 'ion-happy	', 'kickstarter');
		
	  
		
	})
	
	.config(function($stateProvider){
		
		/*
		*	Add Route
		*/
		
		$stateProvider.state('kickstarter', {
			url: '/kickstarter',
			controller: 'KickstarterController',
			templateUrl: 'templates/plugins/kickstarter.html'
    });
		
	})

	.controller('KickstarterController', function ($scope, $http, $interval, HardwareService) {
	
	  $scope.navTitle = "Kickstarter";
	  
	  $scope.backers = 0;
	  $scope.dollars = 0;
	  
	  
	  var query = {
		    url: 'http://www.kickstarter.com/projects/etx/canbus-triple-the-car-hacking-platform',
		    type: 'html',
		    selector: 'data.Project799553398',
		    extract: 'text'
		  },
		  uriQuery = encodeURIComponent(JSON.stringify(query)),
		  request  = 'http://example.noodlejs.com/?q=' +
		             uriQuery + '&callback=JSON_CALLBACK';
		
	  
	  
	  $scope.updateData = function(){
		  
		  $http({method: 'JSONP', url: request}).
		    success(function(data, status, headers, config) {
		      // this callback will be called asynchronously
		      // when the response is available
		      
		      $scope.backers = data[0].results[2];
		      $scope.dollars = data[0].results[4];
		      
		      var message = "             "+$scope.backers+" Backers!!     "+$scope.dollars+" 50 Percent Funded!   ";
		      console.log(message);
		      
		      var i=0;
		      
		      var p;
		      p = $interval(function(){
		      	console.log(message.substr(i, 12));
			      HardwareService.send( String.fromCharCode(0x16) + message.substr(i, 12) );
			      i++;
			      
			      if(i>message.length)
			      	$interval.cancel(p);
			      
		      }, 500);
		      
		      
		      
		    }).
		    error(function(data, status, headers, config) {
		      // called asynchronously if an error occurs
		      // or server returns response with an error status.
		      
		      console.log( 'Error: ', arguments );
		      
		    });
		  
	  };
	  	  
	  
	  		
		
		
	});
