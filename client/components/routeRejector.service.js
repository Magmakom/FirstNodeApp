app.factory('RouteRejector', function () {
	/* Url tamplates available for admin and separetely for users */
	var model = {
		admin : [
			'admin/admin.users.html',
			'admin/admin.cases.html'
		],
		user : [
			'user/user.html'
		],
		all : [
			'login/login.html',
			'register/register.html'
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