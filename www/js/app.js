angular.module("sh", ["ionic",'sh.controllers','sh.services','sh.animations','ui.router','ngCordova', 'ngTouch'])

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

  .state('house-plan', {
    url: '/house-plan',
    templateUrl: 'templates/house-plan.html',
    controller: 'HousePlanCtrl'
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

  .state('sharing', {
    url: '/sharing',
    templateUrl: 'templates/sharing.html',
    controller: 'SharingCtrl'
  })

  .state('status-change', {
    url: '/status-change',
    templateUrl: 'templates/status-change.html',
    controller: 'StatusCtrl'
  });

  $urlRouterProvider.otherwise('/connexion');
});