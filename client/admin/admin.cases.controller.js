app.controller('adminCasesCtrl', function($scope, $http, Auth, $location, Case, Router){
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

	$scope.approve = function(id) {
    	console.log(id);
    	var caseItem = angular.copy($scope.model.caseMap[id]);
    	caseItem.status = 'approved';
    	Case.approving(caseItem).then( function (data) {
            console.log('success');
    		$scope.model.caseMap[id].status = 'approved';
    	}, function (err){
            console.log('err');
            $scope.alerts = [];
    		$scope.alerts.push({ type : 'danger', msg : 'Approving failed.' });
    	});
    }
    $scope.reject = function(id) {
        console.log(id);
        var caseItem = angular.copy($scope.model.caseMap[id]);
        caseItem.status = 'rejected';
        Case.approving(caseItem).then( function (data) {
            $scope.model.caseMap[id].status = 'rejected';
        }, function (err){
            console.log('err');
            $scope.alerts = [];
            $scope.alerts.push({ type : 'danger', msg : 'Rejection failed.' });
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