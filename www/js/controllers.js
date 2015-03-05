angular.module('sh.controllers', [])

.controller('ConnexionCtrl', function($scope, $log, $state,User){
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

.controller('HomeCtrl', function($scope, $ionicLoading) {
  $scope.users = [];
  $scope.users.push({name: "Papa", img: "img/papa.jpg", icon:"busy", status:"I love this app"});
  $scope.users.push({name: "PP", img:"img/pp.png", icon:"busy", status:"I like to move it move it"});
  $scope.users.push({name: "Pauline", img:"img/pauline.jpg", icon:"busy", status:"I am cooking"});
  $scope.users.push({name: "Kivi", img:"img/kivi.jpeg", icon:"busy", status:"#JeSuisCharlie"});
})

.controller('StatusCtrl', function($scope, $ionicLoading, User){
  $scope.user = User.getCurrent();
  $scope.whereami = '0';

  $scope.toggleBusy = function(){
    $scope.user = User.toggleBusy();
    console.log($scope.user);
  }
})

.controller('ConversationCtrl', function($scope, $log){
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

.filter('isMine', function (User) {
  return function (input) {
    return User.getCurrent().name === input;
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
           saveToPhotoAlbum: false
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
});