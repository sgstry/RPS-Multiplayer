
var connectionsCount = 0;

var gameFull = false;

var myPlayer = "";
var myId = "";

var player1 = {
	id: myId,
	position: 0,
	connected: false,
	name: "",
	choice: "",
	wins: 0,
	losses: 0
};

var player2 = {
	id: myId,
	position: 1,
	connected: false,
	name: "",
	choice: "",
	wins: 0,
	losses: 0
};


$(document).ready(function() {
	
	// Initialize Firebase
  	var config = {
	    apiKey: "AIzaSyAw-cQ16-cH52Q1JxwjRIrlaF25IkXRMig",
	    authDomain: "rps-multiplayer-7a8d2.firebaseapp.com",
	    databaseURL: "https://rps-multiplayer-7a8d2.firebaseio.com",
	    projectId: "rps-multiplayer-7a8d2",
	    storageBucket: "rps-multiplayer-7a8d2.appspot.com",
	    messagingSenderId: "796019987964"
    };
    firebase.initializeApp(config);

    var database = firebase.database();

    // Link to Firebase Database for viewer tracking
	var connectionsRef = database.ref("/connections");

	var connectedRef = database.ref(".info/connected");

	var playersRef = database.ref("/players");


	// Add ourselves to presence list when online.
	connectedRef.on("value", function(snap) {

	  	// If they are connected..
	  	if (snap.val()) {
		    // Add user to the connections list.
		    var con = connectionsRef.push(true);
		    myId = con.key;
		    // Remove user from the connection list when they disconnect.
	        con.onDisconnect().remove();
    	}
	});

	// Number of online users is the number of objects in the presence list.
	// When first loaded or when the connections list changes...
	connectionsRef.on("value", function(snap) {

		  // Display the viewer count in the html.
		  // The number of online users is the number of children in the connections list.
		  connectionsCount = snap.numChildren();
		  if(connectionsCount < 2) {
		  	gameFull = false;
		  }
		  $("#count").html(connectionsCount);
	});

	$("#check").on("click", function() {
		console.log(player1);
		console.log(player2);
	})

	var isPlayerHere = function(player, cons) {
		var key = player.id;
		var found = false;
		for( var con in cons) {
			if(con === key) {
				found = true;
				break;
			}
		}
		return found;
	};

	var resetPlayer = function(pNum) {
		if(pNum === 0) {
			player1.id = "";
		    player1.position = 0;
		    player1.connected = false;
		    player1.name = "";
		    player1.choice = "";
		    player1.wins = 0;
		    player1.losses = 0;
		} else if(pNum === 1){
			player2.id = "";
		    player2.position = 1;
		    player2.connected = false;
		    player2.name = "";
		    player2.choice = "";
		    player2.wins = 0;
		    player2.losses = 0;
		}
	};

	//Removes players from DB and re-adds a player if still connected
	var removePlayerFromDb = function(pNum) {
		if(pNum === 0) {
			if(player2.connected) {
				var tempId = player2.id;
				var tempPos = player2.position;
				var tempConn = player2.connected;
				var tempName = player2.name;
				var tempChoice = player2.choice;
				var tempWins = player2.wins;
				var tempLosses = player2.losses;
		      	playersRef.remove();
		      	player2.id = tempId;
		        player2.position = tempPos;
		        player2.connected = tempConn;
		        player2.name = tempName;
		        player2.choice = tempChoice;
		        player2.wins = tempWins;
		        player2.losses = tempLosses;
	        }
		} else if(pNum === 1){
			if(player1.connected) {
		      	var tempId = player1.id;
				var tempPos = player1.position;
				var tempConn = player1.connected;
				var tempName = player1.name;
				var tempChoice = player1.choice;
				var tempWins = player1.wins;
				var tempLosses = player1.losses;
		      	playersRef.remove();
		      	player1.id = tempId;
		        player1.position = tempPos;
		        player1.connected = tempConn;
		        player1.name = tempName;
		        player1.choice = tempChoice;
		        player1.wins = tempWins;
		        player1.losses = tempLosses;
	        }
		}
	};

	//Map current players in database to player1 and player2 objects
    //and reset UI
	playersRef.on("child_added", function(snapshot){
		var player = snapshot.val().player;
	    var pos = player.position;
	    if(pos === 1) {
		    for (var key in player) {
		  		if (player2.hasOwnProperty(key)) {
		    		player2[key] = player[key];
		  		}
		  	}
	    	$("#player2-name").html(player2.name);
	    	$("#player2-score").html("Wins: "+player2.wins+" Losses: "+player2.losses);
	    	$("#player2-score").css("display", "block");
	      	$(".p2choice").css("display", "block");
	    } else if(pos === 0){
	      	for (var key in player) {
	  			if (player1.hasOwnProperty(key)) {
	    				player1[key] = player[key];
	  			}
	  		}
	    	$("#player1-name").html(player1.name);
	    	$("#player1-score").html("Wins: "+player1.wins+" Losses: "+player1.losses);
	    	$("#player1-score").css("display", "block");
	      	$(".p1choice").css("display", "block");
	    }
      },function(errorObject) {
        console.log("The read failed: " + errorObject.code);
    });

	//Remove both players and add one back if still connected
    playersRef.on("child_removed", function(snapshot){
    	var p = snapshot.val().player;
    	if(player1.connected && p.id === player1.id) {
    		playersRef.push({player: player1});
    	} else if(player2.connected && p.id === player2.id) {
    		playersRef.push({player: player2});
    	}
    },function(errorObject) {
        console.log("The read failed: " + errorObject.code);
    });

	database.ref().on("value", function(snapshot) {

		var connections = snapshot.child("/connections").val();
        if(!isPlayerHere(player1, connections)) {
      		$("#player1-name").html("Waiting for Player 1 to join...");
      		$("#player1-score").css("display", "none");
      		$(".p1choice").css("display", "none");
      		if(player1.connected === true) {
      			resetPlayer(0);
      			removePlayerFromDb(0);
      		}
        }
        if(!isPlayerHere(player2, connections)) {
      		$("#player2-name").html("Waiting for Player 2 to join...");
      		$("#player2-score").css("display", "none");
      		$(".p2choice").css("display", "none");
      		if(player2.connected === true) {
      			resetPlayer(1);
      			removePlayerFromDb(1);
      		}
        }


    }, function(errorObject) {
      console.log("The read failed: " + errorObject.code);
    });


	$("#start-btn").on("click", function() {
		event.preventDefault();
		var name = $("#name-input").val().trim();
		if(name === "") {
			alert("Please enter your name.");
		} else {
			if(connectionsCount < 3 && !gameFull) {
				if(!player1.connected) {
					var playerObj1 = {
						id: myId,
						position: 0,
						connected: true,
						name: name,
						choice: "",
						wins: 0,
						losses: 0
					};
					playersRef.push({player: playerObj1});
					myPlayer = "player1";
				} else {
					var playerObj2 = {
						id: myId,
						position: 1,
						connected: true,
						name: name,
						choice: "",
						wins: 0,
						losses: 0
					}
					playersRef.push({player: playerObj2});
					myPlayer = "player2";
				}
				if(connectionsCount === 2) {
					gameFull = true;
				}
				
				$("#name-input").val("");
			} else {
				alert("Sorry, there are already two people playing. Please wait for your turn.");
			}
		}

	});





	
});