app.controller('passwordCtrl', function($scope, $routeParams, Auth, $cookies, $location){
	$scope.model = {
		view : true,
		isToken : false
	};
	$scope.alerts = [];
	if ($routeParams.token) {
		$scope.model.isToken = true;
		var now = new Date();
		$cookies.put('token', $routeParams.token, {
			expires: new Date(now.getFullYear(), now.getMonth()+1, now.getDate()).toString()
		});
		//$location.url('/user');
	}
	$scope.submitEmail = function(form) {
		Auth.sendPasswordEmail($scope.model.email)
			.then(function(data) {
				console.log(data);
				$scope.model.view = false;
				$scope.alerts.push({type: 'success', msg: 'Redirection to Change password have been sended. Check your email'});
			}, function (err) {
				console.log(err);
				$scope.model.view = false;
				$scope.alerts.push({type: 'danger', msg: 'Sending failed. ' + err.message});
			}
		);
	};
	$scope.submitPasswordChange = function(form) {
		Auth.newPassword($scope.model.newPass)
			.then(function(data) {
				console.log(data);
				$scope.model.view = false;
				$location.url('/login/' + data.token);
			}, function (err) {
				$scope.model.view = false;
				$scope.alerts.push({type: 'danger', msg: 'Changing failed ' + err.message});
			}
		);
	}
	$scope.closeAlert = function(index) {
		$scope.model.view = true;
		$scope.alerts.splice(index, 1);
	};
});