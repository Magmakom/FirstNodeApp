app.controller('registerCtrl', function($scope, $http, Auth){
	$scope.user = {};
	$scope.alerts = [];
	$scope.signUp = function(){
		Auth.createUser($scope.user)
			.then(function (data) {
				console.log('success');
				$scope.alerts = [];
				$scope.alerts.push({ type : 'success', msg : 'Registration successful! We will send You email notification about approving' });
			}, function(error){
				console.log('error');
				$scope.alerts = [];
				$scope.alerts.push({ type : 'danger', msg : 'Authentication failed. ' + error });
			}
		);
	};
	$scope.closeAlert = function(index) {
		$scope.alerts.splice(index, 1);
	};
});