'use strict';
/*
 *	CANBus Tripple App
 *	http://canb.us
 *
*/


angular.module('cbt', ['ionic', 'ngMaterial', 'LocalStorageModule'])

	.run(function($ionicPlatform) {
		/*
	  $ionicPlatform.ready(function() {
	    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
	    // for form inputs)
	    if(window.cordova && window.cordova.plugins.Keyboard) {
	      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
	    }
	    if(window.StatusBar) {
	      // org.apache.cordova.statusbar required
	      StatusBar.styleDefault();
	    }
	  });
		*/
	})
	.run(function(SerialService){

		/*
		*		Node-Webkit Setup
		*/
		if(typeof require != 'undefined'){

			var gui = require('nw.gui'),
		  		win = gui.Window.get();

		  var nativeMenuBar = new gui.Menu({ type: "menubar" });
			nativeMenuBar.createMacBuiltin("CANBus Triple");
			nativeMenuBar.append(new gui.MenuItem({ label: 'Item A' }));
			win.menu = nativeMenuBar;

		  win.on('close', function() {
			  this.hide(); // Pretend to be closed already
			  console.log("We're closing...");
			  SerialService.close();
			  this.close(true);
			});

			win.show();
		}

	})
	.config(function($stateProvider, $urlRouterProvider, localStorageServiceProvider) {

			// Ionic uses AngularUI Router which uses the concept of states
	    // Learn more here: https://github.com/angular-ui/ui-router
	    // Set up the various states which the app can be in.
	    // Each state's controller can be found in controllers.js
	    $stateProvider

				.state('home', {
					url: '/',
					templateUrl: 'templates/home.html'
				})

	      .state('hardware', {
					url: '/hardware',
					abstract: true,
					templateUrl: 'templates/hardware/main.html'
		    })

				.state('hardware.status', {
          url: '',
          controller: 'HWStatusController',
          templateUrl: 'templates/hardware/hw-status.html'
        })

				.state('firmware', {
          url: '/firmware',
          controller: 'BuildsController',
          templateUrl: 'templates/firmware.html',
        })

	      .state('hardware.connect', {
          url: '/connect',
          controller: 'ConnectionController',
          templateUrl: 'templates/hardware/connection.html'
	      })

	      .state('dashboard', {
	          url: '/dashboard',
	          controller: 'DashboardController',
	          templateUrl: 'templates/dashboard.html'
	      })

	      .state('logger', {
	          url: '/logger',
	          controller: 'LoggerController',
	          templateUrl: 'templates/logger.html'
	      })

				.state('diagnostics', {
	          url: '/diagnostics',
	          controller: 'DiagController',
	          templateUrl: 'templates/diagnostics.html'
	      })

		    // .state('logger.view', {
				// 	url: "/view",
				// 	views: {
				// 	'home-tab': {
				// 		templateUrl: 'templates/pidfinder.view.html'
				// 		}
				// 	}
				// })

	      .state('settings', {
	          url: '/settings',
	          controller: 'SettingsController',
	          templateUrl: 'templates/settings.html'
	      })

	      .state('debug', {
	          url: '/debug',
	          controller: 'DebugController',
	          templateUrl: 'templates/debug.html'
	      });


	    // $urlRouterProvider.otherwise('/dashboard');
	    $urlRouterProvider.otherwise('/');

	    // Set local storage prefix
	    localStorageServiceProvider.setPrefix('CBTSettings');

	})

	.config(function($mdThemingProvider) {

		$mdThemingProvider.theme('default')
	    .primaryPalette('deep-orange')
	    .accentPalette('grey');

	})

	.config(['$provide', function ($provide) {
	  $provide.decorator('$rootScope', function ($delegate) {

	    var _emit = $delegate.$emit;
	    $delegate.$emit = function(){
	      console.log.apply(console, arguments);
	      _emit.apply(this, arguments);
	    };

			var origBroadcast = $delegate.$broadcast;
			$delegate.$broadcast = function() {
	      // console.log("$broadcast: ", JSON.stringify(arguments));
	      console.log("$broadcast: ", arguments);
	      return origBroadcast.apply(this, arguments);
	    };

	    return $delegate;

	  });
	}])

	;


angular.module('cbt')
	.controller('AppController', function ($scope, $rootScope, $timeout, $ionicModal, $mdDialog, HardwareService, UtilsService) {

		$scope.navTitle = "AppController";
		$scope.title = "AppController title";

		$scope.hwState = {};


		$scope.leftButtons = [{
		 	type: 'button-clear',
			content: '<i class="icon ion-navicon"></i>',
	    tap: function(e) {
      		$scope.cbtSideMenu.toggle();
    		}
		}];


		$scope.rightButtons = [];

		$scope.navShowing = false;

		$scope.connectIcon = false;
		$scope.connectIconDisable = false;

		$scope.showCommandButton = false;

		$scope.$on('CBTSideMenu.IN', navHandler);
		$scope.$on('CBTSideMenu.OUT', navHandler);

		function navHandler(event){

			$timeout(function(){
				switch(event.name){
					case 'CBTSideMenu.IN':
						$scope.navShowing = true;
					break;
					case 'CBTSideMenu.OUT':
						$scope.navShowing = false;
					break;
				}
			})

		}


		$scope.toggleMenu = function(){
			$scope.cbtSideMenu.toggle();
		}

		$scope.showCmdBtn = function(){
			$scope.showCommandButton = true;
		}



		/*
		*		Send Command Modal
		*/

		$scope.recentCommands = [
			'01 01',
			'03 01 01 0000 0000',
			'03 02 01 0000 0000',
			'03 03 01 0000 0000',
		];


		$scope.sendCommand = function(command){

			$scope.commandInput = command;

			if( typeof command != 'string' ) return;

			command = command.replace(/\s/g,'');

			if( command.length < 1 ) return;

			if( $scope.recentCommands.indexOf(command) == -1 )
				$scope.recentCommands.unshift(command);

			HardwareService.send( UtilsService.hexToUint8Array( command ) );

		}

		$scope.showSendCommandModal = function(){

			$ionicModal.fromTemplateUrl('templates/modals/sendCommand.html', {
		    scope: $scope,
		    animation: 'slide-in-up'
		  }).then(function(modal) {
		    $scope.modal = modal;
		    $scope.modal.show();
		  });
		  $scope.closeModal = function() {
		    $scope.modal.hide();
		  };
		  //Cleanup the modal when we're done with it!
		  $scope.$on('$destroy', function() {
		    $scope.modal.remove();
		  });
		  // Execute action on hide modal
		  $scope.$on('modal.hidden', function() {
		    // Execute action
		  });
		  // Execute action on remove modal
		  $scope.$on('modal.removed', function() {
		    // Execute action
		  });

		}







		/*
		*	Watch HardwareService connection status
		*/
		$scope.hardwareConnected = HardwareService.connectionMode();
	  $scope.$watch(
      function(){ return HardwareService.connectionMode() },
      function(newVal) {
        $scope.hardwareConnected = newVal;
      }
    )


		/*
		*	Watch Hardware state for access from all controllers
		*/
		$rootScope.$on( 'hardwareEvent', hardwareEventHandler );
		function hardwareEventHandler( eventName, eventObject ){

			$timeout(function(){
				switch(eventObject.event){
					case 'busdbg':
						if( typeof $scope.hwState[eventObject.event] == 'undefined' ) $scope.hwState[eventObject.event] = {};
						$scope.hwState[eventObject.event][eventObject.name] = eventObject;
						break;
					default:
						$scope.hwState[eventObject.event] = eventObject;
						break;
				}

			});

		}






		/*
		*	Private Methods
		*/


		/*
		*		Event Listeners
		*
		*/
		$rootScope.$on('HardwareService.CONNECTED', statusHandler);
		$rootScope.$on('HardwareService.CONNECTING', statusHandler);
		$rootScope.$on('HardwareService.RECONNECTING', statusHandler);
		$rootScope.$on('HardwareService.DISCONNECTING', statusHandler);
		$rootScope.$on('HardwareService.DISCONNECTED', statusHandler);



		/*
		*		Private Methods
		*
		*/

		function statusHandler(event){

			$timeout(function(){
				switch(event.name){
					case 'HardwareService.CONNECTED':
						$scope.rightButtons = [{
						  type: 'button-icon icon ion-ios7-circle-filled',
					    tap: function(e) {
					      	HardwareService.disconnect();
								}
						}];
						$scope.connectIcon = true;
						$scope.connectIconDisable = true;
						$scope.connectTap = function(){ HardwareService.disconnect(); }
					break;
					case 'HardwareService.CONNECTING':
					case 'HardwareService.RECONNECTING':
						$scope.rightButtons = [{
						  type: 'button-icon icon ion-ios7-circle-filled disabled',
					    tap: function(e) {}
						}];
						$scope.connectIcon = true;
						$scope.connectIconDisable = false;
						$scope.connectTap = function(){}
					break;
					case 'HardwareService.DISCONNECTING':
						$scope.rightButtons = [{
						  type: 'button-icon icon ion-ios7-circle-outline disabled',
					    tap: function(e) {}
						}];
						$scope.connectIcon = false;
						$scope.connectIconDisable = false;
						$scope.connectTap = function(){}
					break;
					case 'HardwareService.DISCONNECTED':
						$scope.rightButtons = [{
						  type: 'button-icon icon ion-ios7-circle-outline',
					    tap: function(e) {
					      	HardwareService.connect();
								}
						}];
						$scope.connectIcon = false;
						$scope.connectIconDisable = true;
						$scope.connectTap = function(){ HardwareService.connect(); }
					break;
					default:
						$scope.rightButtons = [];
						$scope.connectIcon = false;
						$scope.connectIconDisable = true;
						$scope.connectTap = function(){}
					break;
				}
			});

		};




	});

'use strict';


angular.module('cbt')
	.controller('BuildsController', function ($scope, $state, $timeout, $ionicModal, BuildsService, FirmwareService){

		$scope.navTitle = "Firmware Update";
		$scope.title = "Firmware Update";




		$scope.builds = BuildsService.getSources();

		$scope.$watch(function(){
			return BuildsService.getSources();
		},
		function(newVal, oldVal){
			$scope.builds = newVal;
		});


		$scope.selectedBuild = '';
		$scope.$watch('selectedBuild', function(newVal, oldVal){
			console.info(arguments);
		});




		$scope.flashProgress = 0;
		$scope.flashComplete = false;

		$scope.showFlashModal = function(){

			$ionicModal.fromTemplateUrl('templates/modals/flash.html', {
		    scope: $scope,
		    animation: 'slide-in-up',
				backdropClickToClose: false,
				hardwareBackButtonClose: false
		  }).then(function(modal) {
		    $scope.modal = modal;
		    $scope.modal.show();
		  });
		  $scope.closeModal = function() {
		    $scope.modal.hide();
		  };
		  //Cleanup the modal when we're done with it!
		  $scope.$on('$destroy', function() {
		    $scope.modal.remove();
		  });
		  // Execute action on hide modal
		  $scope.$on('modal.hidden', function() {
		    // Execute action
		  });
		  // Execute action on remove modal
		  $scope.$on('modal.removed', function() {
		    // Execute action
		  });

		}

		$scope.flash = function( file ){
			$scope.showFlashModal();
			$timeout(function(){
				FirmwareService.send( BuildsService.rootPath + file );
			}, 2000);
		}

		$scope.$on('FirmwareService.FLASH_PROGRESS', function(event, data){

				$scope.flashProgress = Math.ceil(data * 100);

			console.log($scope.flashProgress);
		});

		$scope.$on('FirmwareService.FLASH_SUCCESS', function(event, data){
			$scope.flashComplete = true;
		});

		$scope.$on('FirmwareService.FLASH_ERROR', function(event, data){
			$scope.flashComplete = true;
		});




		/*
		*	Event Listeners
		*/

		$scope.$on('$destroy', function(){
    	HardwareService.search(false);
		});



	});

'use strict';


angular.module('cbt')
	.controller('ConnectionController', function ($scope, $state, $timeout, HardwareService, BluetoothService, SerialService, SettingsService) {

		$scope.navTitle = "Connect to your CANBus Triple";
		$scope.title = "Connect";


		$scope.rightButtons = [{
			type: 'button-icon icon ion-ios7-circle-filled',
			tap: function(e) {
					HardwareService.disconnect();
				}
		}];

		/*
		*	Init
		*/


		$scope.btDiscovered = BluetoothService.discovered;
		$scope.serialDiscovered = SerialService.discovered;

		//if( SettingsService.getAutoconnect() == "false" )
			$timeout(function(){
				HardwareService.search(true);
			}, 400);





		/*
		*	Methods
		*/

		$scope.deviceConnect = function( device ){
			SettingsService.setDevice(device);
			HardwareService.connect();
		}

		$scope.search = function(){
			HardwareService.search(true);
		}






		/*
		*	Event Listeners
		*/

		$scope.$on('HardwareService.CONNECTED',function(){
			$timeout(function(){
				$state.go('hardware.status');
			}, 1000);
		});

		$scope.$on('$destroy', function(){
    	HardwareService.search(false);
		});



	});

'use strict';  


angular.module('cbt')
	.controller('DashboardController', function ($scope, $location, MenuService) {
		
		$scope.navTitle = "Dashboard";
		$scope.title = "Dashboard";
		
		
		
		
	});
'use strict';


angular.module('cbt')
	.controller('DebugController', function ($scope, $timeout, FirmwareService, HardwareService, UtilsService) {

	  $scope.navTitle = "Debug";

		$scope.showCmdBtn();

	  $scope.sendTest = function(){

		  HardwareService.command( 'info' );

	  };

	  $scope.autobaud = function(){

			HardwareService.command( 'autobaud', [1] );

	  }

	  $scope.sendReset = function(){

		  HardwareService.reset();

	  }


	  $scope.debugString = '';

	  $scope.readHandler = function(data){
			$timeout( function(){ $scope.debugString += UtilsService.ab2str(data)+"\n"; }, 10);
		}

		$scope.$on('hardwareEvent', function(event, data){
			$timeout( function(){
				$scope.debugString += JSON.stringify(data)+"\n";
			});
		});


		HardwareService.registerReadHandler($scope.readHandler);

		$scope.$on("$destroy", function() {
    	HardwareService.deregisterReadHandler($scope.readHandler);
    });



});

'use strict';


angular.module('cbt')
	.controller('DiagController', function ($scope, $timeout, FirmwareService, HardwareService, UtilsService) {

	  $scope.navTitle = "Diagnostics";


});

'use strict';


angular.module('cbt')
	.controller('HWStatusController', function ($rootScope, $scope, $state, $http, $interval, $timeout, HardwareService) {

    $scope.navTitle = "Hardware";
		$scope.title = "Connect";

		var updateIndex = 0,
				updateFrequency = 500,
				commandMap = ['info', 'bus1status', 'bus2status', 'bus3status'],
				speeds = [10,20,50,83,100,125,250,500,800,1000];


		if( !$scope.hardwareConnected ) $state.go('hardware.connect');

		$scope.speeds = speeds;
		$scope.bus1speed = 1;
		$scope.bus2speed = 1;
		$scope.bus3speed = 1;

		$scope.autoBaud = function(bus){
			cleanup();
			HardwareService.command('autobaud', [parseInt(bus)]);
		}

		$scope.updateStatus = function(){

			if(!$scope.hardwareConnected) return;

			HardwareService.command( commandMap[updateIndex++] );
			updateIndex = updateIndex <= 3 ? updateIndex : 0;
		}

		var intPromise = $interval($scope.updateStatus, updateFrequency);
		function cleanup(){
			if(intPromise) $interval.cancel(intPromise);
		}

		$scope.$on('$destroy', function(){
			console.log("DESTROY DESTROY DESTROY DESTROY DESTROY DESTROY DESTROY ");
			cleanup();
		});



	});

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

		// MenuService.addPlugin('Kickstarter', 'ion-happy	', 'kickstarter');



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

'use strict';


angular.module('cbt')
	.controller('LoggerController', function ($scope, $state, $location, $timeout, $ionicPopover, HardwareService, UtilsService) {

		$scope.title = "CANBus Triple";
		$scope.navTitle = "Packet Logger";

		$scope.showCmdBtn();

	  $scope.viewPid = function(id){
	  	$scope.selectedPid = id;
		  $location.url('/pidfinder/view');
			// use $state
	  }


	  $scope.busSettings = {
		  can1log: false,
		  can2log: false,
		  can3log: false
	  }

	  $scope.$watchCollection(
	    "busSettings.can1log",
	    function( newValue, oldValue ) {
				if($scope.hardwareConnected) HardwareService.command('bus1log'+(newValue?'On':'Off'),[0,0,0,0]);
	    }
    );
		$scope.$watchCollection(
			"busSettings.can2log",
			function( newValue, oldValue ) {
				if($scope.hardwareConnected) HardwareService.command('bus2log'+(newValue?'On':'Off'),[0,0,0,0]);
			}
		);
		$scope.$watchCollection(
	    "busSettings.can3log",
	    function( newValue, oldValue ) {
				if($scope.hardwareConnected) HardwareService.command('bus3log'+(newValue?'On':'Off'),[0,0,0,0]);
	    }
    );

		$scope.$watchCollection(
	    "hardwareConnected",
	    function( newValue, oldValue ) {
				console.log(arguments);
	    }
    );


	  $scope.interestMids = [];
	  $scope.toggleIntrest = function(mid, event){

		  if( $scope.interestMids.indexOf(mid) > -1 ){
		  	$scope.interestMids.splice( $scope.interestMids.indexOf(mid), 1 );
		  	//event.target.parentElement.bgColor = '';
		  }else{
				$scope.interestMids.push(mid);
				//event.target.parentElement.bgColor = '#dbdbdb';
				}

			$timeout(function(){
				$scope.modeSwitchDisabled = !($scope.interestMids.length > 0);
				},5);

	  }
	  $scope.isInterested = function(mid){
		  if( $scope.interestMids.indexOf(mid) > -1 )
		  	return true;
	  }


	  $scope.modeSwitchDisabled = true;

	  $scope.viewMode = "Compact";
	  $scope.switchMode = function(event){

			switch($scope.viewMode){
				case 'Compact':
					$scope.viewMode = "Chronological";
				break;
				case 'Chronological':
					$scope.viewMode = "Compact";
				break;
			}

			$scope.clearBuffer();

	  }




	  $scope.midBuffer = [];
	  $scope.clearBuffer = function(){
		  $scope.midBuffer.splice(0, $scope.midBuffer.length);
	  }


	  $scope.numberToHexString = function(n){
	  	if(typeof n == 'undefined')return 'null';
		  return n.toString(16).toUpperCase();
	  }

		$scope.readHandler = function(packet){

			// Cron mode
			if( $scope.viewMode === "Chronological" ){

				if( $scope.interestMids.indexOf(packet.messageId) > -1 )
					$scope.midBuffer.unshift({mid: packet.messageId, packet: packet});

				$timeout(function(){}, 1);

				return;
			}

			// Compact mode

			var obj = _.find($scope.midBuffer, function(obj){ return obj.mid == packet.messageId });

			if( obj )
				obj['packet'] = packet;
			else
				$scope.midBuffer.unshift({mid: packet.messageId, packet: packet});


			$timeout(function(){}, 1);


		}

		HardwareService.registerPacketHandler($scope.readHandler);
		$scope.$on("$destroy", function() {
    	HardwareService.deregisterPacketHandler($scope.readHandler);
    });



	  $ionicPopover.fromTemplateUrl('popover.html', {
	    scope: $scope,
	  }).then(function(popover) {
	    $scope.popover = popover;
	  });
	  $scope.openPopover = function($event) {
	    $scope.popover.show($event);
	  };
	  $scope.closePopover = function() {
	    $scope.popover.hide();
	  };
	  //Cleanup the popover when we're done with it!
	  $scope.$on('$destroy', function() {
	    $scope.popover.remove();
	  });
	  // Execute action on hide popover
	  $scope.$on('popover.hidden', function() {
	    // Execute action
	  });
	  // Execute action on remove popover
	  $scope.$on('popover.removed', function() {
	    // Execute action
	  });


	});

'use strict';


angular.module('cbt')
	.controller('MenuController', function ($scope, $location, MenuService) {

		$scope.title = "CANBus Triple";

		$scope.list = MenuService.all();

		$scope.goTo = function(page) {
		  $location.url('/' + page);
		  $scope.cbtSideMenu.hide();
		};


		$scope.$on('SettingsService.CHANGE', function(event, name){

			switch(name){
				case 'debugMode':
					$scope.list = MenuService.all();
				break;
			}

		});
		
		$scope.listPlugins = MenuService.allPlugins();


		


	});

'use strict';


angular.module('cbt')
	.controller('PIDViewController', function ($scope, $location) {

		$scope.title = "CANBus Triple";
		
		$scope.navTitle = "PID View";
		
		console.log("YUP");
		
		
	  		
		
	});

'use strict';


angular.module('cbt')
	.controller('SettingsController', function ($scope, $location, SettingsService) {

		$scope.navTitle = "Settings";
		$scope.title = "Settings";

		$scope.itemToggle = function(index){
			return $scope.settingsList[index].checked === true;
		}

		$scope.settingsList = [
							{
								name: 'Autoconnect',
								text: 'Autoconnect to last device',
								checked: SettingsService.getAutoconnect() === "true",
								setter: SettingsService.setAutoconnect
							},
							{
								name: 'debugMode',
								text: 'Show developer options',
								checked: SettingsService.getDebugMode() === "true",
								setter: SettingsService.setDebugMode
							}
						];



	});

'use strict';


angular.module('cbt')

	.run(function($templateCache, MenuService){

		/*
	  *	Template
	  */

	  $templateCache.put('templates/plugins/volkswagen.html', '<ion-view title="{{navTitle}}" hide-back-button="true" left-buttons="leftButtons" right-buttons="rightButtons" hide-back-button="true">'+
												'	<ion-nav-buttons side="left">'+
												'    <button class="button" ng-click="showSendCommandModal()">Serial Command</button>'+
												'  </ion-nav-buttons>'+
												'	<ion-content padding="true">'+
												'		<button class="button button-positive" ng-click="windowUp()">Driver Window Up</button>'+
												'		<button class="button button-positive" ng-click="windowDown()">Driver Window Down</button>'+
												'		<button class="button button-positive" ng-click="windowUpBack()">Driver Rear Window Up</button>'+
												'		<button class="button button-positive" ng-click="windowDownBack()">Driver Rear Window Down</button>'+
												'		<button class="button button-positive" ng-click="bothUp()">Both Windows Up</button>'+
												'	</ion-content>'+
												'</ion-view>');


		/*
		*	Add to Menu
		*/

		// MenuService.addPlugin('Volkswagen', 'ion-model-s', 'vw');



	})

	.config(function($stateProvider){

		/*
		*	Add Route
		*/

		$stateProvider.state('vw', {
			url: '/vw',
			controller: 'VWController',
			templateUrl: 'templates/plugins/volkswagen.html'
    });

	})

	.controller('VWController', function ($scope, $interval, HardwareService) {

	  $scope.navTitle = "VW";


	  $scope.windowDown = function(){
		  HardwareService.send( String.fromCharCode(0x02, 0x02, 0x01, 0x81, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02 ) );
	  }

	  $scope.windowUp = function(){
		  HardwareService.send( String.fromCharCode(0x02, 0x02, 0x01, 0x81, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02 ) );
	  }


	  $scope.windowDownBack = function(){
		  HardwareService.send( String.fromCharCode(0x02, 0x02, 0x01, 0x81, 0x00, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02 ) );
	  }

	  $scope.windowUpBack = function(){
		  HardwareService.send( String.fromCharCode(0x02, 0x02, 0x01, 0x81, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02 ) );
	  }

	  $scope.bothUp = function(){
		  HardwareService.send( String.fromCharCode(0x02, 0x02, 0x01, 0x81, 0x02, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02 ) );
	  }


	  $scope.lock = function(){
		  HardwareService.send( String.fromCharCode(0x02, 0x02, 0x03, 0x91, 0x00, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03 ) );
	  }

	  $scope.unlock = function(){
		  HardwareService.send( String.fromCharCode(0x02, 0x02, 0x03, 0x91, 0x00, 0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03 ) );
	  }



	});


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
    		// controller.updateState();
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

'use strict';

/*
*		Derek K etx313@gmail.com
*		Display a selectable list of CANBus hardware discovered
*	
*/


angular.module('cbt')
.directive('deviceList', function($timeout, HardwareService){
	
  return {
    restrict: 'EA',
    scope: {
	    deviceConnect: '=',
	    btDiscovered: '=',
	    serialDiscovered: '=',
    },
    controller: function deviceListController($scope, BluetoothService, SerialService){
	    
	    $scope.found = function(){
			  if( Object.keys($scope.btDiscovered).length > 0 || Object.keys($scope.serialDiscovered).length > 0 )
		    	return true;
			}
	    
    },
    template: '<div class="list card height-animation" ng-show="found()">'+
	    	'<a class="item item-icon-left" ng-repeat="device in btDiscovered" ng-click="deviceConnect(device)"><i class="icon ion-bluetooth"></i>{{device.name}}</a>'+
				'<a class="item item-icon-left" ng-repeat="device in serialDiscovered" ng-click="deviceConnect(device)"><i class="icon ion-usb"></i>{{device.name}}</a>'+
	    '</div>',
    link: function($scope){
	    
	    // $scope.$on('$destroy', function() {});
			
    },
    replace: true
  };
});

'use strict';

/*
*		Derek K etx313@gmail.com
*		Display a selectable list of CANBus hardware discovered
*	
*/


angular.module('cbt')
.directive('gauge', function($compile, $timeout, HardwareService){
	
	var el;
	
	var updateTimeout;
	
	var displayTemplate = '<div class=""><h3>{{name}}</h3><h1>{{gaugeValue}}</h1>';
  /*
  var radialTemplate = '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="256px" height="128px" viewBox="0 0 256 128" enable-background="new 0 0 256 128" xml:space="preserve">'+
'<g id="gaugeValue">'+
	'<defs>'+
		'<path id="SVGID_1_" d="M248.75,124.25h-33c0-48.386-39.364-87.75-87.75-87.75s-87.75,39.364-87.75,87.75h-33 C7.25,57.668,61.418,3.5,128,3.5S248.75,57.668,248.75,124.25z"/>'+
	'</defs>'+
	'<clipPath id="SVGID_2_">'+
		'<use xlink:href="#SVGID_1_"  overflow="visible"/>'+
	'</clipPath>'+
	'<g clip-path="url(#SVGID_2_)">'+
		'<path fill="#D31F3F" d="M128,246.5c-67.409,0-122.25-54.841-122.25-122.25C5.75,56.841,60.591,2,128,2v36 c-47.559,0-86.25,38.691-86.25,86.25S80.441,210.5,128,210.5V246.5z"/>'+
		'<path fill="none" d="M128,20c57.576,0,104.25,46.674,104.25,104.25S185.576,228.5,128,228.5"/>'+
	'</g>'+
'</g>'+
'<rect x="55.667" y="95.917" fill="none" width="144.667" height="28.333"/>'+
'<text id="gaugeTextValue" text-anchor="start" transform="matrix(1 0 0 1 118.7663 121.4759)" font-family="Helvetica" font-size="36">{{gaugeValue}}</text>'+
'</svg>';
*/

	var radialTemplate = '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="512px" height="512px" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve">'+
'<path id="valuePath" fill="none" stroke="{{color}}" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M404.157,378.13C431.546,344.941,448,302.392,448,256c0-106.039-85.961-192-192-192S64,149.961,64,256 c0,46.052,16.213,88.317,43.243,121.399" stroke-dasharray="900 900" stroke-dashoffset="{{gaugeValue}}"/>'+
'<rect x="84" y="227" fill="none" width="344" height="68"/>'+
'<text id="gaugeValue" transform="matrix(1 0 0 1 179.4502 271.1953)" font-family="RobotoCondensed-Bold" font-size="58">{{gaugeValue}}</text>'+
'<rect x="84" y="349" fill="none" width="344" height="68"/>'+
'<text id="gaugeName" transform="matrix(1 0 0 1 187.125 393.1953)" font-family="RobotoCondensed-Bold" font-size="58">{{name}}</text>'+
'</svg>';


  var getTemplate = function(contentType) {
  
    switch(contentType) {
      case 'display':
        return displayTemplate;
        break;
      case 'radial':
        return radialTemplate;
        break;
    }

  }

  var linker = function(scope, element, attrs) {
  	el = element;
		element.html(getTemplate(scope.style));
		$compile(element.contents())(scope);
  }
	    	
	
  return {
    restrict: 'E',
    scope: {
    	id: "@id", // kill
    	txd: "@txd",
    	rxf: "@rxf",
    	rxd: "@rxd",
    	math: "@mth",
    	name: "@name",
    	style: "@gaugeStyle",
    	color: "@color",
    },
    controller: function gaugeController($scope){
    	
    	$scope.gaugeValue = "0";
    	
    	
    	// Init XGauge processor
    	var xgauge = new XGauge( $scope.txd, $scope.rxf, $scope.rxd, $scope.math, $scope.name );
    	
    	
    	
    	function processRadial(){				
				
			}
			
			function processDisplay(){
				
			}
    
	    
	    
	    
	    $scope.packetHandler = function(packet){
				
				
				var value = xgauge.processPacket(packet);
				
				if( value == false ) return;
				
				$scope.gaugeValue = value;
				
				
				switch($scope.style){
					case 'radial':
						processRadial();
					break;
					default:
					case 'display':
						processDisplay();
					break;
				}
				
				if( updateTimeout )
					$timeout.cancel(updateTimeout);
				updateTimeout = $timeout(function(){}, 50);
				
			}
			
			
			
			
		
			// Packet Listener Setup
			HardwareService.registerPacketHandler($scope.packetHandler);
			$scope.$on("$destroy", function() {
	    	HardwareService.deregisterPacketHandler($scope.packetHandler);	
	    });

	    
    },
    // template: '',
    link: linker,
    replace: true
  };
});

'use strict';

angular.module('cbt')
	.factory('BluetoothService', function($rootScope, $timeout, $q, UtilsService) {
		
		
				
		var deviceInfo = {
			name: 'CANBus Triple',
			services: {
				serial: {
					serviceHandle: 0,
					characteristicHandle: 0,
					clientConfigHandle: 0,
					serviceUUID: '7a1fb359-735c-4983-8082-bdd7674c74d2',
					// characteristicUUID: 'b0d6c9fe-e38a-4d31-9272-b8b3e93d8658' // Notifcation Charateristic
					characteristicUUID: 'b0d6c9fe-e38a-4d31-9272-b8b3e93d8657' // Indication Charateristic
				},
				wakeup: {
					serviceHandle: 0,
					characteristicHandle: 0,
					serviceUUID: '35e71686-b1c3-45e7-9da6-1ca2393a41f3',
					characteristicUUID: '5fcd52b7-4cfb-4095-aeb2-5c5511646bbe'
				}
			}
		}
		
		var specUUIDs = {
			clientConfiguration: "00002902-0000-1000-8000-00805f9b34fb"
		};
		
		var scanSeconds = 10,
				connected = 0,		// Holds BLE Device handle
				discovered = {};
		
		var recieveBuffer,
				recieveBufferIndex = 0;
				
		var rawCallback;
		

		
		/*
		*
		*/
		function scan(sw){
			
			if(!sw){
				evothings.ble.stopScan();
				$rootScope.$broadcast('BluetoothService.SCAN_COMPLETE');
				return;
			}
			
			clearDiscovered();
			
			$rootScope.$broadcast('BluetoothService.SCAN_START');
			
			evothings.ble.startScan(
				function(device)
				{
					$timeout(function(){
						discovered[device.address] = device;
					});
				},
				function(errorCode)
				{
					$rootScope.$broadcast('BluetoothService.SCAN_ERROR');
				}
			);

			// Set timeout timer to cancel the scanning
			$timeout( scan, scanSeconds*1000);
			
			
			
		}
	
		
		
		/*
		*
		*/
		var connectDeferred;
		function connect(device){
			
			scan(false);
			
			connectDeferred = $q.defer();
			
			$rootScope.$broadcast('BluetoothService.CONNECTING');
			evothings.ble.connect(
				device.address,
				connectSuccessCallback,
				connectErrorCallback );

			return connectDeferred.promise;
			
		}
		
		
				
		
		
		
		/*
		*	Callbacks used by connect
		*/
		function connectErrorCallback(errorCode){
			$rootScope.$broadcast('BluetoothService.CONNECT_ERROR');
			connectDeferred.reject(errorCode);
		}
		
		function connectSuccessCallback( info ){
			
			console.log('BLE connect status for device: '
			+ info.deviceHandle
			+ ' state: '
			+ info.state, evothings.ble.connectionState[info.state] );
			
			
			switch(evothings.ble.connectionState[info.state]){
				case 'STATE_CONNECTED':
					connectDeferred.resolve();
					$rootScope.$broadcast('BluetoothService.CONNECTED');
					connected = info.deviceHandle;
				break;
				case 'STATE_DISCONNECTED':
					connectDeferred.resolve();
					connected = false;
					$rootScope.$broadcast('BluetoothService.DISCONNECTED');
				break;
		
				}
				
		}
		
		
		
		
		
		
		
		/*
		*
		*/
		function disconnect(){
			
			var deferred = $q.defer();
			
			$timeout(function(){
				deferred.resolve();
			}, 5);
			
			console.log("disconnect ", connected);
			evothings.ble.close(connected);
			$rootScope.$broadcast('BluetoothService.DISCONNECTED');
			
			return deferred.promise;
			
		};
		
		
		
		/*
		*		Characteristics Discovery
		*/
		function characteristics(){
			
			var deferred = $q.defer();
			var last = false;
			var keys = 0;
			
			var process = function(characteristics)
				{
					for(var i = 0; i < characteristics.length; i++)
						for( var srv in deviceInfo.services )
							if( characteristics[i].uuid == deviceInfo.services[srv].characteristicUUID )
								deviceInfo.services[srv].characteristicHandle = characteristics[i].handle;
						
					if(last) deferred.resolve(characteristics);
					
				}
			
			for( var service in deviceInfo.services ){
				
				keys++;
				
				if( Object.keys(deviceInfo.services).length == keys ) last = true;
				
				evothings.ble.characteristics(
					connected,
					deviceInfo.services[service].serviceHandle,
					process,
					function(errorCode)
					{
						$rootScope.$broadcast('BluetoothService.CHARATERISTICS_DISCOVERY_ERROR', errorCode);
						deferred.reject();
					});
			}
			
			return deferred.promise;
			
		}

		
		/*
		*		Service Discovery
		*/
		function discover(){
			
			var deferred = $q.defer();
			
			evothings.ble.services(
				connected,
				function(services)
				{
					for(var i = 0; i < services.length; i++)
					//if( services[i].uuid == deviceInfo.serial.serviceUUID ) deviceInfo.serial.serviceHandle = services[i].handle;
						for( var srv in deviceInfo.services )
							if( services[i].uuid == deviceInfo.services[srv].serviceUUID )
								deviceInfo.services[srv].serviceHandle = services[i].handle;
					
					deferred.resolve(services);
				},
				function(errorCode)
				{
					$rootScope.$broadcast('BluetoothService.SERVICES_ERROR', errorCode);
					deferred.reject(errorCode);
				}
			);
			
			return deferred.promise;
			
		}
		
		/*
		*		Discover Descriptors
		*/
		function descriptors(){
			
			var deferred = $q.defer();
		
			evothings.ble.descriptors(
				connected,
				deviceInfo.services.serial.characteristicHandle,
				function(descriptors)
				{
					console.log('BLE descriptors: ',descriptors); 
					
					for (var i = 0; i < descriptors.length; i++)
						if( descriptors[i].uuid == specUUIDs.clientConfiguration )
							deviceInfo.services.serial.clientConfigHandle = descriptors[i].handle;
					
					deferred.resolve(descriptors);
				},
				function(errorCode)
				{
					console.log('BLE descriptors error: ' + errorCode);
					deferred.reject(errorCode);
				});
				
				return deferred.promise;
		}
		
		
		/*
		*		Subscribe to charateristic
		*/
		function subscribeToSerial(callback){
			
			var deferred = $q.defer();
			
			$rootScope.$broadcast('BluetoothService.SUBSCRIBE');
			
			recieveBuffer = new Uint8Array(512);
			
			evothings.ble.enableNotification(
				connected,
				deviceInfo.services.serial.characteristicHandle,
				function(dataBuffer)
				{
					
					// Send raw first
					if(typeof rawCallback == "function") rawCallback(dataBuffer);
					
					
					// Read line for \r\n
					
					var dataBufferView = new Uint8Array(dataBuffer);
					
					recieveBuffer.set( dataBufferView, recieveBufferIndex );
					recieveBufferIndex += dataBuffer.byteLength;
					
					
					for( var end=0; end<recieveBufferIndex; end++ ){
						if( recieveBuffer[end] === 0x0D /* && recieveBuffer[end+1] === 0x0A  */) break;
					}
					
					// Dispatch slice before end of line, if end index was less than the incoming data length
					if( end > 0 && end < recieveBufferIndex ){
						
						var data = recieveBuffer.subarray(0, end);
						
						recieveBufferIndex -= end;
						recieveBuffer.set( recieveBuffer.subarray( end, recieveBufferIndex ) );
						
						if(callback instanceof Function)
								callback(data);
						
						deferred.resolve(data);
						
					}else{
						deferred.resolve();
					}
					
					
						
				},
				function(errorCode)
				{
					$rootScope.$broadcast('BluetoothService.SUBSCRIBE_ERROR', errorCode );
					deferred.reject(errorCode);
				}
			);			
			
			return deferred.promise;
			
		}

		function unsubscribeFromSerial(){
			
			var deferred = $q.defer();
			
			evothings.ble.disableNotification(
				connected,
				deviceInfo.services.serial.characteristicHandle,
				function()
				{
					$rootScope.$broadcast('BluetoothService.UNSUBSCRIBE' );
					deferred.resolve();
				},
				function(errorCode)
				{
					$rootScope.$broadcast('BluetoothService.UNSUBSCRIBE_ERROR', errorCode );
					deferred.reject(errorCode);
				});
			
			return deferred.promise;
			
		}
		
		
		
		/* 
		*		Write Descriptor
		*/
		function writeDescriptor(data){
			
			var deferred = $q.defer();
			
			if(typeof data == 'string')
				data = new Uint8View( UtilsService.str2ab( data ) );
			
			/*
			if(data instanceof Uint8Array)
				data = data.buffer;
				*/
			
			console.log(data)
			evothings.ble.writeDescriptor(
				connected,
				deviceInfo.services.serial.clientConfigHandle,
				data,
				function(data)
				{
					console.log( 'BLE Write descriptor: ', arguments );
					deferred.resolve(data);
				},
				function(errorCode)
				{
					console.log('BLE writeDescriptor error: ' + errorCode);
					deferred.reject(errorCode);
				});
			
			return deferred.promise;
			
		}
		
		
		
		
		/* 
		*		Read Descriptor
		*/
		function readDescriptor(){
			
			var deferred = $q.defer();
			
			evothings.ble.readDescriptor(
				deviceHandle,
				deviceInfo.services.serial.descriptorHandle,
				function(data)
				{
					console.log('BLE descriptor data: ' + evothings.ble.fromUtf8(data));
					deferred.resolve(data);
				},
				function(errorCode)
				{
					console.log('BLE readDescriptor error: ' + errorCode);
					deferred.reject(errorCode);
				});
				
			
			return deferred.promise;
			
		}
		
		
		
		
		
		/*
		*		Write indication setting to client configuration descriptor
		*/
		function writeSerialIndicationDescriptor(){
			
			var b = new ArrayBuffer(2);
			var view = new Uint8Array(b);
			view[0] = 0x02;
			view[1] = 0x00;
			
			return writeDescriptor( view );
			
		}
		
		function writeSerialNotificationDescriptor(){
			
			var b = new ArrayBuffer(2);
			var view = new Uint8Array(b);
			view[0] = 0x01;
			view[1] = 0x00;
			
			return writeDescriptor( view );
			
		}
		
		
		
		
		/* 
		*	Manual Read 
		*/
		function read(){
		
			var deferred = $q.defer();
			
			evothings.ble.readCharacteristic(
				connected,
				deviceInfo.services.serial.characteristicHandle,
				function(data)
				{
					// console.log('BLE characteristic data: ' + evothings.ble.fromUtf8(data));
					console.log('BLE characteristic data: ', UtilsService.ab2str(data));
					deferred.resolve(data);
				},
				function(errorCode)
				{
					console.log('BLE readCharacteristic error: ' + errorCode);
					deferred.reject(errorCode);
				});
			
			return deferred.promise;
			
		}
		
		window.read = read;
		
		/*
		*	Write to serial service
		*/
		function write(data){
			
			var deferred = $q.defer();
			
			if(typeof data == 'string')
				data = UtilsService.str2ab( data );
				
			if(data instanceof ArrayBuffer)
				data = new Uint8Array(data);
				
			if( !(data instanceof Uint8Array) ){
				console.log("write requires String, ArrayBuffer, or Uint8Array");
				return;
			}
			
			console.log( "Write: ", data );
			
			evothings.ble.writeCharacteristic(
				connected,
				deviceInfo.services.serial.characteristicHandle,
				data,
				function(data)
				{
					console.log( arguments );
					deferred.resolve(data);
				},
				function(errorCode)
				{
					console.log('BLE writeCharacteristic error: ' + errorCode);
					deferred.reject(errorCode);
				});
			
			return deferred.promise;
			
		}
		
		window.write = write;
		
		

		/*
		*	Write to wakeup service to wakeup the MCU
		*/
		function wakeup(){
			
			var deferred = $q.defer();
			
			
			var resetCommand = new Uint8Array(new ArrayBuffer(1));
			resetCommand[0] = 0x01;
			
			evothings.ble.writeCharacteristic(
				connected,
				deviceInfo.services.wakeup.characteristicHandle,
				resetCommand,
				function()
				{
					$timeout(function(){$rootScope.$broadcast('BluetoothService.RESET');}, 500);
					deferred.resolve();
				},
				function(errorCode)
				{
					deferred.reject(errorCode);
				});
			
			return deferred.promise;
			
		}
		
		
		
		
		/*
		*	Clears discovered object without destroying ng bindings
		*/
		function clearDiscovered(){
			for(var k in discovered){
				console.log(discovered[k]);
				delete discovered[k];
			}
		}
		
		
		
		
		
		/*
		*	External Interface
		*/
	  return {
	    scan: function(sw){
		    scan(sw);
	    },
	    connect: function(device, readHandler, rawCb){
	    	
	    	rawCallback = rawCb;
	    	
	  		connect(device)
	  			.then(discover)
	  			.then(characteristics)
	  			.then(descriptors)
	  			// .then(writeSerialNotificationDescriptor)
	  			.then(writeSerialIndicationDescriptor)
	  			.then(function(){
  								subscribeToSerial(readHandler);
  								});
					
	    },
	    disconnect: function(){
	    	disconnect();
		    // unsubscribeFromSerial().then(disconnect);
	    },
	    setDevice: function(i){ device = discovered[i] },
	    
	    discovered: discovered,
	    write: function(data){
				write(data);
	    },
	    read: function(){
		    
	    },
	    wakeup: function(){
		    wakeup();
	    }
	    
	  }
	  
	});
	
	

'use strict';

angular.module('cbt')
	.factory('BuildsService', function($rootScope, $timeout, $http, HardwareService){

    // https://raw.githubusercontent.com/CANBus-Triple/CANBus-Triple/master/builds/builds.json
    var rootPath = 'https://raw.githubusercontent.com/CANBus-Triple/CANBus-Triple/master/builds/',
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

'use strict';

/*
*		A FSM for uploading firmware to the CBT via the HardwareService
*/

angular.module('cbt')
	.factory('FirmwareService', function($rootScope, $q, $http, $timeout, HardwareService, UtilsService){

		var pageSize = 128,
				sendMaxBytes = 16,
				okCommand = 0x0D,
				errorCommand = 0x3F,
				hexSendIndex = 0,
				lastState = '',
				state = '',
				errorCount = 0,
				opTimeoutTime = 10000,
				opTimeout,
				sendDataDelay = 5,
				hex;



		/*
		*	State Machine States
		*/
		var states = {

			reset:{ enter: function(){

								hexSendIndex = 0;
								errorCount = 0;

								var oneShot;
								oneShot = $rootScope.$on('HardwareService.RESET', function(){ oneShot(); gotoState('getDevice'); });

								resetTimeout();
								HardwareService.reset();

							},
							update: function(data){
							}
			},
			getDevice:{ 	enter: function(data){
											resetTimeout();
											HardwareService.send( 'S' );
										},
										update: function(data){
											if( data && data.buffer && UtilsService.ab2str(data.buffer) == "CANBusT" ){
												gotoState('getPageSize');
											}else if( data[0] == errorCommand ){
												$timeout(function(){
													HardwareService.send( 'S' );
												}, 500);
											}

										}
			},
			getPageSize:{	 enter: function(){
											 HardwareService.send( 'b' );
										 },
										 update:function(data){
											 pageSize = (data[1] >> 8)+(data[2] & 0xFF);
											 console.log('pageSize set to', pageSize);
											 gotoState('setPmode');
										 }
										},
			setPmode:{		enter: function(){
											resetTimeout();
											HardwareService.send( 'P' );
										},
										 update:function(data){

											if(data[0] == okCommand)
												gotoState('setAddress');
											else if(data[0] == errorCommand)
												$rootScope.$broadcast('FirmwareService.FLASH_ERROR', 'Set program mode failed');

										 }
										},
			setAddress:{		enter: function(){
												resetTimeout();
												// Set start address
												HardwareService.send( String.fromCharCode( 0x41, (hex.startAddress >> 8), (hex.startAddress & 0xFF) ) );
										 },
										 update:function(data){
											 if(data[0] == okCommand){
												 gotoState('sendFlash');
											 } else if(data[0] == errorCommand)
											 		$rootScope.$broadcast('FirmwareService.FLASH_ERROR', 'Set addressfailed');
										 }
										},
			sendFlash:{ 	enter: function(){
											resetTimeout();
											sendNextFlashPage();
										 },
										 update:function(data){

										 	if(data[0] == okCommand && hex.length > hexSendIndex ){

											 	$rootScope.$broadcast('FirmwareService.FLASH_PROGRESS', hexSendIndex/hex.length );

											 	resetTimeout();

										 		$timeout(function(){
										 			sendNextFlashPage();
										 			}, sendDataDelay );

											 	} else if(data[0] == errorCommand){

											 		errorCount++;
											 		if( errorCount >= 3 )
											 			$rootScope.$broadcast('FirmwareService.FLASH_ERROR', 'Send flash page failed');
											 		else
												 		$timeout(function(){ sendNextFlashPage(); }, 1000);

												 	resetTimeout();

											 	} else if(data[0] == okCommand)
											 		gotoState('finish');
											 	else
											 		$rootScope.$broadcast('FirmwareService.FLASH_ERROR', 'Unknown Error');

										 }
										},
			verify:{			enter: function(){

										 },
										 update:function(data){

										 }
										},
			finish:{      enter: function(){
											// SEND L then send E to finish up
											HardwareService.send( 'L' );
									  },
									  update:function(data){
									  	resetTimeout(true);
									  	HardwareService.send( 'E' );
										  HardwareService.deregisterRawHandler( readHandler );
										  $rootScope.$broadcast('FirmwareService.FLASH_SUCCESS');
									  }
									 },
			wait:{			enter: function(){

										 },
										 update:function(data){

										 }
										}
		};



		/*
		*	Reset timeout after a successful call to hardware.
		*	@param {Boolean} off Switch to cancel the timeout timer, true to clear
		*/
		function resetTimeout(off){

			if( opTimeout != null ) $timeout.cancel(opTimeout);

			if( off != true )
				opTimeout = $timeout(function(){
					$rootScope.$broadcast('FirmwareService.FLASH_TIMEOUT');
					HardwareService.deregisterRawHandler( readHandler );
					gotoState('wait');
				}, opTimeoutTime );

		}




		/*
		*	Send 128 bit data page to the hardware
		*/
		function sendNextFlashPage(){

			var i = 0,
				lines = 0,
				pageLength = 0;

			// console.log("sendNextFlashPage", hexSendIndex, hex.length);

			// Calculate length of the page we're about to send
			pageLength = (hex.length - hexSendIndex) > pageSize ? pageSize : hex.length - hexSendIndex ;


			// B (Write Command), 16 bit length, F (for flash E for eeprom) then Data
			var pageArray = new Uint8Array(4);
			pageArray[0] = 0x42; // B
			pageArray[1] = pageLength >> 8;
			pageArray[2] = pageLength & 0xFF;
			pageArray[3] = 0x46; // F

			HardwareService.send( pageArray ).then(function(){});


			var page, bytesSent = 0;
			for( i=0; bytesSent < pageLength; i++){

				page = new Uint8Array(hex.slice(hexSendIndex, hexSendIndex+pageLength));

				if( page.length < 1 )
					break;

				if( sendMaxBytes >= page.length ){
					// Send all bytes at once
					HardwareService.send( page );
				}else{
					// Send bytes in smaller chunks
					for(var ii=0; ii*sendMaxBytes < page.length; ii++){
						var sub = page.buffer.slice(ii*sendMaxBytes, (ii*sendMaxBytes)+sendMaxBytes );
						$timeout((function(s){return function(){ HardwareService.send(s); }})(sub), sendDataDelay*ii );

					}
				}

				bytesSent += page.length;

			}

			hexSendIndex += pageLength;

		}




		/*
		*	Send State Machine to specified state
		*	@param {String} s
		*/
		function gotoState(s){
			state = s;
			machineRun();
		}

		function startMachine(){
			lastState = '';
			state = 'reset';
			machineRun();
		}




		/*
		*	State Machine run tick with optional data object (Usually data returned from the hardware device)
		*	@param {Object} data
		*/
		function machineRun(data){

			var statePhase;
			if( state == lastState )
				statePhase = 'update';
			else {
				statePhase = 'enter';
				lastState = state;
			}

			// console.log('Machine running state', state, statePhase, data);
			states[state][statePhase](data);
		}




		/*
		*	Load Hex file for parsing into ArrayBuffer
		*/
		function fetchFirmware(){

			var deferred = $q.defer();

			$http({method: 'GET', url: 'https://raw.githubusercontent.com/CANBus-Triple/CANBus-Triple/master/builds/CANBusTriple.cpp.hex'}).
		    success(function(data, status, headers, config) {
				deferred.resolve(data);
		    }).
		    error(function(data, status, headers, config) {
		     	deferred.reject(status);
		    });

			return deferred.promise;
		}









		/*
		*	Callback registered with HardwareService to handle responses from the hardware device
		*	@param {String} data
		*/
		function readHandler(data){
			// console.log('FirmwareService readHandler', new Uint8Array(data));
			console.log('FirmwareService readHandler', UtilsService.byteArrayToString(new Uint8Array(data)));
			machineRun(new Uint8Array(data));
		}






		/*
		*	Send firmware to Hardware.
		* Registers a read callback with the HwardwareService, Resets hardware to Bootloader, then parses hex and sends it.
		*/
		function send(){

			fetchFirmware()
				.then( function(d){
					HardwareService.registerRawHandler( readHandler );
					hex = new IntelHex( d );
					startMachine();
					})
				.catch(function (error){
					$rootScope.$broadcast('FirmwareService.HEX_ERROR', error);
				});

		}





		return {
			send: function(n){ send(n) },
		};

	});

'use strict';

/*
*		Derek K etx313@gmail.com
*		HardwareService manages Bluetooth LE and Serial Connections into a common API
*
*/

angular.module('cbt')
	.factory('HardwareService', function( $rootScope, $q, $timeout, SettingsService, SerialService, BluetoothService, UtilsService ) {

		var connectionMode = null,
				readHandlers = [],
				rawHandlers = [],
				packetHandlers = [],
				ConnectionMode = {
					USB:'usb',
					BT:'bt'
				};

		var debugString = {data:''};

		var commands = {
			'info':[0x01, 0x01],
			'bus1status':[0x01, 0x10, 0x01],
			'bus2status':[0x01, 0x10, 0x02],
			'bus3status':[0x01, 0x10, 0x03],
			'bus1logOn': [0x03, 0x01, 0x01],
			'bus2logOn': [0x03, 0x02, 0x01],
			'bus3logOn': [0x03, 0x03, 0x01],
			'bus1logOff': [0x03, 0x01, 0x00],
			'bus2logOff': [0x03, 0x02, 0x00],
			'bus3logOff': [0x03, 0x03, 0x00],
			'autobaud': [0x01, 0x08],
		};





		/*
		*	Enable/Disable hardware search
		*	@param {Boolean} b
		*/
		function searchForDevices(b){

			if(b){

				// Disconnect if connected
				/*
				if(connectionMode)
					disconnect();
					*/

				if(typeof process == 'undefined')
					BluetoothService.scan(true);

				if(window.device && window.device.platform == 'Android' || typeof process != 'undefined' )
					SerialService.search(true);

			}else{

				if(typeof process == 'undefined')
					BluetoothService.scan(false);

				if(window.device && window.device.platform == 'Android' || typeof process != 'undefined' )
					SerialService.search(false);
			}

		}


		/*
		*	Connect to a device
		*	@param {?} ?
		*/
		function connect(){
			/*
			*		Get selected device from Local storage and connect
			*/
			var device = SettingsService.getDevice();

			if(device.address == 'serial')
				SerialService.open(device, readHandler, rawHandler).then(function(){
					command( 'info' );
				});
			else
				BluetoothService.connect(device, readHandler, rawHandler);

		}

		/*
		*	Disconnect from a device
		*/
		function disconnect(){

			switch(connectionMode){
				case ConnectionMode.BT:
					BluetoothService.disconnect();
				break;
				case ConnectionMode.USB:
					SerialService.close();
				break;
			}

		}


		/*
		*	Write to connected service
		*/
		function write(data){

			switch(connectionMode){
				case null:
					console.log("HardwareService cannot write, not connected");
					return;
				case ConnectionMode.BT:
					return BluetoothService.write(data);
				break;
				case ConnectionMode.USB:
					return SerialService.write(data);
				break;
			}


		}


		/*
		*	Send a CBT command with additional data
		*/
		function command(name, props){

			if( commands[name] )
				write( props ? commands[name].concat(props) : commands[name]  );
			else
				throw new Error( 'HardwareService Command not found '+name );
		}


		/*
		*	Register a callback to be called when we recieve read line data
		*/
		function registerReadHandler( callback ){
			if( !(callback instanceof Function) ) return;

			if( readHandlers.indexOf(callback) < 1 )
				readHandlers.push(callback);
		}

		function deregisterReadHandler( callback ){
			readHandlers.splice(readHandlers.indexOf(callback), 1);
		}



		/*
		*	Register a callback to be called when we recieve raw data
		*/
		function registerRawHandler( callback ){
			if( !(callback instanceof Function) ) return;

			if( readHandlers.indexOf(callback) < 1 )
				rawHandlers.push(callback);
		}

		function deregisterRawHandler( callback ){
			rawHandlers.splice(rawHandlers.indexOf(callback), 1);
		}



		/*
		*	Register a callback to be called when we recieve 0x03 (CAN Packet)
		*/
		function registerPacketHandler( callback ){
			if( !(typeof callback == "function") ) return;
			if( packetHandlers.indexOf(callback) < 1 )
				packetHandlers.push(callback);
		}

		function deregisterPacketHandler( callback ){
			packetHandlers.splice(packetHandlers.indexOf(callback), 1);
		}


		/*
		*	Read Line Handler
		*	Call all read callbacks
		*/
		function readHandler(dataBuffer){

			// console.log('serial data', new Uint8Array(dataBuffer));

			var data = new Uint8Array(dataBuffer);

			// Check packet for 0x03 prefix, which is a CAN Packet
			if( data[0] === 0x03 ){
				// console.log('packet', data);
				var packet = new CANPacket( data[1], data[2], data[3], data[4], data[5], data[6], data[7], data[8], data[9], data[10], data[11], data[12], data[13] );
				for(var p in packetHandlers)
					packetHandlers[p](packet);

			}else if( data[0] === 123 || data[1] === 123 ){

				// Dispatch an event with the JSON object

				var eventObject;
				try{
					eventObject = JSON.parse( UtilsService.ab2str( data ) );
				}catch(e){

				}

				if( eventObject ) $rootScope.$broadcast('hardwareEvent', eventObject);

				// console.log("JSON Event Recieved ", eventObject );

			}else{
				// console.log('raw data', data);
				// Otherwise dispatch raw packet
				for(var f in readHandlers)
					readHandlers[f](dataBuffer);

			}

		}



		/*
		*	Raw Data Handler
		*	Call all read callbacks
		*/
		function rawHandler(dataBuffer){
			for(var f in rawHandlers)
				rawHandlers[f](dataBuffer);
		}





		/*
		*	Store and broadcast connected event
		*/
		function serviceStatusHandler( event ){

			$timeout(function(){
				switch(event.name){
					case "BluetoothService.CONNECTED":
						connectionMode = ConnectionMode.BT;
						$rootScope.$broadcast( 'HardwareService.CONNECTED' );
					break;
					case "SerialService.OPEN":
						connectionMode = ConnectionMode.USB;
						$rootScope.$broadcast( 'HardwareService.CONNECTED' );
					break;
					case "BluetoothService.CONNECTING":
						$rootScope.$broadcast( 'HardwareService.CONNECTING' );
					break;
					case "BluetoothService.RECONNECTING":
						$rootScope.$broadcast( 'HardwareService.RECONNECTING' );
					break;
					case "BluetoothService.DISCONNECTING":
						$rootScope.$broadcast( 'HardwareService.DISCONNECTING' );
					break;
					case "BluetoothService.DISCONNECTED":
					case "SerialService.CLOSE":
						connectionMode = null;
						$rootScope.$broadcast( 'HardwareService.DISCONNECTED' );
					break;
					case "BluetoothService.RESET":
					case "SerialService.RESET":
						$rootScope.$broadcast( 'HardwareService.RESET' );
					break;
				}

			});

		}


		/*
		*	Reset Connected CBT Hardware
		*/
		function resetHardware(){

			// CBT API Reset Hardware command
			write( String.fromCharCode(0x01, 0x16) );
			//disconnect();

			$timeout(function(){
				SerialService.reconnect();
				// SerialService.open();
				// connect();
			}, 100);

		}



		/*
		*	Connect to last device
		*/
		$timeout(function(){
			if( SettingsService.getAutoconnect() == "true" && SettingsService.getDevice())
				connect();
		}, 1500);





		/*
		*	Event Listeners
		*/
		$rootScope.$on('BluetoothService.CONNECTED', serviceStatusHandler);
		$rootScope.$on('BluetoothService.DISCONNECTED', serviceStatusHandler);
		$rootScope.$on('BluetoothService.CONNECTING', serviceStatusHandler);
		$rootScope.$on('BluetoothService.DISCONNECTING', serviceStatusHandler);
		$rootScope.$on('SerialService.OPEN', serviceStatusHandler);
		$rootScope.$on('SerialService.CLOSE', serviceStatusHandler);
		$rootScope.$on('BluetoothService.RESET', serviceStatusHandler);
		$rootScope.$on('SerialService.RESET', serviceStatusHandler);





		return {
			/* Interface Properties */
			connectionMode: function(){ return connectionMode; },
			debugString: debugString,
			commands: commands,

			/* Interface Methods */
			search: searchForDevices,
			connect: connect,
			disconnect: disconnect,
			send: function(s){
				return write(s);
				},
			command: command,
			reset: function(){ resetHardware(); },
			registerReadHandler: registerReadHandler,
			deregisterReadHandler: deregisterReadHandler,
			registerPacketHandler: registerPacketHandler,
			deregisterPacketHandler: deregisterPacketHandler,
			registerRawHandler: registerRawHandler,
			deregisterRawHandler: deregisterRawHandler
	    }

	});

'use strict';

angular.module('cbt')
	.factory('MenuService', function(SettingsService) {


	  var menuItems = [
      //{ text: 'Dashboard', iconClass: 'icon ion-speedometer', link: 'dashboard'},
      //{ text: 'Diagnostics', iconClass: 'icon ion-ios-pulse', link: 'diagnostics'},
      { text: 'Packet Logger', iconClass: 'icon ion-settings', link: 'logger'},
      { text: 'Hardware', iconClass: 'icon ion-usb', link: 'hardware'},
			{ text: 'Firmware', iconClass: 'icon ion-code-download', link: 'firmware'},
      { text: 'Settings', iconClass: 'icon ion-gear-b', link: 'settings'}
	  ];

	  var pluginMenuItems = [];


	  return {
	    all: function() {

			  if( SettingsService.getDebugMode() == "true" )
			  	menuItems.push({ text: 'Debug', iconClass: 'icon ion-bug', link: 'debug'});

			  return menuItems;

	    },

	    allPlugins: function(){
		    return pluginMenuItems;
	    },

	    addPlugin: function( label, icon, route ){
		    pluginMenuItems.push({ text: label, iconClass: 'icon '+icon, link: route});
	    },
	    removePlugin: function(){
		    // TODO
	    },


	  }
	});

'use strict';

if( typeof process != "undefined" && process.platform )

/*
*	Node Serial
*/

angular.module('cbt')
	.factory('SerialService', function( $q, $rootScope, $interval, $timeout, UtilsService ) {

		var serialport = require("serialport"),
				SerialPort = serialport.SerialPort,
				serialPort;

		var serialOpened = false,
				baudRate = 115200,
				searching = null,
				readBuffer = "",
				discovered = {},
				serialPath = '';

		var rawCallback;


		/**
		 *	Cleanup serial when window reloads or closes
		 */
		window.addEventListener('beforeunload', function() {
			close();
		}, false);


		/**
		 * Open serial port
		 */
		function open(){

			var deferred = $q.defer();

			if( searching ) search( false );

			serialPort = new SerialPort(serialPath, {
				// encoding: 'ascii', //Buffer utf8 utf16le ucs2 ascii hex.
		  	baudrate: baudRate,
		  	databits: 8,
				stopbits: 1,
				parity: 'none',
				rtscts: false,
				xany: true,
				flowControl: false,
				buffersize: 1024,
			  	parser: parser,
			  	disconnectedCallback: close
			}, false);

			serialPort.open(function(err){

			  if(err){
					serialOpened = false;
					$rootScope.$broadcast('SerialService.OPEN_ERROR');
					deferred.reject(new Error("Failed to open Serial port"));
			  }else{
			  	serialOpened = true;
					$rootScope.$broadcast('SerialService.OPEN');
					$timeout(function(){deferred.resolve();}, 20);
			  }
			});

			serialPort.on('close', function(){
				console.info("Serial Port Closed");
			});

			return deferred.promise;

		}


		/*
		*		Serial Data callback
		*/

		var readline = serialport.parsers.readline("\r", "binary");

		function parser(obj, data){

			if(typeof rawCallback === "function") rawCallback(data);

			readline(obj, data);
			}




		/**
		 * Close the serial port
		 */
		function close(){
			var deferred = $q.defer();

			if(serialOpened)
				serialPort.close(function(err){

					if(err){
						deferred.reject(new Error("Failed to close Serial port "+err));
					}else{
						serialOpened = false;
						$rootScope.$broadcast('SerialService.CLOSE');
						$timeout(function(){deferred.resolve();}, 100);
					}

				});

			return deferred.promise;
		}




		/**
		 * Write data to serial port
		 * @param {String} string data to write
		 */
		function write( data ){

			/*
			if( data instanceof Uint8Array )
				data = UtilsService.ab2str( data.buffer );

			if( data instanceof ArrayBuffer )
				data = UtilsService.ab2str( data );

			if( !( typeof data == 'string' ) ){
				console.log('SerialService write: Data must be string or Uint8Array', typeof data );
				return;
			}
			*/

			if( data instanceof ArrayBuffer )
				data = new Uint8Array(data);

			if( data instanceof String )
				data = UtilsService.stringToByteArray( data );

			console.log("SerialService Sending:", data, UtilsService.ab2str(data) );

			var deferred = $q.defer();
			serialPort.write(
				data,
				function(err, results){
					if(err){
						$rootScope.$broadcast('SerialService.WRITE_ERROR', err);
						deferred.reject(new Error(err));
					}else{
						serialPort.drain(function(){
							deferred.resolve();
						});
					}
				}
			);

			return deferred.promise;

		}

		/**
		 * Manually read from serial port
		 */
		function read(){

			var deferred = $q.defer();
			//deferred.resolve( UtilsService.byteArrayToString(byteArray) );
			//deferred.reject(new Error());
			return deferred.promise;

		}


		/**
		 * Register a callback function that is called when the plugin reads data
		 * @return null
		 */
		function registerReadCallback(callback){

			serialPort.on('data', function(data){
				// TODO Write a new parser for SerialPort that converts directly to ArrayBuffer. Take note of the realline wrapper function above.
				callback( UtilsService.str2ab(data) );
			});

		}




		/**
		 * Start pinging the serial port looking for CBT hardware
		 * @param {boolean} b
		 * @return null
		 */
		function search( b ){

			// Clear discovered
			for(var k in discovered)
						delete discovered[k];

			var serialPort = require("serialport");
			serialPort.list(function (err, ports) {
			  ports.forEach(function(port) {
			    $rootScope.$apply(function(){
						discovered[port.comName] = {name:'CANBus Triple Serial '+port.comName, port:port.comName, address:'serial'};
					});

			  });
			});


		}




		/**
		 * Reset the CBT by connecting at 1200 baud
		 * @return null
		 */
		function reset(){

			var oldBaudRate = baudRate;
			baudRate = 1200;

			close()
				.then(open)
				.then(close)
				.then(function(){
					baudRate = oldBaudRate;
					open();
					$timeout(function(){
						$rootScope.$broadcast('SerialService.RESET' );
					}, 500);

			});

		}


		/**
		 * Reconnect to serial
		 * @return null
		 */
		function reconnect(){

			close()
			.then(function(){
				$timeout(function(){
					open().then(function(){
						$rootScope.$broadcast('SerialService.RESET' );
					});
				}, 500);
			});

		}





		/*
		*	Return Interface
		*/
	  return {
	    open: function openConnection(device, callback, rCallback){
	    	serialPath = device.port;
		    return open().then(function(){ registerReadCallback(callback); rawCallback = rCallback });
	    },
	    close: close,
	    reconnect: reconnect,
	    read: read,
	    write: write,
	    discovered: discovered,
	    search: search,
	    reset: reset
	  }

	});





else

/*
*	Cordova Serial Plugin
*/

angular.module('cbt')
	.factory('SerialService', function( $q, $rootScope, $interval, $timeout, UtilsService ) {



		var serialOpened = false,
				baudRate = 115200,
				searching = null,
				usbSerialPermissionGranted = false,
				readBuffer = "",
				discovered = {};




		/**
		 * Open serial port
		 */
		function open(){

			var deferred = $q.defer();

			if( searching ) search( false );

			function doOpen(){
				serial.open({
					baudRate: baudRate,
					dtr: true
					},
					function success(){
						serialOpened = true;
						$rootScope.$broadcast('SerialService.OPEN');
						$timeout(function(){deferred.resolve();}, 100);
					},
					function error(){
						serialOpened = false;
						$rootScope.$broadcast('SerialService.OPEN_ERROR');
						deferred.reject(new Error("Failed to open Serial port"));
					}
				);
			}


			if( !usbSerialPermissionGranted ){

				serial.requestPermission(
					function success(){
						usbSerialPermissionGranted = true;
						$rootScope.$broadcast('SerialService.PERMISSION_GRANTED');
						doOpen();
					},
					function error(err){
						usbSerialPermissionGranted = false;
						$rootScope.$broadcast('SerialService.PERMISSION_DENIED', err);
						deferred.reject(new Error(err));
					}
				);

			}
			else
				doOpen();


			return deferred.promise;

		}


		/**
		 * Close the serial port
		 */
		function close(){
			var deferred = $q.defer();

			serial.close(
				function success(){
					serialOpened = false;
					$rootScope.$broadcast('SerialService.CLOSE');
					$timeout(function(){deferred.resolve();}, 100);
				},
				function error(){
					deferred.reject(new Error("Failed to close Serial port"));
				});

			return deferred.promise;
		}




		/**
		 * Write data to serial port
		 * @param {String} string data to write
		 */
		function write( data ){


			if( data instanceof Uint8Array )
				data = UtilsService.ab2str( data.buffer );

			if( data instanceof ArrayBuffer )
				data = UtilsService.ab2str( data );

			if( !( typeof data == 'string' ) ){
				console.log('SerialService write: Data must be string or Uint8Array', typeof data );
				return;
			}

			console.log("SerialService Sending:", UtilsService.string2hexString(data) );

			var deferred = $q.defer();
			serial.write(
				data,
				function success(){
					deferred.resolve();
				},
				function error(){
					deferred.reject(new Error());
				}
			);

			return deferred.promise;

		}


		/**
		 * Manually read from serial port
		 */
		function read(){

			var deferred = $q.defer();
			serial.read(
				function success(data){
					var byteArray = new Uint8Array(data);
					deferred.resolve( UtilsService.byteArrayToString(byteArray) );
				},
				function error(){
					deferred.reject(new Error());
				}
			);

			return deferred.promise;

		}


		/**
		 * Register a callback function that is called when the plugin reads data
		 * @return null
		 */
		function registerReadCallback(callback){

			serial.registerReadCallback(callback,
				function error(){
					new Error("Failed to register read callback");
				});

		}


		/**
		 * Handles incoming data from the Serial plugin
		 * @param {ArrayBuffer} data
		 * @return null
		 */
		function handleData(data){

			if(searching != null){
				handleSearchResponse(data);
				return;
			}

			$rootScope.$broadcast('SerialService.READ_DATA', data);
			readHandler(data);

		}

		/**
		 * Handle read data if in search mode
		 * @return null
		 */
		function handleSearchResponse(data){

			var view = new Uint8Array(data);
			readBuffer += UtilsService.byteArrayToString(view);

			console.log(view);

			var line = readBuffer.split("\r\n", 1);

			try{
				var message = JSON.parse(line);

				if(line.length > 0){
					readBuffer = readBuffer.slice(line[0].length);
					search( false );
					close();
					}

				if(!$rootScope.$$phase)
						$rootScope.$apply(function(){
							discovered['serial'] = message;
						});

			}catch(err){}


		}




		/**
		 * Start pinging the serial port looking for CBT hardware
		 * @param {boolean} b
		 * @return null
		 */
		function search( b ){
			/*

			if(b){

				if( !serialOpened )
					open().then(function(){ registerReadCallback() }, function(e){ console.log(e); return; });

				// Clear discovered
				readBuffer = "";
				for(var k in discovered)
					delete discovered[k];

				// Search for 30 seconds
				searching = $interval( function(){
					if(serialOpened == false) return;
					write( String.fromCharCode(0x01, 0x01) );
					}, 1000, 30 );

				}
			else{
				$interval.cancel(searching);
				searching = null;
				}
*/
			if( !usbSerialPermissionGranted ){

				// Clear discovered
				for(var k in discovered)
							delete discovered[k];

				serial.requestPermission(
					function success(){
						usbSerialPermissionGranted = true;
						$rootScope.$broadcast('SerialService.PERMISSION_GRANTED');

						$rootScope.$apply(function(){
							discovered['serial'] = {name:'CANBus Triple USB Serial', address:'serial'};
						});

					},
					function error(err){
						usbSerialPermissionGranted = false;
						$rootScope.$broadcast('SerialService.PERMISSION_DENIED', err);
					}
				);

			}


		}




		/**
		 * Reset the CBT by connecting at 1200 baud
		 * @return null
		 */
		function reset(){

			var oldBaudRate = baudRate;
			baudRate = 1200;

			close()
				.then(open)
				.then(close)
				.then(function(){
					baudRate = oldBaudRate;
					open();
					$timeout(function(){
						$rootScope.$broadcast('SerialService.RESET' );
					}, 500);

			});

		}


		/**
		 * Reconnect to serial
		 * @return null
		 */
		function reconnect(){

			close()
			.then(function(){
				$timeout(function(){
					open();
					$timeout(function(){
							$rootScope.$broadcast('SerialService.RESET' );
						}, 500);
				}, 2000);
			});

		}







		/*
		*	Return Interface
		*/
	  return {
	    open: function openConnection(devicem, callback, rawCallback){
		    return open().then(function(){ registerReadCallback(callback) });
	    },
	    close: close,
	    reconnect: reconnect,
	    read: read,
	    write: write,
	    discovered: discovered,
	    search: search,
	    reset: reset
	 	  }

	});

'use strict';

angular.module('cbt')
	.factory('SettingsService', function($rootScope, localStorageService){

		// window.ls = localStorageService;


		return {
			// Properties



			// Methods
			getDevice: function(){
				return localStorageService.get('device');
			},
			setDevice: function(v){
				return localStorageService.add('device', v);
			},
			getAutoconnect: function(){

				if(localStorageService.get('autoconnect') != null){
					return localStorageService.get('autoconnect');
				}else{
					localStorageService.add('autoconnect', true);
					return true;
				}

			},
			setAutoconnect: function(v){
				localStorageService.add('autoconnect', v === 'true' || v );
				$rootScope.$broadcast('SettingsService.CHANGE', 'autoconnect');
			},
			getDebugMode: function(){
				return localStorageService.get('debugMode');
			},
			setDebugMode: function(v){

				console.log(v);

				localStorageService.add('debugMode', v);
				$rootScope.$broadcast('SettingsService.CHANGE', 'debugMode');
			},
		};

	});

'use strict';

angular.module('cbt')
	.factory('UtilsService', function(){

		var Util = {};

		/**
		 * Turns a string into an array of bytes; a "byte" being a JS number in the
		 * range 0-255.
		 * @param {string} str String value to arrify.
		 * @return {!Array.<number>} Array of numbers corresponding to the
		 *     UCS character codes of each character in str.
		 */
		Util.stringToByteArray = function(str) {
		  var output = [], p = 0;
		  for (var i = 0; i < str.length; i++) {
		    var c = str.charCodeAt(i);
		    while (c > 0xff) {
		      output[p++] = c & 0xff;
		      c >>= 8;
		    }
		    output[p++] = c;
		  }
		  return output;
		};


		/**
		 * Turns an array of numbers into the string given by the concatenation of the
		 * characters to which the numbers correspond.
		 * @param {Array} array Array of numbers representing characters.
		 * @return {string} Stringification of the array.
		 */
		Util.byteArrayToString = function(array) {
		  return String.fromCharCode.apply(null, array);
		};


		/**
		 * Turns an array of numbers into the hex string given by the concatenation of
		 * the hex values to which the numbers correspond.
		 * @param {Array} array Array of numbers representing characters.
		 * @return {string} Hex string.
		 */
		Util.byteArrayToHex = function(array) {
		  var a = [];
		  for(var i=0; i<array.length; i++){
		    var hexByte = array[i].toString(16);
		    a.push( hexByte.length > 1 ? hexByte : '0' + hexByte );
		  }
		  return a.join('');
		};


		/**
		 * Converts a hex string into an integer array.
		 * @param {string} hexString Hex string of 16-bit integers (two characters
		 *     per integer).
		 * @return {!Array.<number>} Array of {0,255} integers for the given string.
		 */
		Util.hexToByteArray = function(hexString) {
		  if(hexString.length % 2 != 0){
		    throw 'Key string length must be multiple of 2';
		    return false;
		    }
		  var arr = [];
		  for (var i = 0; i < hexString.length; i += 2) {
		    arr.push(parseInt(hexString.substring(i, i + 2), 16));
		  }
		  return arr;
		};


		/**
		 * Converts a hex string into an Uint8Array.
		 * @param {string} hexString Hex string of 16-bit integers (two characters
		 *     per integer).
		 * @return {!Uint8Array.<number>} Uint8Array of {0,255} integers for the given string.
		 */
		Util.hexToUint8Array = function(hexString) {
		  if(hexString.length % 2 != 0){
		    throw 'Key string length must be multiple of 2';
		    return false;
		    }
		  var buf = new ArrayBuffer(hexString.length/2);
		  var bufView = new Uint8Array(buf);
		  for (var i = 0; i < hexString.length; i += 2) {
		    bufView[i/2] = parseInt(hexString.substring(i, i + 2), 16);
		  }
		  return bufView;
		};


		Util.ab2str = function(buf) {
		  return String.fromCharCode.apply(null, new Uint8Array(buf));
		}

		Util.str2ab = function(str) {
		  var buf = new ArrayBuffer(str.length);
		  var bufView = new Uint8Array(buf);
		  for (var i=0, strLen=str.length; i<strLen; i++) {
		    bufView[i] = str.charCodeAt(i);
		  }
		  return buf;
		}

		Util.ab2hexString = function(buf) {

			var b = '';

			for(var i=0; i<buf.length; i++)
				b += buf[i].toString(16) + ' ';

			return b;

		}

		Util.string2hexString = function(str) {

			var b = '';

			for(var i=0; i<str.length; i++){
				var v = str.charCodeAt(i).toString(16).toUpperCase();
				if(v.length < 2) v = '0'+v;
				// b += '0x'+v+ ' ';
				b += v+ ' ';
				}

			return b;

		}



		Util.md5 = md5lib;



		return Util;





	});







/*!
 * Joseph Myer's md5() algorithm wrapped in a self-invoked function to prevent
 * global namespace polution, modified to hash unicode characters as UTF-8.
 *
 * Copyright 1999-2010, Joseph Myers, Paul Johnston, Greg Holt, Will Bond <will@wbond.net>
 * http://www.myersdaily.org/joseph/javascript/md5-text.html
 * http://pajhome.org.uk/crypt/md5
 *
 * Released under the BSD license
 * http://www.opensource.org/licenses/bsd-license
 */
var md5lib = (function() {
	var md5;
	function md5cycle(x, k) {
		var a = x[0], b = x[1], c = x[2], d = x[3];

		a = ff(a, b, c, d, k[0], 7, -680876936);
		d = ff(d, a, b, c, k[1], 12, -389564586);
		c = ff(c, d, a, b, k[2], 17, 606105819);
		b = ff(b, c, d, a, k[3], 22, -1044525330);
		a = ff(a, b, c, d, k[4], 7, -176418897);
		d = ff(d, a, b, c, k[5], 12, 1200080426);
		c = ff(c, d, a, b, k[6], 17, -1473231341);
		b = ff(b, c, d, a, k[7], 22, -45705983);
		a = ff(a, b, c, d, k[8], 7, 1770035416);
		d = ff(d, a, b, c, k[9], 12, -1958414417);
		c = ff(c, d, a, b, k[10], 17, -42063);
		b = ff(b, c, d, a, k[11], 22, -1990404162);
		a = ff(a, b, c, d, k[12], 7, 1804603682);
		d = ff(d, a, b, c, k[13], 12, -40341101);
		c = ff(c, d, a, b, k[14], 17, -1502002290);
		b = ff(b, c, d, a, k[15], 22, 1236535329);

		a = gg(a, b, c, d, k[1], 5, -165796510);
		d = gg(d, a, b, c, k[6], 9, -1069501632);
		c = gg(c, d, a, b, k[11], 14, 643717713);
		b = gg(b, c, d, a, k[0], 20, -373897302);
		a = gg(a, b, c, d, k[5], 5, -701558691);
		d = gg(d, a, b, c, k[10], 9, 38016083);
		c = gg(c, d, a, b, k[15], 14, -660478335);
		b = gg(b, c, d, a, k[4], 20, -405537848);
		a = gg(a, b, c, d, k[9], 5, 568446438);
		d = gg(d, a, b, c, k[14], 9, -1019803690);
		c = gg(c, d, a, b, k[3], 14, -187363961);
		b = gg(b, c, d, a, k[8], 20, 1163531501);
		a = gg(a, b, c, d, k[13], 5, -1444681467);
		d = gg(d, a, b, c, k[2], 9, -51403784);
		c = gg(c, d, a, b, k[7], 14, 1735328473);
		b = gg(b, c, d, a, k[12], 20, -1926607734);

		a = hh(a, b, c, d, k[5], 4, -378558);
		d = hh(d, a, b, c, k[8], 11, -2022574463);
		c = hh(c, d, a, b, k[11], 16, 1839030562);
		b = hh(b, c, d, a, k[14], 23, -35309556);
		a = hh(a, b, c, d, k[1], 4, -1530992060);
		d = hh(d, a, b, c, k[4], 11, 1272893353);
		c = hh(c, d, a, b, k[7], 16, -155497632);
		b = hh(b, c, d, a, k[10], 23, -1094730640);
		a = hh(a, b, c, d, k[13], 4, 681279174);
		d = hh(d, a, b, c, k[0], 11, -358537222);
		c = hh(c, d, a, b, k[3], 16, -722521979);
		b = hh(b, c, d, a, k[6], 23, 76029189);
		a = hh(a, b, c, d, k[9], 4, -640364487);
		d = hh(d, a, b, c, k[12], 11, -421815835);
		c = hh(c, d, a, b, k[15], 16, 530742520);
		b = hh(b, c, d, a, k[2], 23, -995338651);

		a = ii(a, b, c, d, k[0], 6, -198630844);
		d = ii(d, a, b, c, k[7], 10, 1126891415);
		c = ii(c, d, a, b, k[14], 15, -1416354905);
		b = ii(b, c, d, a, k[5], 21, -57434055);
		a = ii(a, b, c, d, k[12], 6, 1700485571);
		d = ii(d, a, b, c, k[3], 10, -1894986606);
		c = ii(c, d, a, b, k[10], 15, -1051523);
		b = ii(b, c, d, a, k[1], 21, -2054922799);
		a = ii(a, b, c, d, k[8], 6, 1873313359);
		d = ii(d, a, b, c, k[15], 10, -30611744);
		c = ii(c, d, a, b, k[6], 15, -1560198380);
		b = ii(b, c, d, a, k[13], 21, 1309151649);
		a = ii(a, b, c, d, k[4], 6, -145523070);
		d = ii(d, a, b, c, k[11], 10, -1120210379);
		c = ii(c, d, a, b, k[2], 15, 718787259);
		b = ii(b, c, d, a, k[9], 21, -343485551);

		x[0] = add32(a, x[0]);
		x[1] = add32(b, x[1]);
		x[2] = add32(c, x[2]);
		x[3] = add32(d, x[3]);
	}

	function cmn(q, a, b, x, s, t) {
		a = add32(add32(a, q), add32(x, t));
		return add32((a << s) | (a >>> (32 - s)), b);
	}

	function ff(a, b, c, d, x, s, t) {
		return cmn((b & c) | ((~b) & d), a, b, x, s, t);
	}

	function gg(a, b, c, d, x, s, t) {
		return cmn((b & d) | (c & (~d)), a, b, x, s, t);
	}

	function hh(a, b, c, d, x, s, t) {
		return cmn(b ^ c ^ d, a, b, x, s, t);
	}

	function ii(a, b, c, d, x, s, t) {
		return cmn(c ^ (b | (~d)), a, b, x, s, t);
	}

	function md51(s) {
		// Converts the string to UTF-8 "bytes" when necessary
		if (/[\x80-\xFF]/.test(s)) {
			s = unescape(encodeURI(s));
		}
		var txt = '';
		var n = s.length, state = [1732584193, -271733879, -1732584194, 271733878], i;
		for (i = 64; i <= s.length; i += 64) {
			md5cycle(state, md5blk(s.substring(i - 64, i)));
		}
		s = s.substring(i - 64);
		var tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		for (i = 0; i < s.length; i++)
		tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
		tail[i >> 2] |= 0x80 << ((i % 4) << 3);
		if (i > 55) {
			md5cycle(state, tail);
			for (i = 0; i < 16; i++) tail[i] = 0;
		}
		tail[14] = n * 8;
		md5cycle(state, tail);
		return state;
	}

	function md5blk(s) { /* I figured global was faster.   */
		var md5blks = [], i; /* Andy King said do it this way. */
		for (i = 0; i < 64; i += 4) {
			md5blks[i >> 2] = s.charCodeAt(i) +
			                  (s.charCodeAt(i + 1) << 8) +
			                  (s.charCodeAt(i + 2) << 16) +
			                  (s.charCodeAt(i + 3) << 24);
		}
		return md5blks;
	}

	var hex_chr = '0123456789abcdef'.split('');

	function rhex(n) {
		var s = '', j = 0;
		for (; j < 4; j++)
		s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] +
		     hex_chr[(n >> (j * 8)) & 0x0F];
		return s;
	}

	function hex(x) {
		for (var i = 0; i < x.length; i++)
		x[i] = rhex(x[i]);
		return x.join('');
	}

	md5 = function (s) {
		return hex(md51(s));
	}

	/* this function is much faster, so if possible we use it. Some IEs are the
	only ones I know of that need the idiotic second function, generated by an
	if clause.  */
	function add32(a, b) {
		return (a + b) & 0xFFFFFFFF;
	}

	if (md5('hello') != '5d41402abc4b2a76b9719d911017c592') {
		add32 = function(x, y) {
			var lsw = (x & 0xFFFF) + (y & 0xFFFF),
			    msw = (x >> 16) + (y >> 16) + (lsw >> 16);
			return (msw << 16) | (lsw & 0xFFFF);
		}
	}

	return md5;
})();
