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
		}
		if (user_email	 == "") {
			document.location.href = document.location.origin + "/views/login";
		}
	}
}

function refresh_all_games() {
	url = document.location.origin + "/api/game";
	$.get(url, function(data, status){
		var game_list = document.getElementById("availableGames");
		for (i = 0; i < data["games"].length; i++) {
			if (document.getElementById(data["games"][i]["game_id"].toString()) == null) {
				var cur_row = document.createElement("tr");
				game_id = data["games"][i]["game_id"].toString()
				cur_row.id = game_id;
				var c1 = document.createElement("td");
				c1.id = game_id + "_P1";
				c1.innerText = data["games"][i]["P1"];
				cur_row.appendChild(c1);

				var c2 = document.createElement("td");
				c2.id = game_id + "_P2";
				c2.innerText = data["games"][i]["P2"];
				cur_row.appendChild(c2);
				
				var c3 = document.createElement("td");
				c3.id = game_id + "_P3";
				c3.innerText = data["games"][i]["P3"];
				cur_row.appendChild(c3);
				
				var c4 = document.createElement("td");
				c4.id = game_id + "_P4";
				c4.innerText = data["games"][i]["P4"];
				cur_row.appendChild(c4);
				
				var c5 = document.createElement("td");
				c5.id = game_id + "_P5";
				c5.innerText = data["games"][i]["P5"];
				cur_row.appendChild(c5);
				
				var c6 = document.createElement("td");
				c6.id = game_id + "_P6";
				c6.innerText = data["games"][i]["P6"];
				cur_row.appendChild(c6);

				var c7 = document.createElement("td");
				if (data["games"][i]["P1"] == user_email)
				{
					c7.innerHTML = "<button onclick=\"start_game(" + game_id + ")\">Start Game</button>";
				}
				else
				{
					c7.innerHTML = "<button onclick=\"join_game(" + game_id + ")\">Join Game</button>";
				}
				cur_row.appendChild(c7);
				game_list.appendChild(cur_row);
			}
			else {
				id = data["games"][i]["game_id"].toString();
				document.getElementById(id + "_P1").innerText = data["games"][i]["P1"];
				document.getElementById(id + "_P2").innerText = data["games"][i]["P2"];
				document.getElementById(id + "_P3").innerText = data["games"][i]["P3"];
				document.getElementById(id + "_P4").innerText = data["games"][i]["P4"];
				document.getElementById(id + "_P5").innerText = data["games"][i]["P5"];
				document.getElementById(id + "_P6").innerText = data["games"][i]["P6"];
			}
		}
	});
}

function get_all_games() {
	url = document.location.origin + "/api/game";
	$.get(url, function(data, status){
		var game_list = document.getElementById("availableGames");
		var i;
		for (i = 0; i < data["games"].length; i++) {
			var cur_row = document.createElement("tr");
			game_id = data["games"][i]["game_id"].toString()
			cur_row.id = game_id;
			var c1 = document.createElement("td");
			c1.id = game_id + "_P1";
			c1.innerText = data["games"][i]["P1"];
			cur_row.appendChild(c1);

			var c2 = document.createElement("td");
			c2.id = game_id + "_P2";
			c2.innerText = data["games"][i]["P2"];
			cur_row.appendChild(c2);
			
			var c3 = document.createElement("td");
			c3.id = game_id + "_P3";
			c3.innerText = data["games"][i]["P3"];
			cur_row.appendChild(c3);
			
			var c4 = document.createElement("td");
			c4.id = game_id + "_P4";
			c4.innerText = data["games"][i]["P4"];
			cur_row.appendChild(c4);
			
			var c5 = document.createElement("td");
			c5.id = game_id + "_P5";
			c5.innerText = data["games"][i]["P5"];
			cur_row.appendChild(c5);
			
			var c6 = document.createElement("td");
			c6.id = game_id + "_P6";
			c6.innerText = data["games"][i]["P6"];
			cur_row.appendChild(c6);

			var c7 = document.createElement("td");
			if (data["games"][i]["P1"] == user_email)
			{
				c7.innerHTML = "<button onclick=\"start_game(" + game_id + ")\">Start Game</button>";
			}
			else
			{
				c7.innerHTML = "<button onclick=\"join_game(" + game_id + ")\">Join Game</button>";
			}
			cur_row.appendChild(c7);
			game_list.appendChild(cur_row);
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
		success: function(response) {
			document.cookie = "game_id=" + id.toString();
			document.location.href = document.location.origin + "/views/index";
		}
	});
	alert("Unable to start game. Please check make sure the number of users is 4 or 6")
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
	$.post(url, {email_id: user_email}, function() {
		alert("game added");
		refresh_all_games();
	})
}

checkLogin();
get_all_games();

document.getElementById("newGame").onclick = function() { create_game() };