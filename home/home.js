angular.module( 'frickapp.home', [
'auth0',
  'angular-storage',
  'angular-jwt'
  
]).
controller( 'HomeCtrl', function HomeController( $scope, auth, $http, $location, store ) {
  $scope.serverIp = '104.196.96.128';
  $scope.auth = auth ;
  $scope.messages= [];
  $scope.flags = [{"text": "Will"}, {"text": "Will not"}];
  store.set('token', auth.idToken);
  $scope.getUser = function() 
  {
		var url = 'http://'+ $scope.serverIp  + ':3001/login';
		var token = store.get('token');
		console.log(token);
		var data = 
            JSON.stringify({
				token : store.get('token')
            });
		console.log(data);
        $http.post(url, data).success(function(data, status) {
            $scope.userId= data;
			console.log(data);
        })
};
$scope.getUser();
 $scope.submit = function(event) {
	 console.log('submit');
	 var d = new Date();
	 $scope.socket.emit('chat message', auth.profile.name +d.getUTCMilliseconds()+ $scope.text ); 
	 return false;
  }
 // var messages = ['nothing'];	
  
  if (!$scope.socket) {
  var socket = io.connect('http://'+$scope.serverIp +':3001');
  $scope.socket = socket;
  }
  
  $scope.socket.on('connect', function () {   
                $scope.socket.on('authenticated', function () {
					
					$scope.socket.on('chat message', function (msg) {
                       // console.log(msg);
						//alert("here socket");
                        $scope.messages.push( msg);
                    });
                }).emit('authenticate', {token: store.get('token')}); // send the jwt
            })
			
  
  $scope.logout = function() {
    auth.signout();
    store.remove('profile');
    store.remove('token');
    $location.path('/login');
  }
  
$scope.bets = [];
$scope.matches = [];

$scope.populateBets = function() {
		$scope.bets = [];
		var url1 = 'http://'+$scope.serverIp +':3002/api/v1/Toproom';
        $http.get(url1).success(
            function(data, status, headers, config){
                $scope.bets = data ;// play here
            }) 
       .error( function(data, status, headers, config){
               // alert(data+ status);// play here
				
            });         
      };
	  
	  
$scope.populateMatches = function() {
		$scope.matches = [];
		var url = 'http://'+$scope.serverIp +':3002/api/v1/Match';
         $http.get(url).success(
            function(data, status, headers, config){
				alert(data +status);
				console.log(data + status);
                $scope.matches =data ;// play herej
				
            }) 
        .error( function(data, status, headers, config){
             //   alert(data+ status);// play here
				
            });          
      };

 
$scope.addRow = function(){		
var url = 'http://'+$scope.serverIp +':3002/api/v1/Toproom';
var data = 
            JSON.stringify({
				match_id : $scope.selectedMatch._id,
				create_user_id : $scope.userId,
				topicname : $scope.Topic,
				subject : $scope.selectedSubject.name,
				optimistic : $scope.selectedTake.text == 'Will' ? true : false,
				val : $scope.val,
				coinsgive : "10"
            });
       
		console.log(data);
        $http.post(url, data).success(function(data, status) {
            $scope.hello = data;
        })
};
///this shd be populated from  the api

$scope.selectedMatch = {};	
$scope.populateBets();
$scope.populateMatches();


});


 
