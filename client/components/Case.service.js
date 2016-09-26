app.service('Case', function($http, $q, Router){
	this.getAll = function () {
		var deferred = $q.defer();
		$http.get(Router.get('allCases'))
		.success(function(data){
			deferred.resolve(data);
		})
		.error(function(err) {
			deferred.reject(err);
		})
		return deferred.promise;
	};
	this.approving = function (caseItem) {
		var deferred = $q.defer();
		$http.post(Router.get('approveCase'), {
			id : caseItem._id,
			status : caseItem.status
		})
		.success(function(data){
			deferred.resolve(data);
		})
		.error(function(err) {
			deferred.reject(err);
		})
		return deferred.promise;
	};
	this.add =  function (caseItem) {
		var deferred = $q.defer();
		$http.post(Router.get('addCase'), {
			name : caseItem.name,
			body : caseItem.body
		})
		.success(function(data){
			deferred.resolve(data);
		})
		.error(function(err) {
			deferred.reject(err);
		})
		return deferred.promise;
	};
});