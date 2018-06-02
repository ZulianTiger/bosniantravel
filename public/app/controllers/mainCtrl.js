angular.module('mainController', ['authServices'])

.controller('mainCtrl', function($http, Auth, $timeout, $location){
	var app = this;

	this.doLogin = function(loginData){
		app.loading = true;
		app.errorMsg = false;

		Auth.login(app.loginData).then(function(data){
			if(data.data.success){
				app.loading = false;
				//success message
				app.successMsg = data.data.message + '...Redirecting';
				//redirect to home
				$timeout(function(){
					$location.path('/about');
				}, 1000);
			} else{
				//error message
				app.loading = false;
				app.errorMsg = data.data.message;
			}
		});
	};
});