app.controller('userCasesCtrl', function($scope, Case, Auth, $uibModal){
	$scope.model ={
		cases : []
	}
	Case.getUserCases()
		.then(function (data) {
			console.log(data);
			var i = 0
			for (var key in data) {
        	    data[key]['openDetails'] = false;
        	    $scope.model.cases.unshift(data[key]);
        	    $scope.model.cases[i].body = JSON.parse( data[key].body );
        	    i++
        	}
		}, function (err) {
			console.log(err);
		});

    $scope.logout = Auth.logout;

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
});