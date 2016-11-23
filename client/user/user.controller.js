app.controller('userCtrl', function ($scope, Auth, $location, Router, Case, $uibModal) {
	
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

  	$scope.change = function(dateItem) {
  		console.log(datefield);
		if (dateItem.getTime()> new Date().getTime())
			$scope.formbanking.datefield.$setValidity("required",true);
		else 
			$scope.formbanking.datefield.$setValidity("required",false);
	}


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
			name : $scope.model.forms[formname].label,
			body : JSON.stringify(formModel)
		}
		Case.add(caseModel).then(function (data) {
			console.log('success');
			if ($scope.alerts.length > 0) {
				$scope.closeAlert(0);
			}
			$scope.alerts.push({ type : 'success', msg : 'הפניה נשמרה בהצלחה'/*'Case successfully added. We will send confirmation email after approving'*/ });
		}, function (error) {
			console.log('error');
			if ($scope.alerts.length > 0) {
				$scope.closeAlert(0);
			}
			$scope.alerts.push({ type : 'danger', msg : 'יצירת פניה נכשלה'/*'Case sending failed.'*/ });

		})
	}
	
	$scope.closeAlert = function(index) {
		/*$scope.alerts.splice(index, 1);
		$scope.model.forms[$scope.model.lastFormName] = { view: true };*/
		$scope.init();
	};

	$scope.init = function () {
		$scope.alerts = [];
		$scope.model = {
			forms : {
				'Visa to Russia issue' 			: { label: 'ויזה לרוסיה', 	view:true },
				'Visa to Ukraine issue' 		: { label: 'ויזה לאוקראינה', view:false },
				'Airport transfer equipment' 	: { label: 'מספר טיסה', 	view:false },
				'Banking' 						: { label: 'בנק', 		view:false },
				'Credit Debit' 					: { label: 'כרטיס אשראי', 	view:false },
				'Purchase' 						: { label: 'לִרְכּוֹשׁ', 		view:false },
				'Other' 						: { label: 'אחר', 		view:false }
			},
			lastFormName : ''
		};
	}

	$scope.init();

	$scope.logout = Auth.logout;
})