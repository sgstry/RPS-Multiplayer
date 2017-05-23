
var connectionsCount = 0;

var gameFull = false;

var myPlayer = "";
var myId = "";

var p1Wins = 0;
var p1Losses = 0;
var p2Wins = 0;
var p2Losses = 0;

var chosen = false;
var numChosen = 0;

var choice1 = {
	choice: "",
	position: 0
};

var choice2 = {
	choice: "",
	position: 1
};

var player1 = {
	id: myId,
	position: 0,
	connected: false,
	name: ""
};

var player2 = {
	id: myId,
	position: 1,
	connected: false,
	name: ""
};

var numPlayers = 0;


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

	var choicesRef = database.ref("/choices");


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
		    choice1.choice = "";
		    choice1.position = 0;
		    p1Wins = 0;
		    p1Losses = 0;
		} else if(pNum === 1){
			player2.id = "";
		    player2.position = 1;
		    player2.connected = false;
		    player2.name = "";
		    choice2.choice = "";
		    choice2.position = 1;
		    p2Wins = 0;
		    p2Losses = 0;
		}
	};

	var resetScreen = function() {
		$(".p1choice").css("background-color", "white");
		$(".p2choice").css("background-color", "white");
		$(".p1choice").css("color", "black");
		$(".p2choice").css("color", "black");
		chosen = false;
		if(myPlayer != "") {
			$("#status").html("Pick Rock, Paper, or Scissors!");
			choice1.choice = "";
			choice2.choice = "";
			choicesRef.remove();
		}
	};

	var decideWinner = function() {
		var c1 = choice1.choice;
		var c2 = choice2.choice;

		if(c1 === "Rock" && c2 === "Rock") {
			$("#status").html("Tie! Play Again!");
		} else if(c1 === "Rock" && c2 === "Paper") {
			p2Wins++;
			p1Losses++;
			$("#status").html(player2.name+" wins with Paper!");
		} else if(c1 === "Rock" && c2 === "Scissors") {
			p1Wins++;
			p2Losses++;
			$("#status").html(player1.name+" wins with Rock!");
		} else if(c1 === "Paper" && c2 === "Rock") {
			p1Wins++;
			p2Losses++
			$("#status").html(player1.name+" wins with Paper!");
		} else if(c1 === "Paper" && c2 === "Paper") {
			$("#status").html("Tie! Play Again");
		} else if(c1 === "Paper" && c2 === "Scissors") {
			p2Wins++;
			p1Losses++;
			$("#status").html(player2.name+" wins with Scissors!");
		} else if(c1 === "Scissors" && c2 === "Rock") {
			p2Wins++;
			p1Losses++;
			$("#status").html(player2.name+" wins with Rock!");
		} else if(c1 === "Scissors" && c2 === "Paper") {
			p1Wins++;
			p2Losses++;
			$("#status").html(player1.name+" wins with Scissors!");
		} else if(c1 === "Scissors" && c2 === "Scissors") {
			$("#status").html("Tie! Play Again!");
		}

	    $("#player2-score").html("Wins: "+p2Wins+" Losses: "+p2Losses);
	    $("#player1-score").html("Wins: "+p1Wins+" Losses: "+p1Losses);
	    numChosen = 0;
	    setTimeout(resetScreen, 4000);

	};	

	choicesRef.on("child_added", function(snapshot){
			numChosen++;
			var choice = snapshot.val().choice;
			var pos = snapshot.val().position;
			if(pos === 1) {
				choice2.choice = choice;
				choice2.position = pos;
			} else if(pos === 0) {
				choice1.choice = choice;
				choice1.position = pos;	
			}
			if(myPlayer != "") {
				if(numChosen === 2) {
					decideWinner();
				}
			}
	});

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
		  	numPlayers++;
	    	$("#player2-name").html(player2.name);
	    	$("#player2-score").html("Wins: "+p2Wins+" Losses: "+p2Losses);
	    	$("#player2-score").css("display", "block");
	      	$(".p2choice").css("display", "block");
	    } else if(pos === 0){
	      	for (var key in player) {
	  			if (player1.hasOwnProperty(key)) {
	    				player1[key] = player[key];
	  			}
	  		}
	  		numPlayers++;
	    	$("#player1-name").html(player1.name);
	    	$("#player1-score").html("Wins: "+p1Wins+" Losses: "+p1Losses);
	    	$("#player1-score").css("display", "block");
	      	$(".p1choice").css("display", "block");
	    }
	    $("#num-players").html(numPlayers);
	    if(numPlayers >= 2) {
	    	gameFull = true;
	    }
      },function(errorObject) {
        console.log("The read failed: " + errorObject.code);
    });

	//Remove both players and add one back if still connected
    playersRef.on("child_removed", function(snapshot){
    	numPlayers--;
    	$("#num-players").html(numPlayers);
    	if(numPlayers<2) {
    		gameFull = false;
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
      		}
        }
        if(!isPlayerHere(player2, connections)) {
      		$("#player2-name").html("Waiting for Player 2 to join...");
      		$("#player2-score").css("display", "none");
      		$(".p2choice").css("display", "none");
      		if(player2.connected === true) {
      			resetPlayer(1);
      		}
        }

    }, function(errorObject) {
      console.log("The read failed: " + errorObject.code);
    });

    $("#check").on("click", function() {
		console.log(choice1);
		console.log(choice2);
	});

    $(".p1choice").mouseover(function(){
		if(myPlayer === "player1" && !chosen) {
			$(this).css("background-color", "yellow");
		}
	});

	$(".p1choice").mouseout(function(){
		if(myPlayer === "player1" && !chosen) {
    		$(this).css("background-color", "white");
    	}
	});

	$(".p1choice").on("click", function() {
		if(myPlayer === "player1" && !chosen && player2.connected) {
			chosen = true;
			var ref = choicesRef.push({choice: $(this).text(),
									   position: 0});
			ref.onDisconnect().remove();
			$(this).css("background-color", "blue");
			$(this).css("color", "yellow");
			if(choice2.choice === "") {
				$("#status").html("Waiting on "+player2.name+" to choose...");
			}
		}
	});

	$(".p2choice").mouseover(function(){
		if(myPlayer === "player2" && !chosen) {
			$(this).css("background-color", "yellow");
		}
	});

	$(".p2choice").mouseout(function(){
		if(myPlayer === "player2" && !chosen) {
    		$(this).css("background-color", "white");
		}
	});

	$(".p2choice").on("click", function() {
		if(myPlayer === "player2" && !chosen && player1.connected) {
			chosen = true;
			var ref = choicesRef.push({choice: $(this).text(),
									 position: 1});
			ref.onDisconnect().remove();
			$(this).css("background-color", "blue");
			$(this).css("color", "yellow");
			if(choice1.choice === "") {
				$("#status").html("Waiting on "+player1.name+" to choose...");
			}
		}
	});


	$("#start-btn").on("click", function() {
		event.preventDefault();
		var name = $("#name-input").val().trim();
		if(name === "") {
			alert("Please enter your name.");
		} else {
			if(!gameFull) {
				if(!player1.connected) {
					var playerObj1 = {
						id: myId,
						position: 0,
						connected: true,
						name: name
					};
					var ref = playersRef.push({player: playerObj1});
					ref.onDisconnect().remove();
					myPlayer = "player1";
				} else {
					var playerObj2 = {
						id: myId,
						position: 1,
						connected: true,
						name: name
					}
					var ref = playersRef.push({player: playerObj2});
					ref.onDisconnect().remove();
					myPlayer = "player2";
				}
				$("#name-input").val("");
				$(".start").css("display", "none");
				$("#status").html("Pick Rock, Paper, or Scissors!");
			} else {
				alert("Sorry, there are already two people playing. Please wait for your turn.");
			}
		}

	});





	
});