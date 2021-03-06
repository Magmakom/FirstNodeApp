app.factory('RouteRejector', function () {
	/* Url tamplates available for admin and separetely for users */
	var model = {
		admin : [
			'admin/admin.users.html',
			'admin/admin.cases.html'
		],
		user : [
			'user/user.html',
			'user/user.cases.html'
		],
		all : [
			'login/login.html',
			'register/register.html',
			'password/password.html'
		]
	}
	return {
		isAvailable : function (role, urlTemplate) {
			for (var i in model[role]) {
				if (urlTemplate === model[role][i]) {
					return true;
				}
			}
			return false;
		}
	}
})