app.service('Activator', function ($http, $q, Router) {
	this.activity = function(user) {
		var deferred = $q.defer();
		$http.post(Router.get('activateUser'), {
			id : user._id,
			status : user.status
		})
		.success(function(data){
			deferred.resolve(data);
		})
		.error(function(err) {
			deferred.reject(err);
		})
		return deferred.promise;
	}
})