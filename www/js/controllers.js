angular.module('cbt.controllers', [])



.controller('MenuController', function ($scope, $location, MenuService) {
	
	$scope.title = "CANBus Triple";
	
	$scope.list = MenuService.all();
	
	$scope.goTo = function(page) {
	  console.log('Going to ' + page);
	  $scope.sideMenuController.toggleLeft();
	  $location.url('/' + page);
	};
	
	
})

.controller('OneController', function ($scope) {
	$scope.navTitle = "Page One Title";
	$scope.title = "CANBus Triple";
	
	$scope.leftButtons = [{
	  type: 'button-icon icon ion-navicon',
    tap: function(e) {
      $scope.sideMenuController.toggleLeft();
    }
	}];
	
	$scope.rightButtons = [];
})

.controller('TwoController', function ($scope) {
  $scope.navTitle = "Page Two Title";

  $scope.leftButtons = [{
    type: 'button-icon icon ion-navicon',
    tap: function(e) {
        $scope.sideMenuController.toggleLeft();
    }
  }];

  $scope.rightButtons = [];
})

.controller('DebugController', function ($scope, BluetoothService) {

  $scope.navTitle = "Debug";
  
  $scope.discovered = BluetoothService.discovered;
  $scope.$on('didFindNewBluetoothDevice', function(event, data){
  	console.log(BluetoothService.discovered);
	  $scope.discovered = BluetoothService.discovered;
  });
  

  $scope.leftButtons = [{
    type: 'button-icon icon ion-navicon',
    tap: function(e) {
        $scope.sideMenuController.toggleLeft();
		}
	}];

	$scope.rightButtons = [];
	
	
	$scope.btScan = function(){
		BluetoothService.scan();
	}
	
	$scope.btConnect = function(address){
		BluetoothService.setDevice(address);
		BluetoothService.connect();
	}
	
	
	
	
	
});
