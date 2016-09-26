app.factory('User', function($http, $cookies, $q, Router){
	return {
    	get: function () {
            var deferred = $q.defer();
            $http(
            {
                method: 'GET',
                url: Router.get('role'),
                headers: {
                    'x-access-token': $cookies.get('token')
                }
            })
            .success(function(data) {
                console.log(data);
                deferred.resolve(data);
            }).error(function (err) {
                deferred.reject(err);
            });
            return deferred.promise;
        }
	};
});