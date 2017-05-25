
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


function RPS() {
  this.checkSetup();

  // Shortcuts to DOM Elements.
  this.messageList = document.getElementById('messages');
  this.messageForm = document.getElementById('message-form');
  this.messageInput = document.getElementById('message');
  this.submitButton = document.getElementById('submit');
  this.submitImageButton = document.getElementById('submitImage');
  this.imageForm = document.getElementById('image-form');
  this.mediaCapture = document.getElementById('mediaCapture');
  this.userPic = document.getElementById('user-pic');
  this.userName = document.getElementById('user-name');
  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');
  this.signInSnackbar = document.getElementById('must-signin-snackbar');

  // Saves message on form submit.
  this.messageForm.addEventListener('submit', this.saveMessage.bind(this));
  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.signInButton.addEventListener('click', this.signIn.bind(this));

  // // Toggle for the button.
  var buttonTogglingHandler = this.toggleButton.bind(this);
  this.messageInput.addEventListener('keyup', buttonTogglingHandler);
  this.messageInput.addEventListener('change', buttonTogglingHandler);

  this.initFirebase();
}

// Sets up shortcuts to Firebase features and initiate firebase auth.
RPS.prototype.initFirebase = function() {
  // TODO(DEVELOPER): Initialize Firebase.
  // Shortcuts to Firebase SDK features.
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storage = firebase.storage();

  // Initiates Firebase auth and listen to auth state changes.
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};

// Checks that the Firebase SDK has been correctly setup and configured.
RPS.prototype.checkSetup = function() {
  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions and make ' +
        'sure you are running the codelab using `firebase serve`');
  }
};

// Enables or disables the submit button depending on the values of the input
// fields.
RPS.prototype.toggleButton = function() {
  if (this.messageInput.value) {
    this.submitButton.removeAttribute('disabled');
  } else {
    this.submitButton.setAttribute('disabled', 'true');
  }
};

// Resets the given MaterialTextField.
RPS.resetMaterialTextfield = function(element) {
  element.value = '';
  element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
};

// Template for messages.
RPS.MESSAGE_TEMPLATE =
    '<div class="message-container">' +
      '<div class="spacing"><div class="pic"></div></div>' +
      '<div class="message"></div>' +
      '<div class="name"></div>' +
    '</div>';

// A loading image URL.
RPS.LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif';


// Displays a Message in the UI.
RPS.prototype.displayMessage = function(key, name, text, picUrl, imageUri) {
  var div = document.getElementById(key);
  // If an element for that message does not exists yet we create it.
  if (!div) {
    var container = document.createElement('div');
    container.innerHTML = RPS.MESSAGE_TEMPLATE;
    div = container.firstChild;
    // console.log(div);
    div.setAttribute('id', key);
    this.messageList.appendChild(div);
  }
  if (picUrl) {
    div.querySelector('.pic').style.backgroundImage = 'url(' + picUrl + ')';
  }
  div.querySelector('.name').textContent = name;
  var messageElement = div.querySelector('.message');
  if (text) { // If the message is text.
    messageElement.textContent = text;
    // Replace all line breaks by <br>.
    messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
  }
  // Show the card fading-in.
  setTimeout(function() {div.classList.add('visible')}, 1);
  this.messageList.scrollTop = this.messageList.scrollHeight;
  this.messageInput.focus();
};

// Loads chat messages history and listens for upcoming ones.
RPS.prototype.loadMessages = function() {
  // TODO(DEVELOPER): Load and listens for new messages.
  // Reference to the /messages/ database path.
  this.messagesRef = this.database.ref('messages');
  // Make sure we remove all previous listeners.
  this.messagesRef.off();

  // Loads the last 12 messages and listen for new ones.
  var setMessage = function(data) {
    var val = data.val();
    this.displayMessage(data.key, val.name, val.text, val.photoUrl, val.imageUrl);
  }.bind(this);
  this.messagesRef.limitToLast(12).on('child_added', setMessage);
  this.messagesRef.limitToLast(12).on('child_changed', setMessage);
};

// Signs-in Chat.
RPS.prototype.signIn = function() {
  // TODO(DEVELOPER): Sign in Firebase with credential from the Google user.
  // Sign in Firebase using popup auth and Google as the identity provider.
  var provider = new firebase.auth.GoogleAuthProvider();
  this.auth.signInWithPopup(provider);
};

// Signs-out of Chat.
RPS.prototype.signOut = function() {
  // TODO(DEVELOPER): Sign out of Firebase.
  // Sign out of Firebase.
  this.auth.signOut();
};

// Triggers when the auth state change for instance when the user signs-in or signs-out.
RPS.prototype.onAuthStateChanged = function(user) {
  if (user) { // User is signed in!
    // Get profile pic and user's name from the Firebase user object.
    var profilePicUrl = user.photoURL; // Only change these two lines!
    var userName = user.displayName;   // Only change these two lines!

    // Set the user's profile pic and name.
    this.userPic.style.backgroundImage = 'url(' + profilePicUrl + ')';
    this.userName.textContent = userName;

    // Show user's profile and sign-out button.
    this.userName.removeAttribute('hidden');
    this.userPic.removeAttribute('hidden');
    this.signOutButton.removeAttribute('hidden');

    // Hide sign-in button.
    this.signInButton.setAttribute('hidden', 'true');

    // We load currently existing chant messages.
    this.loadMessages();

    // We save the Firebase Messaging Device token and enable notifications.
    // this.saveMessagingDeviceToken();
  } else { // User is signed out!
    // Hide user's profile and sign-out button.
    this.userName.setAttribute('hidden', 'true');
    this.userPic.setAttribute('hidden', 'true');
    this.signOutButton.setAttribute('hidden', 'true');

    // Show sign-in button.
    this.signInButton.removeAttribute('hidden');
  }
};

// Returns true if user is signed-in. Otherwise false and displays a message.
RPS.prototype.checkSignedInWithMessage = function() {
  /* TODO(DEVELOPER): Check if user is signed-in Firebase. */
  // Return true if the user is signed in Firebase
  if (this.auth.currentUser) {
    return true;
  }
  // Display a message to the user using a Toast.
  var data = {
    message: 'You must sign-in first',
    timeout: 2000
  };
  this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
  return false;
};

// Saves a new message on the Firebase DB.
RPS.prototype.saveMessage = function(e) {
  e.preventDefault();
  // Check that the user entered a message and is signed in.
  if (this.messageInput.value && this.checkSignedInWithMessage()) {
    var currentUser = this.auth.currentUser;
    // Add a new message entry to the Firebase Database.
    this.messagesRef.push({
      name: currentUser.displayName,
      text: this.messageInput.value,
      photoUrl: currentUser.photoURL || '/images/profile_placeholder.png'
    }).then(function() {
      // Clear message text field and SEND button state.
      RPS.resetMaterialTextfield(this.messageInput);
      this.toggleButton();
    }.bind(this)).catch(function(error) {
      console.error('Error writing new message to Firebase Database', error);
    });
  }
};


window.onload = function() {
	window.rps = new RPS();
	var database = window.rps.database;
	var connectionsRef = database.ref("/connections");

    var connectedRef = database.ref(".info/connected");

    var playersRef = database.ref("/players");

    var choicesRef = database.ref("/choices");

	// Initialize Firebase
  	// var config = {
	  //   apiKey: "AIzaSyAw-cQ16-cH52Q1JxwjRIrlaF25IkXRMig",
	  //   authDomain: "rps-multiplayer-7a8d2.firebaseapp.com",
	  //   databaseURL: "https://rps-multiplayer-7a8d2.firebaseio.com",
	  //   projectId: "rps-multiplayer-7a8d2",
	  //   storageBucket: "rps-multiplayer-7a8d2.appspot.com",
	  //   messagingSenderId: "796019987964"
   //  };
   //  firebase.initializeApp(config);

   //  var database = firebase.database();


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

	// // Number of online users is the number of objects in the presence list.
	// // When first loaded or when the connections list changes...
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
		}
		choice1.choice = "";
		choice2.choice = "";
		choicesRef.remove();
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

 //    $("#check").on("click", function() {
	// 	console.log(choice1);
	// 	console.log(choice2);
	// });

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
					numChosen = 0;
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
					numChosen = 0;
				}
				$("#name-input").val("");
				$(".start").css("display", "none");
				$("#status").html("Pick Rock, Paper, or Scissors!");
			} else {
				alert("Sorry, there are already two people playing. Please wait for your turn.");
			}
		}

	});
};