var app = angular.module('Main', ['ngRoute', 'ui.bootstrap', 'ngResource', 'ngCookies']);

app.config(function ($routeProvider, $locationProvider, $httpProvider) {
 	$routeProvider.
		when('/login', {
			templateUrl: 'login/login.html',
			controller : 'loginCtrl'
		})
        .when('/login/:token', {
            templateUrl: 'login/login.html',
            controller : 'loginCtrl'
        })
        .when('/register', {
            templateUrl: 'register/register.html',
            controller : 'registerCtrl'
        })
        .when('/user', {
            templateUrl : 'user/user.html',
            controller : 'userCtrl'
        })
        .when('/user/cases', {
            templateUrl : 'user/user.cases.html',
            controller : 'userCasesCtrl'
        })
        .when('/admin/users', {
            templateUrl: 'admin/admin.users.html',
            controller : 'adminUsersCtrl'
        })
        .when('/admin/cases', {
            templateUrl: 'admin/admin.cases.html',
            controller : 'adminCasesCtrl'
        })
        .when('/password', {
            templateUrl : 'password/password.html',
            controller : 'passwordCtrl'
        })
        .when('/password/:token', {
            templateUrl : 'password/password.html',
            controller : 'passwordCtrl'
        })
		.otherwise({
		    redirectTo: '/login'
		});
    $httpProvider.interceptors.push('authInterceptor');
})

.factory('authInterceptor', function ($rootScope, $q, $cookies, $location) {
    return {
        // Add authorization token to headers
        request: function (config) {
            config.headers = config.headers || {};
            if ($cookies.get('token')) {
                config.headers['x-access-token'] = $cookies.get('token');
            }
            return config;
        },
        // Intercept 401s and redirect you to login
        responseError: function(response) {
            if(response.status === 401) {
                $location.path('/login');
                $cookies.remove('token');
                return $q.reject(response);
            } else {
                    return $q.reject(response);
                }
            }
        };
    })

.run (function( $rootScope, $location, User, Auth, $cookies, RouteRejector) {
    $rootScope.$on('$routeChangeStart',
        function (event, next, current) {
            if($cookies.get('token')) {
                var user = {};
                User.get().then(
                    function(data) {
                        user.role =  data.role;
                        console.log(user.role);
                        Auth.setCurrentUser(user);
                        if (!Auth.isLoggedIn()) {
                            if (!RouteRejector.isAvailable('all', next.templateUrl)) {
                                $location.url('/login');
                            }
                        } else {
                            if ((Auth.isAdmin() && !RouteRejector.isAvailable('admin', next.templateUrl))
                                || Auth.isUser() && !RouteRejector.isAvailable('user', next.templateUrl)) 
                            {
                                console.log(RouteRejector.isAvailable('user', next.templateUrl));
                                $location.url('/login');
                            } 
                        }
                    }, function (error) {
                        console.log(error);
                        if (!RouteRejector.isAvailable('all', next.templateUrl)) {
                            $location.url('/login');
                        }
                    }
                );
            } else {
                if (!RouteRejector.isAvailable('all', next.templateUrl)) {
                    $location.url('/login');
                }
            }
            console.log('Change start. Current route name: ' + $location.path());
        });

});
