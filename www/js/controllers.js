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

.controller('AlbumCtrl', function($scope, $ionicLoading, $stateParams, $cordovaImagePicker, $cordovaCamera, $state, $ionicModal, Menu, Family){
  Menu.show();
  $scope.gallery = [];
  $scope.album = { title: 'test'};

  Family.getAlbumPictures($stateParams.id).then(function(pictures){
    $scope.gallery = pictures;
  });

  Family.getAlbum($stateParams.id).then(function(album){
    $scope.album = album;
  });

  $scope.closeModal = function(){
    $scope.modal.hide();
    $scope.modal.remove()
  }

  $scope.goBack = function (){
    $state.go('sharing');
  }

  $scope.showImage = function(index){
    $scope.activeSlide = index;
    $scope.showModal('templates/album-image.html');
  }

  $scope.showModal = function(templateUrl){
    $ionicModal.fromTemplateUrl(templateUrl, {scope: $scope, animation:'slide-in-up'})
      .then(function(modal){
        $scope.modal = modal;
        $scope.modal.show();
      });
  }

  $scope.takePicture = function(){
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
        Family.addAlbumImage($scope.album.title,"data:image/jpeg;base64," + imageURI);
      }, function(err) {});
  }

  $scope.upload = function (){
    var options = {
      quality: 75,
      targetWidth: 500,
      targetHeight: 500,
    };

    $cordovaImagePicker.getPictures(options)
      .then(function (results) {
        $scope.uploaded = results;
        _.each(results, function(img){
          Family.addAlbumImage($scope.album.$id,img);
        });
      }, function(error) {});    
  }
})

.controller('CalendarCtrl', function($scope, $ionicLoading, Menu){
  Menu.show();
  $('#calendar').fullCalendar({
    dayClick: function() {
        alert('a day has been clicked!');
    }
  });
})

.controller('ConnexionCtrl', function($scope, $log, $state, UserConnected, Menu){
  Menu.hide();
  $scope.user = { 
    name: '',
    password: '',
    confirmPassword: ''
  }

  $scope.registration = false;
  $scope.errorMsg = '';
  
  // Log in the user
  $scope.login = function (user) {
    UserConnected.login(user).then(function(success){
      if(success){
        $state.go('houseChoice');
      } else{
        $scope.errorMsg = 'Wrong username or password';
      }
    });
  };

  $scope.register = function(user){
    if(user.password === user.confirmPassword){
      UserConnected.register(user).then(function(registred){
        if(registred){
          $scope.login(user);
        } else {
          $scope.errorMsg = 'Username already in use';
        }
      });
    } else {
      $scope.errorMsg = 'Passwords not matching';
    }
  };

  // Set registrations
  $scope.setRegistration = function (bool){
    $scope.registration = bool;
  };
})

.controller('ConversationCtrl', function($scope, $log, Menu, UserConnected, Family){
  Menu.show();
  $scope.messages = [];
  var family = [];

  Family.getConversation().then(function(mess){
    $scope.messages = mess;
  });

  Family.getFamilyUsers().then(function(users){
    family = users;
  });

  $scope.getImage = function(author) {
    var img = '';
    _.each(family,function(user){
      if(user.$id === author){
        img = user.img;
        return;
      }
    });
    return img;
  };

  $scope.message = {};
  $scope.addMessage = function(){
    $scope.message.author = UserConnected.getId();;
    $scope.message.date = Date.now();
    Family.sendMessage($scope.message);
    $scope.message = {};
  };
})

.controller('HomeCtrl', function($scope, $ionicLoading, Menu, Family) {
  Menu.show();
  $scope.users = [];
  Family.getFamilyUsers().then(function(users){
    $scope.users = users;
  });
})

.controller('HouseChoiceCtrl', function($scope, $state, $ionicLoading, UserConnected, Houses, Menu) {
  Menu.hide();
  $scope.houses = {};
  UserConnected.getHouses().then(function(houses){
    console.log(houses);
    $scope.houses = houses;
  });

  var houseSelected = -1;

  $scope.connect = function (houseid){
    UserConnected.connect(houseid);
    $state.go('home');
  }

  $scope.createHouse = function(){
    $state.go('houseCreate');
  }

  $scope.isHouseSelected = function (index){
    return houseSelected === index;
  }

  $scope.searchHouse = function(){
    $state.go('houseSearch');
  }

  $scope.setHouseSelected = function (index){    
    houseSelected = houseSelected === index ? -1 : index;
  }
})

.controller('HouseCreateCtrl', function($scope, $state, $ionicLoading, Houses, UserConnected, Menu) {
  Menu.hide();
  $scope.house = {id: '', name: '', city: ''};
  $scope.error = {};

  $scope.cancel = function(){
    $state.go('houseChoice');
  }

  $scope.createHouse = function (){
    $scope.error = {};
    if($scope.house.id === ''){
      $scope.error.id = 'Please enter an ID for your house.';
    }

    if($scope.house.name === ''){
      $scope.error.name = 'Please enter a house name.';
    }

    if($scope.house.city === ''){
      $scope.error.city = 'Please enter city name.';
    }

    if(_.size($scope.error) === 0){
      Houses.find($scope.house.id).then(function(checkHouse){
        if(checkHouse.$value === null){
          UserConnected.createHouse($scope.house)
          $state.go('houseChoice');
        } else {
          $scope.error.id = 'ID already used';
        }
      });
    }
  }
})

.controller('HouseSearchCtrl', function($scope, $state, Houses, Menu, UserConnected) {
  Menu.hide();
  $scope.search = { id: ''};
  $scope.error = {};

  var requested = false;

  $scope.cancel = function(){
    $state.go('houseChoice');
  }

  $scope.searchHouse = function (){
    $scope.error = {};
    $scope.house = null;
    Houses.find($scope.search.id).then(function(checkHouse){
      if(checkHouse.$value === null){
        $scope.error.id = 'ID not found';
      } else {
        $scope.house = checkHouse;
      }
    });
  }

  $scope.hasBeenRequested = function(){
    return requested;
  }

  $scope.requestHouse = function(){
    if($scope.house.id){
      UserConnected.requestHouse($scope.house.id);      
      requested = true;
    }
  }

  $scope.afterRequest = function (){
    requested = false;
    $state.go('houseChoice');
  }
})

.controller('JoinRequestsCtrl', function($scope, $state, Family, Menu) {
  Menu.show();
  $scope.requests = [];
  
  Family.getRequests().then(function(reqs){
    $scope.requests = reqs;
  });

  $scope.reject = function (request){
    Family.rejectRequest(request.$id);
  }

  $scope.acceptFamily = function (request){
    Family.acceptFamily(request);
  }

  $scope.acceptFriend = function (request){
    Family.acceptFriend(request);
  }
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

.controller('ProfilePictureCtrl',function($scope, $ionicPopup, $cordovaCamera, $cordovaImagePicker, UserConnected) {
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
           UserConnected.setProfilePicture(results[0]);
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
          UserConnected.setProfilePicture("data:image/jpeg;base64," + imageURI);
        }, function(err) {
         $scope.imgUri = "not working :(";
           $scope.img = err;
         });
       }, false);
     }
   });
  };
})

.controller('SettingsCtrl', function($scope, $ionicLoading, Menu){
  Menu.show();
})

.controller('SharingCtrl', function($scope, $ionicLoading, $state, Menu, Family){
  Menu.show();
  $scope.galleries = [];
  $scope.isCreatingAlbum = false;
  $scope.newalbum = {};

  Family.getAlbums().then(function(albums){
    $scope.galleries = albums;
    console.log(albums);
  });

  $scope.createAlbum = function(){
    Family.createAlbum($scope.newalbum);
    $scope.isCreatingAlbum = false;
    $scope.newalbum = {};
  }

  $scope.creatingAlbum = function (val){
    $scope.isCreatingAlbum = val;
  }

  $scope.chooseAlbum = function(album){
    $state.go('album',{id:album.$id});
  }
})

.controller('StatusCtrl', function($scope, $ionicLoading, $state, UserConnected, Menu){
  Menu.show();
  $scope.user = {};
  UserConnected.get().then(function(user){
    $scope.user = user;
  });

  $scope.whereami = '0';

  $scope.toggleBusy = function(){
    UserConnected.toggleBusy();
  }

  $scope.changeStatus = function(){
    UserConnected.changeStatus($scope.user.status, $scope.user.location);
    $state.go('home');
  }
})

.controller('TaskListCtrl', function($scope, $ionicLoading, Menu, Family){
  Menu.show();
  $scope.tasks = [];
  $scope.task = { text: '', users: []};
  $scope.isShowingAddTask = false;
  $scope.isAssigningUsers = false;
  $scope.isFiltering = false;
  $scope.family = [];
  var filterArray = [];

  Family.getFamilyUsers().then(function(users){
    $scope.family = users;
  });

  $scope.addTask = function(){
    var random = Math.floor(Math.random()*100000);
    $scope.task._id = random;
    $scope.tasks.push($scope.task);
    $scope.task = { text: '', users: []};
    $scope.isAssigningUsers = false;
    $scope.isShowingAddTask = false;
  }

  $scope.addUsersTasks = function(val){
    $scope.isAssigningUsers = val;
  }

  $scope.toggleUserTask = function(user){
    if(_.contains($scope.task.users, user)){
      $scope.task.users = _.without($scope.task.users, user);
    } else {
      $scope.task.users.push(user);
    }
  }

  $scope.editTasks = function (){
    $scope.editing = true;
  }

  $scope.filterTasks = function(){
    $scope.isFiltering = !$scope.isFiltering;
  }

  $scope.filterUser = function(user){
    if(_.contains(filterArray, user)){
      filterArray = _.without(filterArray, user);
    } else {
      filterArray.push(user);
    }
  }

  $scope.finishEdit = function(){
    resetSelection();
    $scope.editing = false;
  }

  $scope.removeTasks = function(){
    var newArray = [];
    $scope.tasks.forEach(function(task){
      if(!task.selected){
        newArray.push(task);
      }
    });
    $scope.tasks = newArray;
  }

  function resetSelection(task){
    $scope.tasks.forEach(function(task){
      task.selected = false;
    });
  }

  $scope.taskDone = function(){
    $scope.tasks.forEach(function(task){
      if(task.selected){
        task.done = true;
      }
    });
    console.log('test');
    resetSelection();
  }

  $scope.toggleAddTask = function (){
    $scope.isShowingAddTask = $scope.isShowingAddTask ? false: true;
  }

  $scope.toggleSelect = function(task){
    task.selected = task.selected ? false : true;
  }

  $scope.usersFilter = function(task){
    var success = true;
    if(filterArray.length){
      success = false;
      _.each(filterArray, function(user){
        if(_.contains(task.users, user)){
          success = true;
          return;
        }
      });
    }
    return success;
  }

  // Test
  $scope.tasks.push({_id: "id1", text: "Make the laundry", users:['Arnaud', 'nico'], done:true});
  $scope.tasks.push({_id: "id2", text: "Wash dishes", users:['Emily']});
  $scope.tasks.push({_id: "id2", text: "Kiss grand mummy !", users:['Emily']});
  $scope.tasks.push({_id: "id2", text: "Wash the car"});
})

.filter('isMine', function (UserConnected) {
  return function (input) {
    return UserConnected.getId() === input;
  };
})

.filter('isNotMine', function (UserConnected) {
  return function (input) {
    return UserConnected.getId() !== input;
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