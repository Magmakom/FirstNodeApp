app.controller('registerCtrl', function($scope, $http, Auth){
	$scope.model = {
		user : {},
		alerts : [],
		formView : true
	}
	
	$scope.signUp = function(){
		$scope.model.formView = false;
		delete $scope.model.user.confirmPassword;
		Auth.createUser($scope.model.user)
			.then(function (data) {
				console.log('success');
				$scope.alerts = [];
				$scope.alerts.push({ type : 'success', msg : 'Registration successful! We will send You email notification about approving' });
			}, function(error){
				console.log('error');
				$scope.alerts = [];
				$scope.alerts.push({ type : 'danger', msg : 'Authentication failed. ' + error.message });
			}
		);
	};
	$scope.closeAlert = function(index) {
		$scope.model.formView = true;
		$scope.alerts.splice(index, 1);
	};
});
