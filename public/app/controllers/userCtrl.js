angular.module('userControllers', ['userServices'])

.controller('regCtrl', function($http, $location, $timeout, User){

	var app = this;

	this.regUser = function(regData, valid){
		app.loading = true;
		app.errorMsg = false;

		if(valid){
			User.create(app.regData).then(function(data) {
			if(data.data.success){
				app.loading = false;
				//success message
				app.successMsg = data.data.message + "... Redirecting";
				//redirect to home
				$timeout(function(){
					$location.path('/');
				}, 1000);	
			} else{
				app.loading = false;
				//error message
				app.errorMsg = data.data.message;
			}
		});
		} else{
			app.loading = false;
			//error message
			app.errorMsg = 'Please make sure the form is filled out correctly.';
		}
	};
})

.controller('facebookCtrl', function($routeParams, Auth, $location, $window){

	var app = this;

	if($window.location.pathname == '/facebookerror'){
		//error
		app.errorMsg = 'Facebook e-mail not found in database!';
	} else{
		Auth.facebook($routeParams.token);
		$location.path('/');
	}	
});
