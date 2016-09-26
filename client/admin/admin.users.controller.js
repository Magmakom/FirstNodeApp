app.controller('adminUsersCtrl', function($scope, $http, Auth, $location, Activator, Router, $uibModal){
	$scope.model = {
		search : '',
		users : [],
		userMap : {},
		sortKey : 'id', // set the default sort type
  		reverse : false  // set the default sort order
	}
	$scope.alerts = [];
	$http.get(Router.get('users')).success(function(response){ 
		$scope.model.usersMap = response;  //ajax request to fetch data into $scope.data
		console.log(response);
        for (var key in $scope.model.usersMap) { 
            $scope.model.usersMap[key]['details'] = false;
        	$scope.model.users.push($scope.model.usersMap[key]);
        }
    });

    $scope.openDetails = function (userModel) {
        console.log(userModel);
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'userDetailsModal.html',
            controller: 'UserDetailsCtrl',
            resolve: {
                model: function () {
                    return userModel;
                }
            }
        }).result.then(function (result) {
            // $ctrl.selected = selectedItem;
        }, function (result) {
            console.log('closed!');
        });
    };

    $scope.showDetails = function (user) {
        user.details = !user.details;
    }
	$scope.sort = function(keyname){
        $scope.model.sortKey = keyname;   //set the sortKey to the param passed
        $scope.model.reverse = !$scope.model.reverse; //if true make it false and vice versa
    }
    $scope.logout = Auth.logout;
    $scope.approve = function(id) {
    	var user = angular.copy($scope.model.usersMap[id]);
    	user.status = 'approved';
    	Activator.activity(user).then( function (data) {
    		$scope.model.usersMap[id].status = 'approved';
    	}, function (err){
    		$scope.alerts.push({ type : 'danger', msg : 'Approving failed.' });
    	});
    }
    $scope.reject = function(id) {
        var user = angular.copy($scope.model.usersMap[id]);
        user.status = 'rejected';
        Activator.activity(user).then( function (data) {
            $scope.model.usersMap[id].status = 'rejected';
        }, function (err){
            $scope.alerts.push({ type : 'danger', msg : 'Rejection failed.' });
        });
    }
    $scope.closeAlert = function(index) {
		$scope.alerts.splice(index, 1);
	};
});


app.controller('UserDetailsCtrl', function ($uibModalInstance, $uibModal, model, $scope, Activator) {
    console.log(model);
    $scope.model = model;
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.approve = function(id) {
        var user = angular.copy($scope.model);
        user.status = 'approved';
        Activator.activity(user).then( function (data) {
            $scope.model.status = 'approved';
            $scope.openDetails({ type: 'success', message : 'User successfully approved' });
            $uibModalInstance.dismiss('cancel');
        }, function (err){
            $scope.openDetails({ type: 'success', message : 'Approving failed.' + err });
            $uibModalInstance.dismiss('cancel');
        });
    }
    $scope.reject = function(id) {
        var user = angular.copy($scope.model);
        user.status = 'rejected';
        Activator.activity(user).then( function (data) {
            $scope.model.status = 'rejected';
            $scope.openDetails({ type: 'success', message : 'User successfully rejected' });
            $uibModalInstance.dismiss('cancel');
        }, function (err){
            $scope.openDetails({ type: 'success', message : 'Approving failed.' + err });
            $uibModalInstance.dismiss('cancel');
        });
    }

    $scope.openDetails = function (resultModel) {
        console.log(resultModel);
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'resultModal.html',
            controller: 'ResultModalCtrl',
            size : 'sm',
            resolve: {
                model: function () {
                    return resultModel;
                }
            }
        }).result.then(function (result) {
            // $ctrl.selected = selectedItem;
        }, function (result) {
            console.log('closed!');
        });
    };
});

app.controller('ResultModalCtrl', function($uibModalInstance, model, $scope){
    $scope.model = model;
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});