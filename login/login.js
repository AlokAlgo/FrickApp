angular.module( 'frickapp.login', [
  'auth0'
])
.controller( 'LoginCtrl', function LoginController( $scope, auth, $location, store ) {
  $scope.login = function() {
	  var lock = new Auth0Lock('DmK2KHCxcpTPMNXdAl7kYun2vkC1EBH8', 'cricchat.auth0.com');
	//  lock.show();
        var result = lock.parseHash();
		
	//	var result = auth.parseHash(window.location.hash);

  //use result.id_token to call your rest api

  if (result && result.id_token) {
    lock.getProfile(result.id_token, function (err, profile) {
      alert('hello ' + profile.name);
	  store.set('hash', result);
	  store.set('token', result.id_token);
      $location.path("/");
	  
    });
    // If offline_access was a requested scope
    // You can grab the result.refresh_token here

  } else if (result && result.error) {
    alert('error: ' + result.error);
  }
  else {
	  lock.show();
  }
  };

});
