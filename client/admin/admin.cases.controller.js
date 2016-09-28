app.controller('adminCasesCtrl', function($scope, $http, Auth, $location, Case, Router, $uibModal){
	$scope.model = {
		search : '',
		cases : [],
		caseMap : {},
		sortKey : 'id', // set the default sort type
  		reverse : false  // set the default sort order
	}
	$scope.alerts = [];

    Case.getAll().then(function(data){ 
		$scope.model.caseMap = data;  //ajax request to fetch data into $scope.data
		console.log(data);
		var i = 0;
        for (var key in $scope.model.caseMap) { 
        	$scope.model.cases.push($scope.model.caseMap[key]);
        	$scope.model.cases[i].body = JSON.parse( $scope.model.caseMap[key].body );
        	i++;
        }
    });

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
            // $ctrl.selected = selectedItem;
        }, function (result) {
            console.log('closed!');
        });
    };

	$scope.approve = function(id) {
    	var caseItem = angular.copy($scope.model.caseMap[id]);
    	caseItem.status = 'approved';
    	Case.approving(caseItem).then( function (data) {
            $scope.openResult({type : 'success', message : 'Case successfully approved'});
    		$scope.model.caseMap[id].status = 'approved';
    	}, function (err){
            $scope.openResult({type : 'danger', message: ' Approving failed.' + err.message});
    	});
    }
    $scope.reject = function(id) {
        var caseItem = angular.copy($scope.model.caseMap[id]);
        caseItem.status = 'rejected';
        Case.approving(caseItem).then( function (data) {
            $scope.openResult({type : 'success', message : 'Case successfully rejected'});
            $scope.model.caseMap[id].status = 'rejected';
        }, function (err){
            $scope.openResult({type : 'danger', message: ' Rejection failed.' + err.message});
        });
    }
	
	$scope.sort = function(keyname){
        $scope.model.sortKey = keyname;   //set the sortKey to the param passed
        $scope.model.reverse = !$scope.model.reverse; //if true make it false and vice versa
    }
    $scope.logout = Auth.logout;
    $scope.closeAlert = function(index) {
		$scope.alerts.splice(index, 1);
	};
});


app.controller('CaseDetailsCtrl', function($uibModalInstance, $uibModal, model, $scope, Case){
    console.log(model);
    $scope.model = model;
    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.approve = function(id) {
        var caseItem = angular.copy($scope.model);
        caseItem.status = 'approved';
        Case.approving(caseItem).then( function (data) {
            $scope.model.status = 'approved';
            $scope.openResult({type : 'success', message : 'Case successfully approved'});
            $uibModalInstance.dismiss('cancel');
        }, function (err){
            $scope.openResult({type : 'danger', message: ' Approving failed.' + err.message});
            $uibModalInstance.dismiss('cancel');
        });
    }
    $scope.reject = function(id) {
        var caseItem = angular.copy($scope.model);
        caseItem.status = 'rejected';
        Case.approving(caseItem).then( function (data) {
            $scope.model.status = 'rejected';
            $scope.openResult({type : 'success', message : 'Case successfully rejected'});
            $uibModalInstance.dismiss('cancel');
        }, function (err){
            $scope.openResult({type : 'danger', message: ' Rejection failed.' + err.message});
            $uibModalInstance.dismiss('cancel');
        });
    }

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
            // $ctrl.selected = selectedItem;
        }, function (result) {
            console.log('closed!');
        });
    };
});

app.controller('CaseResultModalCtrl', function($uibModalInstance, model, $scope){
    $scope.model = model;
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});