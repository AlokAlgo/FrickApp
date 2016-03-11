angular.module( 'frickapp.home', [
'auth0',
  'angular-storage',
  'angular-jwt'
]).
controller( 'HomeCtrl', function HomeController( $scope, auth, $http, $location, store, $interval) {

	$scope.serverIp = $scope.serverIp || 'localhost';
	$scope.user=$scope.user || {};
	store.set('token', auth.idToken);
	$scope.bets = $scope.bets || [];
	$scope.mybets = $scope.mybets ||  [];
	$scope.matches = $scope.matches || [];
	$scope.suggestions = $scope.suggestions || [];
	$scope.myMatchedbets =  $scope.myMatchedbets || [];
	
$scope.populateMyBets = function() {
		$scope.mybets = [];
		var url = 'http://'+$scope.serverIp +':3002/api/v1/Toproom'+ '?query={"valid":true,"create_user_id":"' +  $scope.user.user_id + '"}';
		console.log(url);
        $http.get(url).success(
            function(data, status, headers, config){
                $scope.mybets = data ;// play here
            }) 
       .error( function(data, status, headers, config){
                cosole.log(data+ status);// play here
            });         
      };
	  
$scope.populateMyMatchedBets = function() {
		$scope.myMatchedbets = [];
		var url = 'http://'+$scope.serverIp +':3002/api/v1/MatchedBet'+ '?query={"create_user_id":"' +  $scope.user.user_id + '"}';
		console.log(url);
        $http.get(url).success(
            function(data, status, headers, config){
                $scope.myMatchedbets = data ;
				$scope.myMatchedbets.forEach(function(bet) {
					var subTop = bet.newsType.split(" ");
					bet.subject = subTop[0];
					bet.topic = subTop[1];
					bet.opt = bet.optimistic_user_id == $scope.user.user_id ? 'Will' : 'Will Not';
				});
            }) 
       .error( function(data, status, headers, config){
               // alert(data+ status);// play here
				
            });         
      };
	  	
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
            $scope.user= data;
			$scope.populateMyBets();
			$scope.populateMyMatchedBets();
			console.log(data);
        })
};
// get the USer first
$scope.getUser();
$scope.serverIp = 'localhost';
$scope.auth = auth ;
$scope.messages= [];
store.set('token', auth.idToken);

 $scope.submit = function(event) {
	 console.log('submit');
	 var d = new Date();
	 $scope.socket.emit('chat message', auth.profile.name +d.getUTCMilliseconds()+ $scope.text ); 
	 return false;
  }
  
  
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
  
  $scope.admin = function() {
    $location.path('/admin');
  }
  


$scope.populateBets = function() {
		$scope.bets = [];
		var url1 = 'http://'+$scope.serverIp +':3002/api/v1/Toproom'+ '?query={"valid":true}';
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
		var url = 'http://'+$scope.serverIp +':3002/api/v1/Match' ;
        $http.get(url).success(
            function(data, status, headers, config){
				console.log(data + status);
                $scope.matches =data ;// play herej
				
            })        
      };
	  
	  
$scope.populateSuggestions = function() {
		// initialize ssuggestions
		$scope.suggestions = [];
		// get the selected match metadata
		var metadata = $scope.selectedMatch.metadata;
		// for each data in metadata
		metadata.forEach( function( data) {
		var subject = data.name;
		data.topics.forEach (function(topic) { 
			// create optimistic suggestion
			var suggestion = {};
			suggestion.subject = subject;
			suggestion.topicname = topic;
			suggestion.optimistic = true;
			suggestion.text = subject + ' ' + 'Will' + ' ' + topic   ;
			$scope.suggestions.push(suggestion);
			
			
			// create pessimistic suggestion
			var suggestion = {};
			suggestion.subject = subject;
			suggestion.topicname = topic;
			suggestion.optimistic = false;
			suggestion.text = subject + ' ' + 'Will Not' + ' ' + topic   ;
			$scope.suggestions.push(suggestion);
			
			}); //end for each topics
		}); // end for metadata
} // end function

 $scope.getMatches = function(searchText) {
	 var result = [];
	 $scope.suggestions.forEach(function(suggestion) 
	 {
		 if (suggestion.text.indexOf(searchText) > -1 ){
			 result.push(suggestion);
		 }
	 });
	 return result;
 } // end function
 
$scope.addRow = function(searchText){		
var url = 'http://'+$scope.serverIp +':3002/api/v1/Toproom';
var data = 
            JSON.stringify({
				match_id : $scope.selectedMatch._id,
				create_user_id : $scope.user.user_id,
				topicname : $scope.selectedSuggestion.topicname,
				subject : $scope.selectedSuggestion.subject,
				optimistic : $scope.selectedSuggestion.optimistic,
				val : $scope.val,
				coinsgive : "10"
            });
       
		console.log(data);
        $http.post(url, data).success(function(data, status) {
            $scope.hello = data;
        })
};

$scope.cancelBet = function(id){		
var url = 'http://'+$scope.serverIp +':3002/api/v1/Toproom/'+id;
        $http.delete(url).success(function( status) {
			alert("Bet is cancelled");
        })
};
///this shd be populated from  the api
$scope.challengeBet = function(bet){		
var url = 'http://'+$scope.serverIp +':3002/api/v1/Toproom';
var data = 
            JSON.stringify({
				match_id : bet.match_id,
				create_user_id : $scope.userId,
				topicname : bet.topicname,
				subject : bet.subject,
				optimistic : !bet.optimistic,
				val : bet.val,
				coinsgive : bet.coinsgive
            });
       
		console.log(data);
        $http.post(url, data).success(function(data, status) {
            $scope.hello = data;
        })
};
$scope.selectedMatch = {};	
$scope.populateBets();

$scope.populateMatches();

});


 
