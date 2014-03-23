angular.module('cbt.services', [])

.factory('MenuService', function() {

  var menuItems = [
      { text: '1 Page One', iconClass: 'icon ion-map', link: 'one'},
      { text: '2 Page Two', iconClass: 'icon ion-gear-b', link: 'two'},
      { text: '3 Page Three', iconClass: 'icon ion-star', link: 'three'}
  ];

  return {
    all: function() {
      return menuItems;
    }
  }
});
