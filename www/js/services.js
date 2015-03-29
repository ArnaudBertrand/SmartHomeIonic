angular.module('sh.services', [])

.factory('Conversation', function($q){
  var messages = [];
  
  messages.push({author: {name: "Papa", img: "img/papa.jpg"}, text: "I love this app", date: Date.now() });
  messages.push({author: {name: "PP", img:"img/pp.png"}, text: "I like to move it move it", date: Date.now() });
  messages.push({author: {name: "Pauline", img:"img/pauline.jpg"}, text: "Let's try a very very long long long message message message message", date: Date.now() });
  messages.push({author: {name: "Kivi", img:"img/kivi.jpeg"}, text: "#JeSuisCharlie",  date: Date.now() });

  return {
    getMessages: function(){
      return messages;
    },
    addMessage: function(message){
      messages.push(message);
    }
  }
})

.factory('Family', function($window, $firebaseArray, $firebaseObject, UserConnected, Users){
  var ref = new Firebase("https://smartfamily.firebaseio.com/houses/");
  var family = [];
  family.push({_id: 0, name: "Papa", img: "img/papa.jpg", busy: 0, status:"I love this app"});
  family.push({_id: 1, name: "PP", img:"img/pp.png", busy: 1, status:"I like to move it move it"});
  family.push({_id: 2, name: "Pauline", img:"img/pauline.jpg", busy: 0, status:"I am cooking"});
  family.push({_id: 3, name: "Kivi", img:"img/kivi.jpeg", busy: 0, status:"#JeSuisCharlie"});

  function acceptFamily(request){
    var houseId = UserConnected.getHouseId();
    ref.child(houseId + '/family').push(request.$value);
    Users.addHouse(request.$value,houseId);
    ref.child(houseId + '/requests/' + request.$id).remove();
  }

  function acceptFriend(request){
    var houseId = UserConnected.getHouseId();
    ref.child(houseId + '/friends').push(request.$value);
    Users.addHouse(request.$value,houseId);
    ref.child(houseId + '/requests/' + request.$id).remove();
  }

  function add(userEntry){
    family.push(userEntry);
  }

  function getFamilyUsers(){
    return $firebaseArray(ref.child(UserConnected.getHouseId() + '/family')).$loaded().then(function(users){
        var usersWithDetails = [];
        _.each(users, function(user){
          console.log(user.$value);
          Users.get(user.$value).then(function(userDetails){
            usersWithDetails.push(userDetails);
          });
        });
        return usersWithDetails;
      });
  }

  function getRequests(){
    return $firebaseArray(ref.child(UserConnected.getHouseId() + '/requests')).$loaded();
  }

  function rejectRequest(id){
    ref.child(UserConnected.getHouseId() + '/requests/' + id).remove();
  }

  function size(){
    return family.length;
  }

  function update(user){
    var userIndex = -1;
    family.forEach(function(e,i){
      if(e._id == user.id){
        userIndex = i;
      }
    })
    if(userIndex != -1){
      family.splice(index,1,user);
    }
  }

  return {
    add: add,
    acceptFamily: acceptFamily,
    acceptFriend: acceptFriend,
    getFamilyUsers: getFamilyUsers,
    getRequests: getRequests,
    rejectRequest: rejectRequest,
    size: size,
    update: update
  };
})

.factory('Houses', function($firebaseObject, $firebaseArray){
  var ref = new Firebase("https://smartfamily.firebaseio.com/houses/");
  function addFamily(housetag,userid){
    ref.child(housetag + '/family').push(userid);
  }

  function addFriend(housetag,userid){
    ref.child(housetag + '/friends').push(userid);
  }

  function createHouse(house){
    ref.child(house.id).set(house);
  }

  function find(housetag){
    return $firebaseObject(ref.child(housetag)).$loaded();
  }

  function get(id){
    return $firebaseObject(ref.child(id)).$loaded()
  }

  function request(housetag){
    console.log('test');
    var userId = UserConnected.getId();
    $firebaseArray(ref.child(housetag + '/requests')).$loaded().then(function(requests){
      if(!_.contains(requests,userId)){
        ref.child(housetag + '/requests').push(userId);
      }
    });
  }

  return {
    addFamily: addFamily,
    addFriend:addFriend,
    createHouse: createHouse,
    find: find,
    get: get,
    request: request
  }
})

.factory('Menu', function(){
  var displayed = false;

  function show(){
    displayed = true;
  }

  function hide(){
    displayed = false;
  }

  function isDisplayed(){
    return displayed;
  }

  return {
    show: show,
    hide: hide,
    isDisplayed: isDisplayed
  }
})

.factory('UserConnected', function($window, $firebaseArray, $firebaseObject, Users, Houses){
  var ref = new Firebase("https://smartfamily.firebaseio.com/users/");

  function addHouse(housetag){
    var id = getId();
    if(id){
      Users.addHouse(id,housetag);
      Houses.addFamily(housetag,id);
    }
  }

  function changeStatus(status, location){
    Users.changeStatus(getId(),status,location);
  }

  function connect(house){
    $window.localStorage.setItem('currentHouse', house);
  }

  function createHouse(house){
    if(getId()){
      Houses.createHouse(house)
      addHouse(house.id);
    }
  }

  function get(){
    return Users.get(getId());
  }

  function getHouses(){
    return Users.getHouses(getId());
  }

  function getHouse(){
    return Houses.get(getHouseId());
  }

  function getHouseId(){
    return $window.localStorage.getItem('currentHouse');
  }

  function getId(){
    return $window.localStorage.getItem('userConnected');
  }

  function login (user){
    // Login
    return $firebaseObject(ref.child(user.name)).$loaded()
      .then(function(currentUser){
        if(currentUser && currentUser.password === user.password){
          $window.localStorage.setItem('userConnected', currentUser.name);
          return true;
        } else {
          return false;
        }
      });
  }

  function register (user){
    return $firebaseObject(ref.child(user.name)).$loaded()
      .then(function(checkUser){
        if(checkUser.$value === null){
          // Add basic informations
          delete user["confirmPassword"];
          user.busy = 0;
          user.img = 'img/no-profile.jpg';
          user.status= 'Just arrived ;)';
          // Add to firebase users
          ref.child(user.name).set(user);
          return true;
        } else {
          return false;
        }
      });
  }

  function setProfilePicture(img){
    Users.setProfilePicture(getId(),img);
  }

  function toggleBusy (){
    Users.toggleBusy(getId());
  }

  return{
    addHouse: addHouse,
    changeStatus: changeStatus,
    connect: connect,
    createHouse: createHouse,
    get: get,
    getHouses: getHouses,
    getHouse: getHouse,
    getHouseId: getHouseId,
    getId: getId,
    login: login,
    register: register,
    setProfilePicture: setProfilePicture,
    toggleBusy: toggleBusy
  };
})

.factory('Users', function($window, Houses, $firebaseArray, $firebaseObject){
  var ref = new Firebase("https://smartfamily.firebaseio.com/users/");

  function addHouse(id,housetag){
    ref.child(id + '/houses').push(housetag);
  }

  function changeStatus(id,status,location){
    ref.child(id + '/status').set(status);
    ref.child(id + '/location').set(location);
  }

  function get(id){
    return $firebaseObject(ref.child(id)).$loaded();
  }

  function getHouses(id){
    return $firebaseArray(ref.child(id + '/houses')).$loaded().then(function(houses){
        var housesDetails = [];
        console.log(houses);
        _.each(houses, function(house){
          Houses.get(house.$value).then(function(houseDetails){
            housesDetails.push(houseDetails);
          });
        });
        return housesDetails;

      });
  }

  function setProfilePicture(id,img){
    //user.img = img;
    //Fanily.update(user);
  }

  function toggleBusy (id){
    $firebaseObject(ref.child(id + '/busy'))
      .$loaded()
      .then(function(busy){
        if(busy.$value === false){
          ref.child(id + '/busy').set(true);
        } else {
          ref.child(id + '/busy').set(false);
        }
      });
  }

  return{
    addHouse: addHouse,
    changeStatus: changeStatus,
    get: get,
    getHouses: getHouses,
    setProfilePicture: setProfilePicture,
    toggleBusy: toggleBusy
  };
});