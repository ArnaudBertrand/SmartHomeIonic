angular.module('sh.services', [])

.factory('User', function($window){
  return {
    getCurrent: function () {
      // Temporary
      var user = JSON.parse($window.localStorage.getItem('user'));
      return user;
    },
    insertOrUpdate: function(userEntry){
      user = userEntry;
      $window.localStorage.setItem('user', JSON.stringify(user));
    },
    login: function(user){
      // Complete default info
      user.busy = 0;
      user.img = 'http://placehold.it/300x300';
      user.status= 'Just arrived ;)';

      // Store
      $window.localStorage.setItem('user', JSON.stringify(user)); 
    },
    toggleBusy: function(){
      var user = JSON.parse($window.localStorage.getItem('user'));
      user.busy = 1 - user.busy;
      $window.localStorage.setItem('user', JSON.stringify(user));
      return JSON.parse($window.localStorage.getItem('user'));
    }
  };  
})

.factory('Camera', ['$q', function($q){
  return {
    getPicture: function(options) {
      var q = $q.defer();
      
      navigator.camera.getPicture(function(result) {
        // Do any magic you need
        q.resolve(result);
      }, function(err) {
        q.reject(err);
      }, options);
      
      return q.promise;
    }
  }
}]);