var current_user = "";
var player_hand = [];
var cur_game_id = -1;
var auth_token = "'"
var active_player = "";
var two_eyed_jacks = ["JD", "JC"];
var one_eyed_jacks = ["JS", "JH"];

var current_card = "";

function checkLogin() {
	if (document.cookie.length > 0) {
		var cookies = document.cookie.split(";");
		var iter;
		for (iter = 0; iter < cookies.length; iter++) {
			if (cookies[iter].split("=")[0].trim() == "email_id") {
				current_user = cookies[iter].split("=")[1];
			}
			if (cookies[iter].split("=")[0].trim() == "game_id") {
				cur_game_id = parseInt(cookies[iter].split("=")[1])
			}
			if (cookies[iter].split("=")[0].trim() == "auth_token") {
				auth_token = cookies[iter].split("=")[1];
			}
		}
		if (current_user == "" && auth_token == "") {
			document.location.href = document.location.origin + "/views/login";
		}
	}
}

function highlight_places(card) {
	if (current_user != active_player) {
		alert("Its not your turn yet wait please");
		return;
	}
	if (current_card != "" && current_card[0] != 'J')
	{
		document.getElementById(current_card + "_1").style.backgroundColor = "";
		document.getElementById(current_card + "_2").style.backgroundColor = "";
	}
	current_card = card;
	if (card[0] == 'J') {
		if (card == "JD" || card == "JC") {
			alert("Pick and open space");
		}
		else {
			alert("Remove any coin that is not part of an existing sequence");
		}
	}
	else {
		var index_pair_1 = document.getElementById(card + "_1").parentNode.id.split("_");
		var index_pair_2 = document.getElementById(card + "_2").parentNode.id.split("_");

		if ( check_played(parseInt(index_pair_1[0]), parseInt(index_pair_1[1])) && check_played(parseInt(index_pair_2[0]), parseInt(index_pair_2[1])) )
		{
			replace_card();
			return;
		}

		document.getElementById(card + "_1").style.backgroundColor = "yellow";
		document.getElementById(card + "_2").style.backgroundColor = "yellow";
	}
}

function check_played(i, j) {
	var played = false;
	played = document.getElementById("R_" + i.toString() + "_" + j.toString()).style.display != "none" || document.getElementById("G_" + i.toString() + "_" + j.toString()).style.display != "none" || document.getElementById("B_" + i.toString() + "_" + j.toString()).style.display != "none";
	if (current_card[0] != 'J') {
		played = played && ($("#" + i.toString() + "_" + j.toString()).children()[0].id.split("_")[0] == current_card);
	}
	return played;
}

function replace_card() {
	alert("changing card as it is a dead card");
	$.ajax({
		url: document.location.origin + "/api/cards?game_id=" + cur_game_id.toString() + "&email_id=" + current_user + "&current_card=" + current_card,
		type: "GET",
		headers: { "User_Email": current_user, "Auth_Token": auth_token},
		success: function(result) {
			getBoard();
		},
		error: function(error) {
			alert("Unable to replace dead card");
			console.log(error);
		}
	});
}

function play_move(i, j) {
	if (current_user != active_player) {
		alert("Its not your turn yet wait please");
		return;
	}
	if (current_card == "") {
		alert("Please select a card to play first");
		return;
	}
	var rem = 0;
	if (current_card[0] == 'J')
	{
		if (current_card == "JS" || current_card == "JH")
		{
			rem = 1;
		}
	}
	else {
		document.getElementById(current_card + "_1").style.backgroundColor = "";
		document.getElementById(current_card + "_2").style.backgroundColor = "";
	}
	if (!check_played(i, j) || rem == 1) {
		$.ajax({
			url: document.location.origin + "/api/board",
			headers: { "User_Email": current_user, "Auth_Token": auth_token},
			type: "POST",
			data: {email_id: current_user, game_id: cur_game_id, row: i, col: j, remove: rem, current_card: current_card },
			success: function(data) {
				if (data["winner"]) {
					alert("Your team wins");
				}
				current_card = "";
				getBoard();	
			},
			error: function(data) {
				alert("Unable to play move, check console for error");
				console.log(data);
			}
		})
	}
	else {
		alert("Invalid move");
	}
}

function getBoard() {
	$.ajax({
		url: document.location.origin + "/api/board?game_id=" + cur_game_id.toString() + "&email_id=" + current_user,
		type: "GET",
		headers: { "User_Email": current_user, "Auth_Token": auth_token},
		success: function(data) {
			active_player = data["current_player"];
			var board_str = data["board_state"];

			board_str = board_str.trim();
			var board = board_str.split("\n");
			var i;
			var j;
			for (i = 0; i < board.length; i++) {
				board[i] = board[i].trim();
				board[i] = board[i].split(".");
				for (j = 0; j < board[i].length; j++) {
					console.log("R_" + i.toString() + "_" + j.toString());
					document.getElementById("R_" + i.toString() + "_" + j.toString()).style.display = "none";
					document.getElementById("G_" + i.toString() + "_" + j.toString()).style.display = "none";
					document.getElementById("B_" + i.toString() + "_" + j.toString()).style.display = "none";
					if (board[i][j] != "#" && board[i][j] != "A") {
						console.log(board[i][j]);
						document.getElementById(board[i][j] + "_" + i.toString() + "_" + j.toString()).style.display = "";
					}
				}
			}
			player_hand = data["current_hand"].split(".");
			active_player = data["current_player"];
			document.getElementById("player_hand").innerHTML = "";

			document.getElementById("current_player").innerText = "current player = " + active_player;
			for (i = 0; i < player_hand.length; i++) {
				var img = document.createElement("img");
				img.src = "images/" + player_hand[i] + ".png";
				img.setAttribute("onclick", "highlight_places(\"" + player_hand[i] + "\")");
				img.setAttribute("class", "player_card");
				document.getElementById("player_hand").appendChild(img);
			}
			if (active_player == current_user) {
				alert("Its your turn!");
			}
		},
		error: function(data) {
			alert("Unable to get the game board");
			console.log(data);
		}
	});
}

function createBoard() {
	var table = document.getElementById("sequence_board");
	var sequence_board = "U.2S.3S.4S.5S.10D.QD.KD.1D.U\n6C.5C.4C.3C.2C.4S.5S.6S.7S.1C\n7C.1S.2D.3D.4D.KC.QC.10C.8S.KC\n8C.KS.6C.5C.4C.9H.8H.9C.9S.QC\n9C.QS.7C.6H.5H.2H.7H.8C.10S.10C\n1S.7H.9D.1H.4H.3H.KH.10D.6H.2D\nKS.8H.8D.2C.3C.10H.QH.QD.5H.3D\nQS.9H.7D.6D.5D.1C.1D.KD.4H.4D\n10S.10H.QH.KH.1H.3S.2S.2H.3H.5D\nU.9S.8S.7S.6S.9D.8D.7D.6D.U";
	var rows = sequence_board.split("\n");
	var i;
	var j;
	var placed = [];
	for (i = 0; i < rows.length; i++) {
		var cur_row = document.createElement("tr");

		var row = rows[i].split(".");
		for (j = 0; j < row.length; j++) {
			var id_name = row[j];
			if (row[j] != "U") {
				if (placed.includes(row[j])) {
					id_name += "_2";
				}
				else {
					id_name += "_1";
					placed.push(row[j]);
				}
			}
			var cell = document.createElement("td");
			cell.setAttribute("owning_team", "none");
			cell.id = i.toString() + "_" + j.toString();
			var img = document.createElement("img");
			if (id_name != "U") {
				img.id = id_name;
			}
			img.setAttribute("class", "board_card");
			img.src = "images/" + row[j] + ".png";
			img.setAttribute("onclick", "play_move(" + i.toString() + ", " + j.toString() + ")");
			img.setAttribute("index", i.toString() + "_" + j.toString());
			
			var r_img = document.createElement("img");
			r_img.setAttribute("class", "R");
			r_img.src = "images/red.png";
			r_img.id = "R_" + i.toString() + "_" + j.toString();
			r_img.style.display = "none";

			var g_img = document.createElement("img");
			g_img.setAttribute("class", "G");
			g_img.src = "images/green.png";
			g_img.id = "G_" + i.toString() + "_" + j.toString();
			g_img.style.display = "none";

			var b_img = document.createElement("img");
			b_img.setAttribute("class", "B");
			b_img.src = "images/blue.png";
			b_img.id = "B_" + i.toString() + "_" + j.toString();
			b_img.style.display = "none";

			cell.appendChild(img);
			cell.appendChild(r_img);
			cell.appendChild(g_img);
			cell.appendChild(b_img);

			cur_row.appendChild(cell);
		}
		table.appendChild(cur_row);
		for (j = 0; j < row.length; j++) {
			var parent_id = "#" + i.toString() + "_" + j.toString();
			var a = $(parent_id).children()[0].id;
			if (a.length > 0) {
				var x = $("#" + a).position();
				document.getElementById("R_" + i.toString() + "_" + j.toString()).style.top = x.top + 50;
				document.getElementById("R_" + i.toString() + "_" + j.toString()).style.left = x.left + 20;

				document.getElementById("G_" + i.toString() + "_" + j.toString()).style.top = x.top + 50;
				document.getElementById("G_" + i.toString() + "_" + j.toString()).style.left = x.left + 20;
				
				document.getElementById("B_" + i.toString() + "_" + j.toString()).style.top = x.top + 50;
				document.getElementById("B_" + i.toString() + "_" + j.toString()).style.left = x.left + 20;
			}
		}
	}
	getBoard();
	window.setInterval(function() { if (active_player != current_user) {getBoard()} }, 10000);
}

checkLogin();
createBoard();