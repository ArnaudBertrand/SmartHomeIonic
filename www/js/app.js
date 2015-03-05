angular.module("sh", ["ionic",'sh.controllers','sh.services','ui.router','ngCordova'])

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

  .state('home', {
    url: '/home',
    templateUrl: "templates/home.html",
    controller: 'HomeCtrl'
  })

  .state('status-change', {
    url: '/status-change',
    templateUrl: 'templates/status-change.html',
    controller: 'StatusCtrl'
  })

  .state('conversations', {
    url: '/conversations',
    templateUrl: 'templates/conversations.html',
    controller: 'ConversationCtrl'
  })

  .state('house-plan', {
    url: '/house-plan',
    templateUrl: 'templates/house-plan.html',
    controller: 'HousePlanCtrl'
  });

  $urlRouterProvider.otherwise('/connexion');
});