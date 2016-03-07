angular.module( 'frickapp', [
  'auth0',
  'ngRoute',
  'frickapp.home',
  'frickapp.login',
  'angular-storage',
  'angular-jwt',
  'ngMaterial'
])
.config( function myAppConfig ( $routeProvider, authProvider, $httpProvider, $locationProvider,
  jwtInterceptorProvider) {
  $routeProvider
    .when( '/', {
      controller: 'HomeCtrl',
      templateUrl: 'home/home.html',
      pageTitle: 'Homepage',
      requiresLogin: true
    })
    .when( '/login', {
      controller: 'LoginCtrl',
      templateUrl: 'login/login.html',
      pageTitle: 'Login'
    });


  authProvider.init({
    domain:'cricchat.auth0.com',
    clientID:'DmK2KHCxcpTPMNXdAl7kYun2vkC1EBH8',
    loginUrl: '/login'
  });

  jwtInterceptorProvider.tokenGetter = function(store) {
    return store.get('token');
  }

  // Add a simple interceptor that will fetch all requests and add the jwt token to its authorization header.
  // NOTE: in case you are calling APIs which expect a token signed with a different secret, you might
  // want to check the delegation-token example
  $httpProvider.interceptors.push('jwtInterceptor');
}).run(function($rootScope, auth, store, jwtHelper, $location) {
  $rootScope.$on('$locationChangeStart', function() {
    if (!auth.isAuthenticated) {
      var token = store.get('token');
      if (token) {
        if (!jwtHelper.isTokenExpired(token)) {
          auth.authenticate(store.get('profile'), token);
		  $location.path('/');
        } 
      }
    }
	else {
		  
		  store.set('token',auth.token);
		  store.set('token', auth.id_token);
          $location.path('/');
		  
        }

  });
}).controller( 'AppCtrl', function AppCtrl ( $scope, $location ) {
	 $location.path('/login');
  $scope.$on('$routeChangeSuccess', function(e, nextRoute){
    if ( nextRoute.$$route && angular.isDefined( nextRoute.$$route.pageTitle ) ) {
      $scope.pageTitle = nextRoute.$$route.pageTitle + ' | Auth0 Sample' ;
    }
  });
});

