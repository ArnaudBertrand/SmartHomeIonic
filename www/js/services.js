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

.factory('Family', function($window){
  var family = [];
  family.push({_id: 0, name: "Papa", img: "img/papa.jpg", busy: 0, status:"I love this app"});
  family.push({_id: 1, name: "PP", img:"img/pp.png", busy: 1, status:"I like to move it move it"});
  family.push({_id: 2, name: "Pauline", img:"img/pauline.jpg", busy: 0, status:"I am cooking"});
  family.push({_id: 3, name: "Kivi", img:"img/kivi.jpeg", busy: 0, status:"#JeSuisCharlie"});

  function add(userEntry){
    family.push(userEntry);
  }

  function getFamily(){
    return family;
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
    getFamily: getFamily,
    size: size,
    update: update
  };
})

.factory('Houses', function(UserConnected, $firebaseObject, $firebaseArray){
  var ref = new Firebase("https://smartfamily.firebaseio.com/houses/");
  function createHouse(house){
    house.members = [];
    if(UserConnected.getId()){
      UserConnected.get().then(function(curUser){
        curUser.role = 'admin';
        house.members = 1;
        house.friends = 0;
        ref.child(house.id).set(house);
        UserConnected.addHouse(house);
      });
    }
  }

  function find(housetag){
    return $firebaseObject(ref.child(housetag)).$loaded();
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
    createHouse: createHouse,
    find: find,
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

.factory('UserConnected', function($window, $firebaseArray, $firebaseObject, Family){
  var ref = new Firebase("https://smartfamily.firebaseio.com/users/");

  function addHouse(house){
    var id = getId();
    if(id){
      ref.child(id + '/houses').push(house);
    }
  }

  function connect(house){
    $window.localStorage.setItem('currentHouse', house);
  }

  function get(){
    return $firebaseObject(ref.child(getId())).$loaded();
  }

  function getHouses(){
    return $firebaseArray(ref.child(getId() + '/houses')).$loaded();
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
    user.img = img;
    Fanily.update(user);
  }

  function toggleBusy (){
    var user = JSON.parse($window.localStorage.getItem('user'));
    user.busy = 1 - user.busy;
    Family.update(user);
    $window.localStorage.setItem('user', JSON.stringify(user));
    return JSON.parse($window.localStorage.getItem('user'));
  }

  return{
    addHouse: addHouse,
    connect: connect,
    get: get,
    getHouses: getHouses,
    getId: getId,
    login: login,
    register: register,
    setProfilePicture: setProfilePicture,
    toggleBusy: toggleBusy
  };
});