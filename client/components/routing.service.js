app.factory('Router', function() {
	var model = {
		'users'			: '/api/users',
		'activateUser'	: '/api/users/approve',
		'login'			: '/api/users/login',
		'signup' 		: '/api/users/signup',
		'role'			: '/api/users/role',
		'allCases' 		: '/api/cases',
		'addCase' 		: '/api/cases/add',
		'approveCase'	: '/api/cases/approve',
		'getUserCases'	: '/api/cases/usercases',
		'sendPassEmail'	: '/api/users/resetPassword',
		'newPass'		: '/api/users/newPassword'
	};
	return {
		get : function (key) {
			return model[key];
		},
		set : function (key, urlValue) {
			model[key] = urlValue;
		},
		getModel : function (key) {

		}
	}
});