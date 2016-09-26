app.controller('userCtrl', function ($scope, Auth, $location, Router, Case, $uibModal) {
	$scope.alerts = [];
	$scope.model = {
		forms : {
			'Visa to Russia issue' 			: { view:false },
			'Visa to Ukraine issue' 		: { view:false },
			'Airport transfer equipment' 	: { view:false },
			'Banking' 						: { view:false },
			'Credit Debit' 					: { view:false },
			'Purchase' 						: { view:false },
			'Other' 						: { view:true }
		},
		lastFormName : ''
	};
	$scope.dateOptions = {
		formatYear: 'yy',
		maxDate: new Date(2020, 5, 22),
		minDate: new Date(),
		startingDay: 1
	};
	$scope.open1 = function() {
		$scope.popup1.opened = true;
	};
  	$scope.format = 'dd-MMMM-yyyy';
	$scope.popup1 = {
  		opened: false
  	};


	$scope.view = function (formnName) {
		console.log(formnName);
		console.log($scope.model.forms[formnName].view );
		if ($scope.model.forms[formnName].view == true) {
			return;
		}
		for (var i in $scope.model.forms) {
			$scope.model.forms[i].view = false;
		}
		$scope.model.forms[formnName].view =  true;
		if ($scope.alerts.length > 0) {
			$scope.alerts = [];
		}
	}

	$scope.submit = function(formname) {
		var formModel = angular.copy($scope.model.forms[formname]);
		$scope.model.lastFormName = formname;
		$scope.model.forms[formname]['view'] = false;
		delete formModel['view'];
		var caseModel = {
			name : formname,
			body : JSON.stringify(formModel)
		}
		Case.add(caseModel).then(function (data) {
			console.log('success');
			if ($scope.alerts.length > 0) {
				$scope.closeAlert(0);
			}
			$scope.alerts.push({ type : 'success', msg : 'Case successfully added. We will send fonfirmation email after approving' });
		}, function (error) {
			console.log('error');
			if ($scope.alerts.length > 0) {
				$scope.closeAlert(0);
			}
			$scope.alerts.push({ type : 'danger', msg : 'Case sending failed.' });

		})
	}
	
	$scope.closeAlert = function(index) {
		$scope.alerts.splice(index, 1);
		$scope.model.forms[$scope.model.lastFormName] = { view:true };
	};

	$scope.logout = Auth.logout;
})