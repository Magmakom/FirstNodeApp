app.controller('loginCtrl', function($scope, $rootScope, $http, $location, Auth, $routeParams,$cookies){
	$scope.user = {};
	$scope.alerts = [];
	console.log($routeParams.token);
	if ($routeParams.token) {
		var now = new Date();
		$cookies.put('token', $routeParams.token, {
			expires: new Date(now.getFullYear(), now.getMonth()+1, now.getDate()).toString()
		});
		$location.url('/user');
	}
	$scope.login = function(){
		Auth.login($scope.user)
			.then(function (data) {
				console.log('success');
				if (Auth.isAdmin()) {
					console.log('go to user');
					$location.url('/admin/users');
				}
				if (Auth.isUser()) {
					console.log('go to admin');
					$location.url('/user');
				} 

			}, function (error) {
				console.log('error');
				$scope.alerts = [];
				$scope.alerts.push({ type : 'danger', msg : 'Authentication failed.' });
			}
		);
	};
	$scope.closeAlert = function(index) {
		$scope.alerts.splice(index, 1);
	};

});