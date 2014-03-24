angular.module('cbt.services', [])

.factory('MenuService', function() {

  var menuItems = [
      { text: '1 Page One', iconClass: 'icon ion-map', link: 'one'},
      { text: '2 Page Two', iconClass: 'icon ion-star', link: 'two'},
      { text: 'Debug', iconClass: 'icon ion-gear-b', link: 'debug'}
  ];

  return {
    all: function() {
      return menuItems;
    }
  }
})

.factory('BluetoothService', function($rootScope, $timeout) {
	
	var connected = false,
			initialized = false,
			device = {},
			discovered = {};
	
	
	
	
	function init(){
		bluetoothle.initialize(function initializeSuccessCallback(status){
			initalized = true;
		}, function initializeErrorCallback(status){
			console.log("initializeErrorCallback");
		});
	}
	
	function scan(){
		
		bluetoothle.startScan(function startScanSuccessCallback(status){
			console.log("startScanSuccessCallback", status );
			// console.log( bluetoothle.getBytes( status.advertisement ) );
			
			// Add to discovered array
			if( status.status = 'scanResult' && status.address ){
				discovered[status.address] = status;
				}
			
			
		}, function startScanErrorCallback(v){
			console.log("startScanErrorCallback", status );
		}, {});
		
		$timeout(function(){
			bluetoothle.stopScan(function stopScanSuccessCallback(){}, function stopScanErrorCallback(){});
		}, 2000);
		
	}


	function connect(){
		
		bluetoothle.connect(function connectSuccessCallback( status ){
			console.log("connectSuccessCallback", status);
			
			switch(status.status){
				case 'connected':
					$rootScope.$broadcast('bluetoothDidConnect');
				break;
				case 'disconnected':
					$rootScope.$broadcast('bluetoothDidDisconnect');
				break;
			}
			
		}, function connectErrorCallback(){
			console.log("connectErrorCallback");
		}, { 'address':device.address });
		
		
	}
	
	
	
	init();
	
  return {
    scan: scan,
    connect: connect,
    setDevice: function(i){ device = discovered[i] },
    
    discovered: discovered
    
  }
  
});


