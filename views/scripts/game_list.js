var user_email = ""
var current_game = -1

function checkLogin() {
	if (document.cookie.length > 0) {
		var cookies = document.cookie.split(";");
		var iter;
		for (iter = 0; iter < cookies.length; iter++) {
			if (cookies[iter].split("=")[0].trim() == "email_id") {
				user_email = cookies[iter].split("=")[1];
			}
			if (cookies[iter].split("=")[0].trim() == "auth_token") {
				auth_token = cookies[iter].split("=")[1];
			}
		}
		if (user_email == "" && auth_token == "") {
			document.location.href = document.location.origin + "/views/login";
		}
		document.cookie = "game_id=" + current_game.toString();
	}
}

function refresh_all_games() {
	$.ajax({
		url: document.location.origin + "/api/game", 
		type: "GET",
		headers: { "User_Email": user_email, "Auth_Token": auth_token},
		success: function(data) {
			var game_list = document.getElementById("availableGames");
			for (i = 0; i < data["games"].length; i++) {
				if (document.getElementById(data["games"][i]["game_id"].toString()) == null) {
					var cur_row = document.createElement("tr");
					game_id = data["games"][i]["game_id"].toString()
					cur_row.id = game_id;
					var c1 = document.createElement("td");
					c1.id = game_id + "_P1";
					if (data["games"][i]["P1"] != null) {
						c1.innerText = data["games"][i]["P1"]["name"];
					}
					cur_row.appendChild(c1);

					var c2 = document.createElement("td");
					c2.id = game_id + "_P2";
					if (data["games"][i]["P2"] != null) {
						c2.innerText = data["games"][i]["P2"]["name"];
					}
					cur_row.appendChild(c2);
					
					var c3 = document.createElement("td");
					c3.id = game_id + "_P3";
					if (data["games"][i]["P3"] != null) {
						c3.innerText = data["games"][i]["P3"]["name"];
					}
					cur_row.appendChild(c3);
					
					var c4 = document.createElement("td");
					c4.id = game_id + "_P4";
					if (data["games"][i]["P4"] != null) {
						c4.innerText = data["games"][i]["P4"]["name"];
					}
					cur_row.appendChild(c4);
					
					var c5 = document.createElement("td");
					c5.id = game_id + "_P5";
					if (data["games"][i]["P5"] != null) {
						c5.innerText = data["games"][i]["P5"]["name"];
					}
					cur_row.appendChild(c5);
					
					var c6 = document.createElement("td");
					c6.id = game_id + "_P6";
					if (data["games"][i]["P6"] != null) {
						c6.innerText = data["games"][i]["P6"]["name"];
					}
					cur_row.appendChild(c6);

					var c7 = document.createElement("td");
					if (data["games"][i]["P1"]["email_id"] == user_email)
					{
						c7.innerHTML = "<button type=\"button\" class=\"btn btn-primary\" onclick=\"start_game(" + game_id + ")\">Start Game</button>";
					}
					else
					{
						c7.innerHTML = "<button type=\"button\" class=\"btn btn-primary\" onclick=\"join_game(" + game_id + ")\">Join Game</button>";
					}
					cur_row.appendChild(c7);
					game_list.appendChild(cur_row);
				}
				else {
					id = data["games"][i]["game_id"].toString();
					if (data["games"][i]["P1"] != null) {
						document.getElementById(id + "_P1").innerText = data["games"][i]["P1"]["name"];
					}
					if (data["games"][i]["P2"] != null) {
						document.getElementById(id + "_P2").innerText = data["games"][i]["P2"]["name"];
					}
					if (data["games"][i]["P3"] != null) {
						document.getElementById(id + "_P3").innerText = data["games"][i]["P3"]["name"];
					}
					if (data["games"][i]["P4"] != null) {
						document.getElementById(id + "_P4").innerText = data["games"][i]["P4"]["name"];
					}
					if (data["games"][i]["P5"] != null) {
						document.getElementById(id + "_P5").innerText = data["games"][i]["P5"]["name"];
					}
					if (data["games"][i]["P6"] != null) {
						document.getElementById(id + "_P6").innerText = data["games"][i]["P6"]["name"];
					}
				}
			}
		},
		error: function(error) {
			console.log(error);
		}
	});
}

function get_all_games() {
	$.ajax({
		url: document.location.origin + "/api/game", 
		type: "GET",
		headers: { "User_Email": user_email, "Auth_Token": auth_token},
		success: function(data) {
			var game_list = document.getElementById("availableGames");
			var i;
			for (i = 0; i < data["games"].length; i++) {
				var cur_row = document.createElement("tr");
				game_id = data["games"][i]["game_id"].toString()
				cur_row.id = game_id;
				cur_row.setAttribute("class", "game");
				var c1 = document.createElement("td");
				c1.id = game_id + "_P1";
				if (data["games"][i]["P1"] != null) {
					c1.innerText = data["games"][i]["P1"]["name"];
				}
				cur_row.appendChild(c1);

				var c2 = document.createElement("td");
				c2.id = game_id + "_P2";
				if (data["games"][i]["P2"] != null) {
					c2.innerText = data["games"][i]["P2"]["name"];
				}
				cur_row.appendChild(c2);
				
				var c3 = document.createElement("td");
				c3.id = game_id + "_P3";
				if (data["games"][i]["P3"] != null) {
					c3.innerText = data["games"][i]["P3"]["name"];
				}
				cur_row.appendChild(c3);
				
				var c4 = document.createElement("td");
				c4.id = game_id + "_P4";
				if (data["games"][i]["P4"] != null) {
					c4.innerText = data["games"][i]["P4"]["name"];
				}
				cur_row.appendChild(c4);
				
				var c5 = document.createElement("td");
				c5.id = game_id + "_P5";
				if (data["games"][i]["P5"] != null) {
					c5.innerText = data["games"][i]["P5"]["name"];
				}
				cur_row.appendChild(c5);
				
				var c6 = document.createElement("td");
				c6.id = game_id + "_P6";
				if (data["games"][i]["P6"] != null) {
					c6.innerText = data["games"][i]["P6"]["name"];
				}
				cur_row.appendChild(c6);

				var c7 = document.createElement("td");
				if (data["games"][i]["P1"]["email_id"] == user_email)
				{
					c7.innerHTML = "<button type=\"button\" class=\"btn btn-primary\" onclick=\"start_game(" + game_id + ")\">Start Game</button>";
				}
				else
				{
					c7.innerHTML = "<button type=\"button\" class=\"btn btn-primary\" onclick=\"join_game(" + game_id + ")\">Join Game</button>";
				}
				cur_row.appendChild(c7);
				game_list.appendChild(cur_row);
			}
		},
		error: function(data) {
			console.log(data);
		}
	});
	window.setInterval(function() { refresh_all_games() }, 10000);
}

function start_game(id) {
	$.ajax({
		url: document.location.origin + "/api/board",
		type: 'PUT',
		data: {
			game_id: id,
			email_id: user_email
		},
		headers: { "User_Email": user_email, "Auth_Token": auth_token},
		success: function(response) {
			document.cookie = "game_id=" + id.toString();
			document.location.href = document.location.origin + "/views/index";
		},
		error: function(error) {
			console.log(error);
			alert("Unable to start game. Please check make sure the number of users is 4 or 6")
		}
	});
}

function join_game(id) {
	$.ajax({
		url: document.location.origin + "/api/game",
		type: 'PUT',
		data: {
			game_id: id,
			email_id: user_email
		},
		success: function(response) {
			document.cookie = "game_id=" + id.toString();
			document.location.href = document.location.origin + "/views/index";
		}
	});
	alert("Unable to start game. Please check make sure the number of users is 4 or 6")
}

function create_game() {
	url = document.location.origin + "/api/game";
	$.ajax({
		url: document.location.origin + "/api/game",
		headers: { "User_Email": user_email, "Auth_Token": auth_token},
		type: "POST",
		data: {email_id: user_email},
		success: function(data) {
			alert("game added");
			refresh_all_games();
		},
		error: function(data) {
			console.log(data);
		}
	});
}

checkLogin();
get_all_games();

document.getElementById("newGame").onclick = function() { create_game() };