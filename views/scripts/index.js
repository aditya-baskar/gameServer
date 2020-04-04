var current_user = ""

function checkLogin() {
	if (document.cookie.length > 0) {
		var cookies = document.cookie.split(";");
		var iter;
		for (iter = 0; iter < cookies.length; iter++) {
			if (cookies[iter].split("=")[0].trim() == "email_id") {
				current_user = cookies[iter].split("=")[1];
			}
		}
		if (current_user == "") {
			document.location.href = document.location.origin + "/views/login";
		}
	}
}

function createBoard() {
	var table = document.getElementById("sequence_board");
	var sequence_board = "U.2S.3S.4S.5S.10D.QD.KD.AD.U\n6C.5C.4C.3C.2C.4S.5S.6S.7S.AC\n7C.AS.2D.3D.4D.KC.QC.10C.8S.KC\n8C.KS.6C.5C.4C.9H.8H.9C.9C.QC\n9C.QS.7C.6H.5H.2C.7H.8C.10S.10C\nAS.7H.9D.AH.4H.3H.KH.10D.6H.2D\nKS.8H.8D.2C.3C.10H.QH.QD.5H.3D\nQS.9H.7D.6D.5D.AC.AD.KD.4H.4D\n10S.10H.QH.KH.AH.3S.2S.2H.3H.5D\nU.9S.8S.7S.6S.9D.8D.7D.6D.U";
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
			var img = document.createElement("img");
			if (id_name != "U") {
				img.id = id_name;
			}
			img.setAttribute("class", "board_card");
			img.src = "images/" + row[j] + ".png";
			img.onclick = playmove;
			cell.appendChild(img);
			cur_row.appendChild(cell);
		}
		table.appendChild(cur_row);
	}
}

function playmove() {
	console.log(this);
}

checkLogin();
createBoard();