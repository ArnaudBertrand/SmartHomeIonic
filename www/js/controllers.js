angular.module('sh.controllers', [])

.controller('AppCtrl', function($scope, $ionicLoading, Menu){
  $scope.showMenu = false;

  // Watch show
  $scope.$watch(function(){ 
      return Menu.isDisplayed();
    }, 
    function(val){
      $scope.showMenu = val;
    });
})

.controller('ConnexionCtrl', function($scope, $log, $state, User, Menu){
  Menu.hide();
  $scope.user = { 
    name: '',
    password: '',
    confirmPassword: ''
  }

  $scope.registration = false;
  
  // Log in the user
  $scope.login = function (user) {
    User.login(user);
    $state.go('home');
  };

  // Set registrations
  $scope.setRegistration = function (bool){
    $scope.registration = bool;
  };
})

.controller('ConversationCtrl', function($scope, $log, Menu){
  Menu.show();
  $scope.messages = [];
  $scope.messages.push({author: "Papa", text: "I love this app"});
  $scope.messages.push({author: "PP", text: "I like to move it move it"});
  $scope.messages.push({author: "Pauline", text: "I am cooking"});
  $scope.messages.push({author: "Kivi", text: "#JeSuisCharlie"});

  $scope.message = {};

  $scope.addMessage = function(){
    $scope.message.author = $scope.user.name;
    $scope.messages.push($scope.message);
    $scope.message = {};
  }
})

.controller('HomeCtrl', function($scope, $ionicLoading, Menu) {
  Menu.show();
  $scope.users = [];
  $scope.users.push({name: "Papa", img: "img/papa.jpg", icon:"busy", status:"I love this app"});
  $scope.users.push({name: "PP", img:"img/pp.png", icon:"busy", status:"I like to move it move it"});
  $scope.users.push({name: "Pauline", img:"img/pauline.jpg", icon:"busy", status:"I am cooking"});
  $scope.users.push({name: "Kivi", img:"img/kivi.jpeg", icon:"busy", status:"#JeSuisCharlie"});
})

.controller('MenuCtrl', function($scope, $ionicLoading, Menu) {
  Menu.show();
})

.controller('NotificationsCtrl', function($scope, $ionicLoading, Menu) {
  Menu.show();

  $scope.notifications = [
    {_id: '123', text: 'Wow John this is a long text it might be messy.', author: 'John', type:'message'},
    {_id: '1234', text: 'notif2', author: 'PP', type:'message'},
    {_id: '255', text: 'notif3', author: 'Michel', type:'person'}
  ];

  $scope.enter = function(){
    $scope.notifications.unshift({_id: '45', text: 'new Notif', author: 'Michel', type:'person'});
  };

  $scope.leave = function(){
    $scope.onSwipeRight('1234');
  };

  $scope.move = function(){
    $scope.notifications[1].text = "Sa mere";
  };

  $scope.onSwipeRight = function(id){
    $scope.notifications.forEach(function(e,i){
      if(e._id == id){
        $scope.notifications.splice(i,1);
        return false;
      }
    });
  };
})
.controller('ProfilePictureCtrl',function($scope, $ionicPopup, $cordovaCamera, $cordovaImagePicker, User) {
  // Triggered on a button click, or some other target
  $scope.showPopup = function() {
    // An elaborate, custom popup
    var myPopup = $ionicPopup.show({
      title: 'Choose a new picture',
      scope: $scope,
      buttons: [
      {
        text: '<b>Choose a picture</b>',
        type: 'button-positive',
        onTap: function(e) {
          return 'choose';
        }
      },
      {
        text: '<b>Take a picture</b>',
        type: 'button-positive',
        onTap: function(e) {
          return 'take';
        }
      }]
    });
    myPopup.then(function(res) {
      if(res === 'choose'){
       var options = {
         maximumImagesCount: 1,
         width: 800,
         height: 800,
         quality: 80
       };

       $cordovaImagePicker.getPictures(options)
       .then(function (results) {
          $scope.user.img = results[0];
        }, function(error) {
          // error getting photos
        });
     }

     if(res === 'take'){
       $scope.imgUri = "take";
       document.addEventListener("deviceready", function () {
         var options = {
           quality: 50,
           destinationType: Camera.DestinationType.DATA_URL,
           sourceType: Camera.PictureSourceType.CAMERA,
           allowEdit: true,
           encodingType: Camera.EncodingType.JPEG,
           targetWidth: 200,
           targetHeight: 200,
           popoverOptions: CameraPopoverOptions,
           saveToPhotoAlbum: false,
           correctOrientation: true
         };

         $cordovaCamera.getPicture(options).then(function(imageURI) {
          $scope.user.img = "data:image/jpeg;base64," + imageURI;
        }, function(err) {
         $scope.imgUri = "not working :(";
           $scope.img = err;
         });
       }, false);
     }
   });
  };
})

.controller('SharingCtrl', function($scope, $ionicLoading, Menu){
  Menu.show();
})

.controller('StatusCtrl', function($scope, $ionicLoading, User){
  $scope.user = User.getCurrent();
  $scope.whereami = '0';

  $scope.toggleBusy = function(){
    $scope.user = User.toggleBusy();
  }
})

.filter('isMine', function (User) {
  return function (input) {
    return User.getCurrent().name === input;
  };
})

.filter('isNotMine', function (User) {
  return function (input) {
    return User.getCurrent().name !== input;
  };
})

.filter('isPersonType', function(){
  return function (input) {
    return input.type === 'person';
  };
})

.filter('isMessageType', function(){
  return function (input) {
    return input.type === 'message';
  };
});