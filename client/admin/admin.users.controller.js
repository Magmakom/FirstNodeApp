app.controller('adminUsersCtrl', function($scope, $http, Auth, $location, Activator, Router, $uibModal){
	$scope.model = {
		search : '',
		users : [],
		userMap : {},
		sortKey : 'id', // set the default sort type
  		reverse : false,  // set the default sort order
        currentPage : 1
	}
	$scope.alerts = [];
	$http.get(Router.get('users')).success(function(response){ 
		$scope.model.usersMap = response;  //ajax request to fetch data into $scope.data
		console.log(response);
        for (var key in $scope.model.usersMap) { 
            $scope.model.usersMap[key]['details'] = false;
        	$scope.model.users.unshift($scope.model.usersMap[key]);
        }
    });

    $scope.openDetails = function ($event,userModel) {
        console.log($event.currentTarget);
        console.log(userModel);
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'userDetailsModal.html',
            controller: 'UserDetailsCtrl',
            size : 'lg',
            resolve: {
                model: function () {
                    return userModel;
                }
            }
        }).result.then(function (result) {
        }, function (result) {
            console.log('closed!');
        });
    };
    $scope.openResult = function (resultModel) {
        console.log(resultModel);
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'resultModal.html',
            controller: 'CaseResultModalCtrl',
            size : 'sm',
            resolve: {
                model: function () {
                    return resultModel;
                }
            }
        }).result.then(function (result) {
        }, function (result) {
            console.log('closed!');
        });
    };

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
            $scope.openResult({type : 'success', message : 'המשתמש אושר בהצלחה'/*'User successfully approved'*/});
    	}, function (err){
    		$scope.openResult({type : 'danger', message: 'האישור נכשל '/*' Approving failed.'*/ + err.message});
    	});
    }
    $scope.reject = function(id) {
        var user = angular.copy($scope.model.usersMap[id]);
        user.status = 'rejected';
        Activator.activity(user).then( function (data) {
            $scope.model.usersMap[id].status = 'rejected';
            $scope.openResult({type : 'success', message : 'המשתמש סורב בהצלחה'/*'User successfully rejected'*/});
        }, function (err){
            $scope.openResult({type : 'danger', message: 'הסרוב נכשל '/*' Rejection failed.'*/ + err.message});
        });
    }
    $scope.closeAlert = function(index) {
		$scope.alerts.splice(index, 1);
	};
});


app.controller('UserDetailsCtrl', function ($uibModalInstance, $uibModal, model, $scope, Activator, Case) {
    console.log(model);
    $scope.model = {
        user : model,
        cases : [],
        caseMap : {}
    };
    console.log( $scope.model.user);
    Case.getUserCases($scope.model.user._id).then ( function (data) {
        $scope.model.caseMap = data;
        var i = 0
        for (var key in data) {
            data[key]['openDetails'] = false;
            $scope.model.cases.unshift(data[key]);
            $scope.model.cases[i].body = JSON.parse( data[key].body );
            i++
        }
        console.log($scope.model.cases);
    }, function (err) {
        console.log(err);
    })
    $scope.caseDetails = function(index) {
        $scope.model.cases[index].openDetails = !$scope.model.cases[index].openDetails;
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.approve = function() {
        var user = angular.copy($scope.model.user);
        user.status = 'approved';
        console.log(user);
        Activator.activity(user).then( function (data) {
            $scope.model.user.status = 'approved';
            $scope.openResult({ type: 'success', message : 'המשתמש אושר בהצלחה'/*'User successfully approved'*/ });
            $uibModalInstance.dismiss('cancel');
        }, function (err){
            console.log(err);
            $scope.openResult({ type: 'danger', message : 'האישור נכשל '/*' Approving failed.'*/ + err.message });
            $uibModalInstance.dismiss('cancel');
        });
    }
    $scope.reject = function() {
        var user = angular.copy($scope.model.user);
        user.status = 'rejected';
        Activator.activity(user).then( function (data) {
            $scope.model.user.status = 'rejected';
            $scope.openResult({ type: 'success', message : 'המשתמש סורב בהצלחה'/*'User successfully rejected'*/ });
            $uibModalInstance.dismiss('cancel');
        }, function (err){
            $scope.openResult({ type: 'danger', message : 'הסרוב נכשל '/*' Rejection failed.'*/ + err.message });
            $uibModalInstance.dismiss('cancel');
        });
    }

    $scope.approveCase = function(id) {
        var caseItem = angular.copy($scope.model.caseMap[id]);
        caseItem.status = 'approved';
        Case.approving(caseItem).then( function (data) {
            $scope.openResult({type : 'success', message : 'הפניה נסגרה בהצלחה'/*'Case successfully approved'*/});
            $scope.model.caseMap[id].status = 'approved';
        }, function (err){
            $scope.openResult({type : 'danger', message: 'האישור נכשל. '/*'Approving failed. '*/ + err.message});
        });
    }
    $scope.rejectCase = function(id) {
        var caseItem = angular.copy($scope.model.caseMap[id]);
        caseItem.status = 'rejected';
        Case.approving(caseItem).then( function (data) {
            $scope.openResult({type : 'success', message : 'הפניה סורבה בהצלחה'/*'Case successfully rejected'*/});
            $scope.model.caseMap[id].status = 'rejected';
        }, function (err){
            $scope.openResult({type : 'danger', message: 'הסרוב נכשל '/*' Rejection failed.'*/ + err.message});
        });
    }

    $scope.openDetails = function (caseModel) {
        console.log(caseModel);
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'caseDetailsModal.html',
            controller: 'CaseDetailsCtrl',
            resolve: {
                model: function () {
                    return caseModel;
                }
            }
        }).result.then(function (result) {
            // $ctrl.selected = selectedItem;
        }, function (result) {
            console.log('closed!');
        });
    };

    $scope.openResult = function (resultModel) {
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'resultModal.html',
            controller: 'UserResultModalCtrl',
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

app.controller('UserResultModalCtrl', function($uibModalInstance, model, $scope){
    $scope.model = model;
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});