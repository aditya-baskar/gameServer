var current_user = "";
var player_hand = [];
var cur_game_id = -1;
var auth_token = "'"
var active_player = "";
var two_eyed_jacks = ["JD", "JC"];
var one_eyed_jacks = ["JS", "JH"];

var current_card = "";
var last_player_move = null;
var game_started = false;

var users_joined = [];
var active_callers = [];
var droppedCalls = [];

var vid_map = {}
var boardFetchInterval = null;

function end(){
	broadcaster.hangup();
	viewer.hangup();
}

function mute(){
	broadcaster.camera.toggleAudio();
	viewer.camera.toggleAudio();
	if (document.getElementById("mute").innerHTML == "Unmute")
	{
		$('#mute').html('mute');
	}
	else
	{
		$('#mute').html('Unmute');
	}
}

function pause(){
	broadcaster.camera.toggleVideo();
	viewer.camera.toggleVideo();
	if (document.getElementById("pause").innerHTML == "Unpause")
	{
		$('#pause').html('Pause');
	}
	else
	{
		$('#pause').html('Unpause');
	}
}

function joinCall(){
	var viewer = window.viewer = PHONE({
	    number		: current_user + "_viewer",
		publish_key   : 'pub-c-c9cf28b9-7b29-4e81-a591-bbafd2f0f22b',
		subscribe_key : 'sub-c-d6f62dcc-972d-11ea-84ed-1e1b4c21df71'
	});
	
	viewer.ready(function(){
		for (i = 0; i < active_callers.length; i++) {
			if (!users_joined.includes(active_callers[i] + "_sender"))
			{
				console.log(viewer.dial(active_callers[i] + "_sender"))
			}
		}
		vid_map[current_user] = viewer.camera.video();
	});

	viewer.receive(function(new_broadcaster){
	    new_broadcaster.connected(function(cur_broadcaster){
	    	if (!users_joined.includes(cur_broadcaster.number))
			{
				users_joined.push(cur_broadcaster.number);
			}
			else
			{
				console.log("duplicate call " + cur_broadcaster.number);
			}
			cur_broadcaster.video.id = cur_broadcaster.number;
			vid_map[cur_broadcaster.number.split("_")[0]] = (cur_broadcaster.video);
			
		});
		new_broadcaster.ended(function(cur_broadcaster){
			users_joined.pop(cur_broadcaster.number);
			vid_map[cur_broadcaster.number.split("_")[0]] = null;
			console.log(cur_broadcaster.number + " ended the call")
		});
	});
}

function addUserBackToCall(caller) {
	console.log(caller);
	console.log(window.viewer.dial(caller + "_sender"));
	window.viewer.receive(function(new_broadcaster){
	    new_broadcaster.connected(function(cur_broadcaster){
	    	if (!users_joined.includes(cur_broadcaster.number))
			{
				users_joined.push(cur_broadcaster.number);
			}
			else
			{
				console.log("duplicate call " + cur_broadcaster.number);
			}
			cur_broadcaster.video.id = cur_broadcaster.number;
			vid_map[cur_broadcaster.number.split("_")[0]] = cur_broadcaster.video;
			
		});
		new_broadcaster.ended(function(cur_broadcaster){
			users_joined.pop(cur_broadcaster.number);
			vid_map[cur_broadcaster.number.split("_")[0]] = null;
			console.log(cur_broadcaster.number + " ended the call")
		});
	});
}

function initCall() {
	var broadcaster = window.broadcaster = PHONE({
		number : current_user + "_sender",
		publish_key   : 'pub-c-c9cf28b9-7b29-4e81-a591-bbafd2f0f22b',
		subscribe_key : 'sub-c-d6f62dcc-972d-11ea-84ed-1e1b4c21df71'
	});
	broadcaster.receive(function(new_viewer){
		new_viewer.connected(function(cur_viewer){
			console.log(cur_viewer.number + " joined");
			if (droppedCalls.includes(cur_viewer.number.split("_")[0])) {
				droppedCalls.pop(cur_viewer.number.split("_")[0]);
				addUserBackToCall(cur_viewer.number.split("_")[0]);
			}
			else if (document.getElementById("img_" + cur_viewer.number.split("_")[0]) != null)
			{
				addUserBackToCall(cur_viewer.number.split("_")[0]);
			}
		}); // new viewer joined
		new_viewer.ended(function(cur_viewer){
			console.log(cur_viewer.number + " left");
			droppedCalls.push(cur_viewer.number.split("_")[0])
			vid_map[cur_viewer.number.split("_")[0]] = null
		});  // viewer left
	});
}

function sleep(delay) {
    var start = new Date().getTime();
    while (new Date().getTime() < start + 1000);
}

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
	
	return played;
}

function check_allowed_move(i, j) {
	var allowed = true;
	if (current_card[0] != 'J') {
		allowed = ($("[index='" + i.toString() + "_" + j.toString() + "']").attr("id").split("_")[0] == current_card);
	}
	return allowed;
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
	var played_bool = check_played(i, j)
	var allowed = check_allowed_move(i, j);
	
	if ((played_bool && rem == 1) || (!played_bool && rem == 0 && allowed)) {
		$.ajax({
			url: document.location.origin + "/api/board",
			headers: { "User_Email": current_user, "Auth_Token": auth_token},
			type: "POST",
			data: {email_id: current_user, game_id: cur_game_id, row: i, col: j, remove: rem, current_card: current_card },
			success: function(data) {
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
		headers: { "User_Email": current_user, "Auth_Token": auth_token },
		success: function(data) {
			var players_dom_element = document.getElementById("player_rotation");
			var i;
			var j;
			player_list = data["players"];
			
			if (!game_started && data["started"] == 1) {
				initCall();
				document.getElementById("wait").style.display = "none";
				document.getElementById('container').style.display = "";
				game_started = true;
				var player_len = player_list.length;
				for (i = 0; i < player_list.length; i++) {
					if (player_len == 4) {
						if (current_user == player_list[i]["email_id"]) {
							if (i%2 == 0)
							{
								alert("You are in team Red, " + player_list[0]["email_id"] + " and " + player_list[2]["email_id"])
							}
							else
							{
								alert("You are in team Green, " + player_list[1]["email_id"] + " and " + player_list[3]["email_id"])	
							}
						}
					}
					if (player_len == 6) {
						if (current_user == player_list[i]["email_id"]) {
							if (i%3 == 0)
							{
								alert("You are in team Red, " + player_list[0]["email_id"] + " and " + player_list[3]["email_id"])
							}
							else if (i%3 == 1)
							{
								alert("You are in team Green, " + player_list[1]["email_id"] + " and " + player_list[4]["email_id"])	
							}
							else
							{
								alert("You are in team Blue, " + player_list[2]["email_id"] + " and " + player_list[5]["email_id"])	
							}
						}
					}
				}
				active_callers = [];
				for (i = 0; i<player_list.length; i++)
				{
					var user_div = document.getElementById(player_list[i]["email_id"]);
					if (user_div == null) {
						user_div = document.createElement("div");
						user_div.id = player_list[i]["email_id"];
						players_dom_element.appendChild(user_div);
						var p = document.createElement("p");
						p.innerHTML = player_list[i]["name"];
						
						user_div.appendChild(p);
						
					}
					
					if (player_list[i]["email_id"] != current_user)
					{
						active_callers.push(player_list[i]["email_id"]);
					}
				}
				joinCall();
				window.clearInterval(boardFetchInterval);
				boardFetchInterval = window.setInterval(function() { getBoard() }, 10000);
			}
			if (data["winner"] != null) {
				team_name = ""
				if (data["winner"].toLowerCase() == "r") {
					team_name = "Red";
				}
				else if (data["winner"].toLowerCase() == "g") {
					team_name = "Green";
				}
				else if (data["winner"].toLowerCase() == "b") {
					team_name = "Blue";
				}
				//alert(team_name + " team wins!");
			}
			for (i = 0; i < player_list.length; i++)
			{
				var user_div = document.getElementById(player_list[i]["email_id"]);
				if (user_div == null) 
				{
					user_div = document.createElement("div");
					user_div.id = player_list[i]["email_id"];
					players_dom_element.appendChild(user_div);
				}
				var img = document.getElementById("img_" + player_list[i]["email_id"]);
				var vid = document.getElementById("vid_" + player_list[i]["email_id"]);
				
				if (img == null && vid_map[player_list[i]["email_id"]] == null)
				{
					img = document.createElement("img");
					img.src = player_list[i]["img_url"];
					img.setAttribute("class", "player_image");
					img.setAttribute("user", player_list[i]["email_id"]);
					img.id = "img_" + player_list[i]["email_id"];
					if (vid != null)
					{
						user_div.removeChild(vid);
					}
					user_div.appendChild(img);
				}

				if (vid_map[player_list[i]["email_id"]] != null)
				{
					if (vid != null)
					{
						user_div.removeChild(vid);
					}
					vid = vid_map[player_list[i]["email_id"]];
					vid.width = "200"
					vid.id = "vid_" + player_list[i]["email_id"];
					if (img != null)
					{
						user_div.removeChild(img);
					}
					user_div.appendChild(vid);
				}
			}
			var a = document.getElementsByClassName("active_image");
			for (i = 0; i < a.length; i++)
			{
				a[i].classList.remove("active_image");
			}
			document.getElementById(data["current_player"]).classList.add("active_image");
			
			var board_str = data["board_state"];

			board_str = board_str.trim();
			var board = board_str.split("\n");
			for (i = 0; i < board.length; i++) {
				board[i] = board[i].trim();
				board[i] = board[i].split(".");
				for (j = 0; j < board[i].length; j++) {
					document.getElementById("R_" + i.toString() + "_" + j.toString()).style.display = "none";
					document.getElementById("G_" + i.toString() + "_" + j.toString()).style.display = "none";
					document.getElementById("B_" + i.toString() + "_" + j.toString()).style.display = "none";
					if (board[i][j] != "#" && board[i][j] != "A") {
						document.getElementById(board[i][j] + "_" + i.toString() + "_" + j.toString()).style.display = "";
					}
				}
			}
			player_hand = data["current_hand"].split(".");
			active_player = data["current_player"];
			document.getElementById("player_hand").innerHTML = "";

			for (i = 0; i < player_hand.length; i++) {
				var img = document.createElement("img");
				img.src = "images/" + player_hand[i] + ".png";
				img.setAttribute("onclick", "highlight_places(\"" + player_hand[i] + "\")");
				img.setAttribute("class", "player_card");
				document.getElementById("player_hand").appendChild(img);
			}

			if (data["last_move"] != last_player_move) {
				show_turn(data);
			}
		},
		error: function(data) {
			console.log(data);
		}
	});
}

function show_turn(data) {
	last_player_move = data["last_move"];
	last_move = data["last_move"].split("::");
	var t;
	var l;
	var moving_image;
	var start_pos = $("[id='" + last_move[0] + "']").position();
	t = start_pos.top;
	l = start_pos.left;
	if (document.getElementById("moving_image") == undefined) {
		moving_image = document.createElement("img");
		moving_image.id = "moving_image";
		moving_image.style.display = "none";
		document.getElementById("container").appendChild(moving_image);
	}
	moving_image = document.getElementById("moving_image");
	var card_img = "images/" + last_move[4] + ".png";
	moving_image.src = card_img;
	moving_image.style.top = t;
	moving_image.style.left = l;
	moving_image.style.display = "";
	var end_pos = document.getElementById("deck");
	$("#moving_image").animate({
		left: end_pos.offsetLeft + 50,
		top: end_pos.offsetTop + 50
	},
	{
		duration: 2000,
		complete: function() {
			moving_image = document.getElementById("moving_image");
			moving_image.src = "images/point.png";
			if (last_move[3] == "#") {
				var end_pos = document.getElementById("R_" + last_move[1] + "_" + last_move[2]).parentElement;

				$("#moving_image").animate({
					left: end_pos.offsetLeft + 50,
					top: end_pos.offsetTop + 50
				},
				{
					duration: 2000,
					complete: function() {
						if (document.getElementById("R_" + last_move[1] + "_" + last_move[2]).style.display != "none") {
							moving_image.src = "images/red.png";
							end_pos = document.getElementById("red_coins");
							document.getElementById("R_" + last_move[1] + "_" + last_move[2]).style.display = "none";
						}
						else if (document.getElementById("G_" + last_move[1] + "_" + last_move[2]).style.display != "none") {
							moving_image.src = "images/green.png";
							end_pos = document.getElementById("green_coins");
							document.getElementById("G_" + last_move[1] + "_" + last_move[2]).style.display = "none";
						}
						else if (document.getElementById("B_" + last_move[1] + "_" + last_move[2]).style.display != "none") {
							moving_image.src = "images/blue.png";
							end_pos = document.getElementById("blue_coins");
							document.getElementById("B_" + last_move[1] + "_" + last_move[2]).style.display = "none";
						}
						$("#moving_image").animate({
							left: end_pos.offsetLeft + 50,
							top: end_pos.offsetTop + 50,
						},
						{
							duration: 2000,
							complete: function() {
								if (last_move[3] != "#") {
									document.getElementById(last_move[3].toUpperCase() + "_" + last_move[1] + "_" + last_move[2]).style.display = ""
								}
								document.getElementById("moving_image").style.display = "none";
							}
						});
					}
				});
			}
			else {
				if (last_move[3].toLowerCase() == "r") {
					end_pos = document.getElementById("red_coins");
					$("#moving_image").animate({
						left: end_pos.offsetLeft + 50,
						top: end_pos.offsetTop + 50,
					},
					{
						duration: 2000,
						complete: function() {
							moving_image.src = "images/red.png";
							end_pos = document.getElementById("R_" + last_move[1] + "_" + last_move[2]).parentElement;
							$("#moving_image").animate({
								left: end_pos.offsetLeft + 50,
								top: end_pos.offsetTop + 50,
							},
							{
								duration: 2000,
								complete: function() {
									if (last_move[3] != "#") {
										document.getElementById(last_move[3].toUpperCase() + "_" + last_move[1] + "_" + last_move[2]).style.display = ""
									}
									document.getElementById("moving_image").style.display = "none";
								}
							});
						}
					});
				}
				else if (last_move[3].toLowerCase() == "g") {
					end_pos = document.getElementById("green_coins");
					$("#moving_image").animate({
						left: end_pos.offsetLeft + 50,
						top: end_pos.offsetTop + 50,
					},
					{
						duration: 2000,
						complete: function() {
							moving_image.src = "images/green.png";
							end_pos = document.getElementById("G_" + last_move[1] + "_" + last_move[2]).parentElement;
							$("#moving_image").animate({
								left: end_pos.offsetLeft + 50,
								top: end_pos.offsetTop + 50,
							},
							{
								duration: 2000,
								complete: function() {
									if (last_move[3] != "#") {
										document.getElementById(last_move[3].toUpperCase() + "_" + last_move[1] + "_" + last_move[2]).style.display = ""
									}
									document.getElementById("moving_image").style.display = "none";
								}
							});
						}
					});
				}
				else if (last_move[3].toLowerCase() == "b") {
					end_pos = document.getElementById("blue_coins");
					$("#moving_image").animate({
						left: end_pos.offsetLeft + 50,
						top: end_pos.offsetTop + 50,
					},
					{
					duration: 2000,
					complete: function() {
							moving_image.src = "images/blue.png";
							end_pos = document.getElementById("B_" + last_move[1] + "_" + last_move[2]).parentElement;
							$("#moving_image").animate({
								left: end_pos.offsetLeft + 50,
								top: end_pos.offsetTop + 50,
							},
							{
								duration: 2000,
								complete: function() {
									if (last_move[3] != "#") {
										document.getElementById(last_move[3].toUpperCase() + "_" + last_move[1] + "_" + last_move[2]).style.display = ""
									}
									document.getElementById("moving_image").style.display = "none";
								}
							});
						}
					});
				}
			}
		}
	});
}

function vertical_board() {
	var i = 0;
	var j = 0;
	var player_hand = document.getElementById("player_hand");
	player_hand.style.width = "100%";
	player_hand.style.height = "250px";

	player_hand.style.textAlign = "left";
	var board_cards = document.getElementsByClassName("board_card");
	for (i = 0; i < 10; i++) {
		for (j = 0; j < 10; j++) {
			var r = document.getElementById("R_" + i.toString() + "_" + j.toString());
			var g = document.getElementById("G_" + i.toString() + "_" + j.toString());
			var b = document.getElementById("B_" + i.toString() + "_" + j.toString());
			var image = $("[index='" + i.toString() + "_" + j.toString() + "']");
			image.width(130);
			image.height(195);
			var img_src = image.attr("src").split("/");
			if (img_src[img_src.length - 2] == "board_cards") {
				img_src.splice(img_src.length - 2, 1);
				image.attr("src", img_src.join("/"));
			}
			image.parent().width(150);
			image.parent().height(215);
		}
	}
}


function horizontal_board() {
	var i = 0;
	var j = 0;
	var player_hand = document.getElementById("player_hand");
	player_hand.style.height = "100%";
	player_hand.style.width = "200px";
	player_hand.style.textAlign = "center";
	var board_cards = document.getElementsByClassName("board_card");
	for (i = 0; i < 10; i++) {
		for (j = 0; j < 10; j++) {
			var r = document.getElementById("R_" + i.toString() + "_" + j.toString());
			var g = document.getElementById("G_" + i.toString() + "_" + j.toString());
			var b = document.getElementById("B_" + i.toString() + "_" + j.toString());
			var image = $("[index='" + i.toString() + "_" + j.toString() + "']");
			image.width(195);
			image.height(130);
			var img_src = image.attr("src").split("/");
			if (img_src[img_src.length - 2] != "board_cards") {
				var k = 0;
				var a = [];
				
				for (k = 0; k <= img_src.length - 2; k++) {
					a.push(img_src[k]);
				}
				a.push("board_cards");
				a.push(img_src[img_src.length - 1]);
				image.attr("src", a.join("/"));
			}
			image.parent().width(215);
			image.parent().height(150);
		}
	}
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
			img.src = "images/board_cards/" + row[j] + ".png";
			img.setAttribute("onclick", "play_move(" + i.toString() + ", " + j.toString() + ")");
			img.setAttribute("index", i.toString() + "_" + j.toString());

			var r_img = document.createElement("img");
			r_img.setAttribute("class", "R");
			r_img.src = "images/red.png";
			r_img.id = "R_" + i.toString() + "_" + j.toString();
			r_img.style.display = "none";
			r_img.setAttribute("onclick", "play_move(" + i.toString() + ", " + j.toString() + ")");

			var g_img = document.createElement("img");
			g_img.setAttribute("class", "G");
			g_img.src = "images/green.png";
			g_img.id = "G_" + i.toString() + "_" + j.toString();
			g_img.style.display = "none";
			g_img.setAttribute("onclick", "play_move(" + i.toString() + ", " + j.toString() + ")");

			var b_img = document.createElement("img");
			b_img.setAttribute("class", "B");
			b_img.src = "images/blue.png";
			b_img.id = "B_" + i.toString() + "_" + j.toString();
			b_img.style.display = "none";
			b_img.setAttribute("onclick", "play_move(" + i.toString() + ", " + j.toString() + ")");

			cell.appendChild(img);
			cell.appendChild(r_img);
			cell.appendChild(g_img);
			cell.appendChild(b_img);

			cur_row.appendChild(cell);
		}
		table.appendChild(cur_row);
	}
	boardFetchInterval = window.setInterval(function() { getBoard() }, 1000);
}

checkLogin();
createBoard();
horizontal_board();