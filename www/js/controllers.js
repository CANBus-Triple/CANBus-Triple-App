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

.controller('ThreeController', function ($scope) {
  $scope.navTitle = "Page Three Title";

  $scope.leftButtons = [{
    type: 'button-icon icon ion-navicon',
    tap: function(e) {
        $scope.sideMenuController.toggleLeft();
		}
	}];

	$scope.rightButtons = [];
});
