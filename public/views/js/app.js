angular.module('FrickApp', ['auth0', 'angular-storage', 'angular-jwt'])
.config(function (authProvider) {
  authProvider.init({
    domain: 'cricchat.auth0.com',
    clientID: 'DmK2KHCxcpTPMNXdAl7kYun2vkC1EBH8'
  });
})
.run(function(auth) {
  // This hooks al auth events to check everything as soon as the app starts
  auth.hookEvents();
});

myApp.config(function (authProvider, $routeProvider, $httpProvider, jwtInterceptorProvider) {
  // ...

  // We're annotating this function so that the `store` is injected correctly when this file is minified
  jwtInterceptorProvider.tokenGetter = ['store', function(store) {
    // Return the saved token
    return store.get('token');
  }];

  $httpProvider.interceptors.push('jwtInterceptor');
  // ...
});