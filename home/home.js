angular.module( 'frickapp.home', [
'auth0',
  'angular-storage',
  'angular-jwt'
]).
controller( 'HomeCtrl', function HomeController( $scope, auth, $http, $location, store, $interval) {
	

	/*$scope.info = function (message) {
        //var message = '<strong>Heads up!</strong> This alert needs your attention, but it\'s not super important.';
        Flash.create('info', message);
    }; */
	
	$scope.data = {
                selectedIndex: 0,
                bottom:        false
             };
             $scope.next = function() {
                $scope.data.selectedIndex = Math.min($scope.data.selectedIndex + 1, 2) ;
             };
             $scope.previous = function() {
                $scope.data.selectedIndex = Math.max($scope.data.selectedIndex - 1, 0);
             };
	
	//$scope.serverIp = $scope.serverIp || '104.196.96.128';
$scope.serverIp = $scope.serverIp || 'localhost';
	$scope.user=$scope.user || {};
	store.set('token', auth.idToken);
	$scope.bets = $scope.bets || [];
	$scope.mybets = $scope.mybets ||  [];
	$scope.matches = $scope.matches || [];
	$scope.suggestions = $scope.suggestions || [];
	$scope.myMatchedbets =  $scope.myMatchedbets || [];
	$scope.mySettledbets =  $scope.mySettledbets || [];
	
$scope.populateMyBets = function() {
		$scope.mybets = [];
		if($scope.selectedMatch) {
		var url = 'http://'+$scope.serverIp +':3002/api/v1/Toproom'+ '?query={"match_id" : "' +$scope.selectedMatch._id +'", "valid":true,"create_user_id":"' +  $scope.user.user_id + '"}';
		console.log(url);
        $http.get(url).success(
            function(data, status, headers, config){
                $scope.mybets = data ;// play here
            }) 
       .error( function(data, status, headers, config){
                cosole.log(data+ status);// play here
            });
		}
				
      };
	  
$scope.populateMyMatchedBets = function() {
		$scope.myMatchedbets = [];
		if($scope.selectedMatch) {
			var query = JSON.stringify({
									$or: [{
											create_user_id: $scope.user.user_id
											},
											{
											match_user_id: $scope.user.user_id
											}
										  ],
											match_id: $scope.selectedMatch._id,
											settled : false
										});
		var url = 'http://'+$scope.serverIp +':3002/api/v1/MatchedBet'+ '?query= ' + query;
		console.log(url);
        $http.get(url).success(
            function(data, status, headers, config){
				$scope.myMatchedbets=data;
				$scope.myMatchedbets.forEach(function(bet) {
					var pos = bet.newsType.lastIndexOf(" ");
					var newsType = bet.newsType;
					bet.subject =  newsType.slice(0,pos);
					bet.topic = newsType.slice(pos+1,newsType.length);
					bet.opt = bet.optimistic_user_id == $scope.user.user_id ? 'Will' : 'Will Not';
					bet.riskCoins = bet.create_user_id == $scope.user.user_id  ? bet.coinsgive : bet.coinstake;
					bet.rewardCoins = bet.create_user_id == $scope.user.user_id  ? bet.coinstake : bet.coinsgive;
				/*	if (bet.settled) {
						bet.result =  'Settled';
					} else {
						bet.result = 'Yet to be settled';
					} */
				});
            }) 
       .error( function(data, status, headers, config){
               // alert(data+ status);// play here
				
            });
		}	 // end if		
      };
	  $scope.populateMySettledBets = function() {
		$scope.myMatchedbets = [];
		if($scope.selectedMatch) {
			var query = JSON.stringify({
									$or: [{
											win_user_id: $scope.user.user_id
											},
											{
											loose_user_id: $scope.user.user_id
											}
										  ],
											match_id: $scope.selectedMatch._id
										});
		var url = 'http://'+$scope.serverIp +':3002/api/v1/SettledBet'+ '?query= ' + query;
		console.log(url);
        $http.get(url).success(
            function(data, status, headers, config){
				$scope.mySettledbets=data;
				$scope.mySettledbets.forEach(function(bet) {
					var pos = bet.newsType.lastIndexOf(" ");
					var newsType = bet.newsType;
					bet.subject =  newsType.slice(0,pos);
					bet.topic = newsType.slice(pos+1,newsType.length);
					bet.opt = bet.optimistic_user_id == $scope.user.user_id ? 'Will' : 'Will Not';
					bet.result =  bet.win_user_id == $scope.user.user_id ? 'You Won ' + bet.coins + ' CricCoins' : 'You Lost ' + bet.coins  + ' CricCoins';
				});
            }) 
       .error( function(data, status, headers, config){
               // alert(data+ status);// play here
				
            });
		}	 // end if		
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
			console.log("login request data" + data);
            $scope.user= data;
			$scope.populateMyBets();
			$scope.populateMyMatchedBets();
			$scope.populateMySettledBets();
			console.log(data);
        })
};
// get the USer first
$scope.getUser();
$scope.auth = auth ;
$scope.messages= [];
store.set('token', auth.idToken);

 $scope.submit = function(event) {
	 console.log('submit');
	 var d = new Date();
	 $scope.socket.emit('chat message', auth.profile.name +d.getUTCMilliseconds()+ $scope.text ); 
	 return false;
  }
  
  
 /*  Commenting for now will be used in future
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
			
  */
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
		if($scope.selectedMatch) {
			var query = JSON.stringify({
											create_user_id:{ "$ne": $scope.user.user_id },
											match_id: $scope.selectedMatch._id,
											valid : true
										});
										
		var url1 = 'http://'+$scope.serverIp +':3002/api/v1/Toproom'+ '?query= ' + query;
		console.log(url1);
        $http.get(url1).success(
            function(data, status, headers, config){
                $scope.bets = data ;// play here
            }) 
       .error( function(data, status, headers, config){
               // alert(data+ status);// play here
				
            });     
		}			
      };
	  
 
	  
$scope.populateMatches = function() {
		$scope.matches = [];
		// TO DO onlive live matches shd be shown is n't it
		var url = 'http://'+$scope.serverIp +':3002/api/v1/Match' ;
        $http.get(url).success(
            function(data, status, headers, config){
				console.log(data + status);
                $scope.matches =data ;// play herej
				
            })        
      };
$scope.updateSelectedMatchScore = function(id) {
		var url = 'http://'+$scope.serverIp +':3002/api/v1/Match/' +id ;
        $http.get(url).success(
            function(data, status, headers, config){
				console.log(data + status);
                $scope.selectedMatch.score =data.score ;// play herej
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
			suggestion.topicname = topic.name;
			suggestion.optimistic = true;
			suggestion.text = subject + ' ' + 'Will' + ' ' + topic.name   ;
			$scope.suggestions.push(suggestion);
			
			
			// create pessimistic suggestion
			var suggestion = {};
			suggestion.subject = subject;
			suggestion.topicname = topic.name;
			suggestion.optimistic = false;
			suggestion.text = subject + ' ' + 'Will Not' + ' ' + topic.name   ;
			$scope.suggestions.push(suggestion);
			
			}); //end for each topics
		}); // end for metadata
		$scope.refresh();
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
				coinsgive : $scope.coinsgive,
				coinstake : $scope.coinstake
            });
       
		console.log(data);
        $http.post(url, data).success(function(data, status) {
			alert("You have succesfully published  bet, Your page will refresh shortly");
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
				create_user_id : $scope.user.user_id,
				topicname : bet.topicname,
				subject : bet.subject,
				optimistic : !bet.optimistic,
				val : bet.val,
				coinsgive : bet.coinstake,
				coinstake  : bet.coinsgive
            });
       
		console.log(data);
        $http.post(url, data).success(function(data, status) {
           alert("You have succesfully created the counter bet Your page will refresh shortly");
        })
};
//$scope.selectedMatch = {};	
$scope.populateBets();
$scope.refresh = function() {
	
	
	$scope.getUser();
	if ($scope.selectedMatch !=null) {
	$scope.updateSelectedMatchScore($scope.selectedMatch._id);
	$scope.populateBets();
	$scope.populateMyMatchedBets();
	$scope.populateMyBets();
	$scope.populateMySettledBets();
	}
}

 $interval($scope.refresh, 20000);

$scope.populateMatches();

});


 
