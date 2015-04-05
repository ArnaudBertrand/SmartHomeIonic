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

  var houseSelected = 0;

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
    houseSelected = index;
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

.controller('HouseSearchCtrl', function($scope, $state, Houses, Menu) {
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
      Houses.request($scope.house.id);      
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

.controller('SharingCtrl', function($scope, $ionicLoading, Menu){
  Menu.show();
  $scope.galleries = [];
  $scope.galleries.push({name: "All albums", img: "img/sharing/little-girl.jpg", creationDate: Date.now()});
  $scope.galleries.push({name: "France tour", img: "img/sharing/paris.jpg", creationDate: Date.now()});
  $scope.galleries.push({name: "Italy tour", img: "img/sharing/rome.jpg", creationDate: Date.now()});
})

.controller('StatusCtrl', function($scope, $ionicLoading, UserConnected, Menu){
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
  }
})

.controller('TaskListCtrl', function($scope, $ionicLoading, Menu){
  Menu.show();
  $scope.tasks = [];
  $scope.task = {};

  $scope.isShowingAddTask = false;

  $scope.toggleAddTask = function (){
    $scope.isShowingAddTask = $scope.isShowingAddTask ? false: true;
  }

  $scope.addTask = function(){
    var random = Math.floor(Math.random()*100000);
    $scope.task._id = random;
    $scope.tasks.push($scope.task);
    $scope.task = {};
    $scope.isShowingAddTask = false;
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

  $scope.taskDone = function(){
    $scope.tasks.forEach(function(task){
      if(task.selected){
        task.done = true;
      }
    });
    console.log('test');
    resetSelection();
  }

  $scope.editTasks = function (){
    $scope.editing = true;
  }

  $scope.finishEdit = function(){
    resetSelection();
    $scope.editing = false;
  }

  $scope.toggleSelect = function(task){
    task.selected = task.selected ? false : true;
  }

  function resetSelection(task){
    $scope.tasks.forEach(function(task){
      task.selected = false;
    });
  }

  // Test
  $scope.tasks.push({_id: "id1", text: "Make the laundry", user:'Arnaud', done:true});
  $scope.tasks.push({_id: "id2", text: "Wash dishes", user:'Emily'});
  $scope.tasks.push({_id: "id2", text: "Gimme some money !", user:'Emily'});
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