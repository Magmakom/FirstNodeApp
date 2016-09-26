app.factory('Auth', function($rootScope, $http, $cookies, $q, User, Router){
	var currentUser = {

	};
	return {
		login : function(user) {
			console.log('auth');
			var deferred = $q.defer();
			console.log(user);
			$http.post(Router.get('login'), user )
			.success(function (data) {
				var now = new Date();
				$cookies.put('token', data.token, {
					expires: new Date(now.getFullYear(), now.getMonth()+1, now.getDate()).toString()
				});
				currentUser.role = data.role;
				console.log(data.role);
				deferred.resolve(data);
			}).error(function (err) {
				$cookies.remove('token');
				currentUser = {};
				deferred.reject(err);
			})/*.bind(this)*/;
			return deferred.promise;
		},
		logout : function () {
			$cookies.remove('token');
			currentUser = {};
		},
		createUser : function (user, callback) {
			console.log('signup');
			var cb = callback || angular.noop;
			var deferred = $q.defer();
			console.log(user);
			$http.post(Router.get('signup'), user )
			.success(function (data) {
				console.log('signup success');
				deferred.resolve(data);
				return cb();
			}).error(function (err) {
				deferred.reject(err);
				return cb();
			})/*.bind(this)*/;
			return deferred.promise;
		},
		changePassword: function(oldPassword, newPassword, callback) {

		},
		getCurrentUser: function() {
        	return currentUser;
      	},
      	setCurrentUser : function(user) {
      		currentUser = user;
      	},
      	isLoggedIn: function() {
			return currentUser.hasOwnProperty('role');
		},
		isAdmin: function() {
			return currentUser.role === 'admin';
		},
		isUser: function() {
			return currentUser.role === 'user';
		},
		getToken: function() {
			return $cookieStore.get('token');
		}
	};
});