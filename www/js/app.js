angular.module("sh", ["ionic",'sh.controllers','sh.services','sh.animations','ui.router','ngCordova', 'ngTouch', 'firebase'])

.run(function($ionicPlatform){
  $ionicPlatform.ready(function(){
    if(window.cordova && window.cordova.plugins.Keyboard){
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar){
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider){
  $stateProvider
  
  .state('album', {
    url: '/album/:id',
    templateUrl: 'templates/album.html',
    controller: 'AlbumCtrl'
  })

  .state('calendar', {
    url: '/calendar',
    templateUrl: 'templates/calendar.html',
    controller: 'CalendarCtrl'
  })

  .state('connexion', {
    url: '/connexion',
    templateUrl: "templates/connexion.html",
    controller: 'ConnexionCtrl'
  })

  .state('conversations', {
    url: '/conversations',
    templateUrl: 'templates/conversations.html',
    controller: 'ConversationCtrl'
  })

  .state('home', {
    url: '/home',
    templateUrl: "templates/home.html",
    controller: 'HomeCtrl'
  })

  .state('houseChoice', {
    url: '/houseChoice',
    templateUrl: "templates/house-choice.html",
    controller: 'HouseChoiceCtrl'
  })

  .state('houseCreate', {
    url: '/houseCreate',
    templateUrl: "templates/house-create.html",
    controller: 'HouseCreateCtrl'
  })

  .state('houseSearch', {
    url: '/houseSearch',
    templateUrl: "templates/house-search.html",
    controller: 'HouseSearchCtrl'
  })

  .state('joinRequests', {
    url: '/joinRequests',
    templateUrl: "templates/join-requests.html",
    controller: 'JoinRequestsCtrl'
  })

  .state('menu', {
    url: '/menu',
    templateUrl: 'templates/menu.html',
    controller: 'MenuCtrl'
  })

  .state('notifications', {
    url: '/notifications',
    templateUrl: 'templates/notifications.html',
    controller: 'NotificationsCtrl'
  })

  .state('settings', {
    url: '/settings',
    templateUrl: 'templates/settings.html',
    controller: 'SettingsCtrl'
  })

  .state('sharing', {
    url: '/sharing',
    templateUrl: 'templates/sharing.html',
    controller: 'SharingCtrl'
  })

  .state('statusChange', {
    url: '/statusChange',
    templateUrl: 'templates/status-change.html',
    controller: 'StatusCtrl'
  })

  .state('taskList', {
    url: '/taskList',
    templateUrl: 'templates/task-list.html',
    controller: 'TaskListCtrl'
  });

  $urlRouterProvider.otherwise('/connexion');
});