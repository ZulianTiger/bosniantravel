angular.module('mainController', ['authServices'])

.controller('mainCtrl', function($http, Auth, $timeout, $location, $rootScope, $window){
	var app = this;

	app.loadme = false;

	$rootScope.$on('$routeChangeStart', function(){
		if(Auth.isLoggedIn()){
		app.isLoggedIn = true;
		Auth.getUser().then(function(data){
			app.username = data.data.username;
			app.useremail = data.data.email;
			app.loadme = true;
		});
		} else {
			app.isLoggedIn = false;
			app.username = "";
			app.loadme = true;
		}
		if($location.hash() == '_=_') $location.hash(null);
	});

	this.facebook = function(){
		app.disabled = true;
		$window.location = $window.location.protocol + '//' + $window.location.host + '/auth/facebook';
	};

	this.doLogin = function(loginData){
		app.loading = true;
		app.errorMsg = false;
		app.expired = false;
		app.disabled = true;

		Auth.login(app.loginData).then(function(data){
			if(data.data.success){
				app.loading = false;
				//success message
				app.successMsg = data.data.message + '...Redirecting';
				//redirect to home
				$timeout(function(){
					$location.path('/about');
					app.loginData = "";
					app.successMsg = false;
				}, 1500);
			} else{
				if(data.data.expired){
					//error message
					app.disabled = true;
					app.expired = true;
					app.loading = false;
					app.errorMsg = data.data.message;
				} else{
					//error message
					app.loading = false;
					app.disabled = false;
					app.errorMsg = data.data.message;
				}
			}
		});
	};
	this.logout = function(){
		Auth.logout();
		$location.path('/logout');
		$timeout(function(){
			$location.path('/');
		}, 1500);
	};
});
