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
  var PATH_ALBUM = '/albums/';
  var PATH_ALBUMS = '/albums';
  var PATH_ALBUM_IMGS = '/images';
  var PATH_FAMILY = '/family';
  var PATH_FRIEND = '/friends';
  var PATH_REQUEST = '/requests/';
  var PATH_REQUESTS = '/requests';
  var PATH_MESSAGES = '/messages';

  function acceptFamily(request){
    var houseId = UserConnected.getHouseId();
    ref.child(houseId + PATH_FAMILY).push(request.$value);
    Users.addHouse(request.$value,houseId);
    ref.child(houseId + PATH_REQUEST + request.$id).remove();
  }

  function acceptFriend(request){
    var houseId = UserConnected.getHouseId();
    ref.child(houseId + PATH_FRIEND).push(request.$value);
    Users.addHouse(request.$value,houseId);
    ref.child(houseId + PATH_REQUEST + request.$id).remove();
  }

  function addAlbumImage(album,img){
    var houseId = UserConnected.getHouseId();
    ref.child(houseId + PATH_ALBUM + album + PATH_ALBUM_IMGS).push(img);
    //ref.child("https://smartfamily.firebaseio.com/houses/first/albums/-Jm9zO2kzdJ9GyzMBlL7/images").push(img);
  }

  function createAlbum(newalbum){
    var houseId = UserConnected.getHouseId();
    newalbum.img = 'img/albums/empty.png';
    newalbum.creationDate = Date.now();
    ref.child(houseId + PATH_ALBUM + newalbum.title).set(newalbum);
  }

  function getAlbum(id){
    return $firebaseObject(ref.child(UserConnected.getHouseId() + PATH_ALBUM + id)).$loaded();
  }

  function getAlbums(){
    return $firebaseArray(ref.child(UserConnected.getHouseId() + PATH_ALBUMS)).$loaded();
  }

  function getAlbumPictures(id){
    return $firebaseArray(ref.child(UserConnected.getHouseId() + PATH_ALBUM + id + PATH_ALBUM_IMGS)).$loaded();    
  }

  function getFamilyUsers(){
    return $firebaseArray(ref.child(UserConnected.getHouseId() + PATH_FAMILY)).$loaded().then(function(users){
        var usersWithDetails = [];
        _.each(users, function(user){
          Users.get(user.$value).then(function(userDetails){
            usersWithDetails.push(userDetails);
          });
        });
        return usersWithDetails;
      });
  }

  function getConversation(){
    return $firebaseArray(ref.child(UserConnected.getHouseId() + PATH_MESSAGES)).$loaded();
  }

  function getRequests(){
    return $firebaseArray(ref.child(UserConnected.getHouseId() + PATH_REQUESTS)).$loaded();
  }

  function rejectRequest(id){
    ref.child(UserConnected.getHouseId() + PATH_REQUEST + id).remove();
  }

  function sendMessage(mess){
    ref.child(UserConnected.getHouseId() + PATH_MESSAGES).push(mess);
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
    acceptFamily: acceptFamily,
    acceptFriend: acceptFriend,
    addAlbumImage: addAlbumImage,
    createAlbum: createAlbum,
    getAlbum: getAlbum,
    getAlbums: getAlbums,
    getAlbumPictures: getAlbumPictures,
    getFamilyUsers: getFamilyUsers,
    getConversation: getConversation,
    getRequests: getRequests,
    rejectRequest: rejectRequest,
    sendMessage: sendMessage,
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

  function request(housetag, userId){
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
          user.img = 'img/profile/no-profile.jpg';
          user.status= 'Just arrived ;)';
          // Add to firebase users
          ref.child(user.name).set(user);
          return true;
        } else {
          return false;
        }
      });
  }

  function requestHouse(housetag){
    Houses.request(housetag,getId());
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
    requestHouse: requestHouse,
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

  function getImg(id){
   return $firebaseObject(ref.child(id + '/img')).$loaded(); 
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
    getImg: getImg,
    setProfilePicture: setProfilePicture,
    toggleBusy: toggleBusy
  };
});