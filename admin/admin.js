angular.module( 'frickapp.admin', [
'auth0',
  'angular-storage',
  'angular-jwt'
]).
controller( 'AdminCtrl', function AdminController( $scope, auth, $http, $location, store, $interval) {

	$scope.serverIp = $scope.serverIp || 'localhost';
	$scope.user=$scope.user || {};
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
            $scope.user= data;
			console.log(data);
        })
};
// get the USer first
$scope.getUser();
$scope.serverIp = 'localhost';
$scope.auth = auth ;
store.set('token', auth.idToken);

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
		if(topic.live) {
			var suggestion = {};
			suggestion.subject = subject;
			suggestion.topicname = topic.name;
			suggestion.text = subject  + ' ' + topic.name   ;
			$scope.suggestions.push(suggestion);
		}
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
 }
 
$scope.addEvent = function(){		
var url = 'http://'+$scope.serverIp +':3002/api/v1/News';
var data = 
            JSON.stringify({
				match_id : $scope.selectedMatch._id,
				newsType : $scope.selectedSuggestion.text,
				val : $scope.val,
				moreflag : $scope.isChecked
            });
       
		console.log(data);
        $http.post(url, data).success(function(data, status) {
            $scope.hello = data;
        })
};
$scope.addMatch = function(){		
var url = 'http://'+$scope.serverIp +':3002/api/v1/Match';
var data = 
            JSON.stringify({
				name : $scope.matchName,
				location : $scope.matchLocation,
				score : $scope.matchScore,
				live : $scope.isMatchLive
            });
       
		
        $http.post(url, data).success(function(data, status) {
            $scope.hello = data;
        })
};

$scope.addSubject = function(){	
var subject = {};
subject.name = '';
subject.topics = [];
$scope.selectedMatchForUpdate.metadata.push(subject);
};

$scope.addTopic = function(subject) {
	var topic = {};
topic.name= '';
topic.val = '';
subject.topics.push(topic);
}
$scope.updateMatch = function(){		
var url = 'http://'+$scope.serverIp +':3002/api/v1/Match';
        $http.put(url, $scope.selectedMatchForUpdate).success(function(data, status) {
            alert("Match Updated Succesfully");
        })
};

$scope.populateMatches();

});


 
