import importlib
import json

def get_games(req_obj):
	resp_obj = {}
	resp_obj["type"] = "application/json"
	body_obj = {}
	body_str = req_obj["body"].strip()
	if len(body_str) != 0:
		params = body_str.split("&")
		for param in params:
			body_obj[param.split("=")[0].strip()] = param.split("=")[1].strip()
	game_list = {}
	if len(body_obj) == 0:
		method = getattr(importlib.import_module("models.dbConnector"), "get_all_games")
		game_list = method()
		resp_obj["body"] = json.dumps(game_list)
	if body_obj.has_key("email_id"):
		method = getattr(importlib.import_module("models.dbConnector"), "get_player_games")
		game_list = method(body_obj["email_id"])
		resp_obj["body"] = json.dumps(game_list)
	return resp_obj

def start_game(req_obj):
	params = req_obj["body"].split("&")
	body = {}
	for param in params:
		body[param.split("=")[0].strip()] = param.split("=")[1].strip()
	body["game_id"] = int(body["game_id"])
	method = getattr(importlib.import_module("models.dbConnector"), "get_game")
	current_game = method(body["game_id"])
	player_count = 0
	for i in range(1,7):
		if current_game["P" + str(i)] == None:
			break
		else:
			player_count += 1
	if player_count == 4 or player_count == 6:
		if current_game["P1"] == body["email_id"]:
			method = getattr(importlib.import_module("models.dbConnector"), "start_game")
			current_game = method(body["game_id"])
		resp_obj = {}
		resp_obj["type"] = "application/json"
		resp_obj["body"] = json.dumps(current_game)
		return resp_obj
	else:
		return None

def join_game(req_obj):
	params = req_obj["body"].split("&")
	body = {}
	for param in params:
		body[param.split("=")[0].strip()] = param.split("=")[1].strip()
	method = getattr(importlib.import_module("models.dbConnector"), "add_player_to_game")
	current_game = method(body["email_id"], int(body["game_id"]))
	resp_obj = {}
	resp_obj["type"] = "application/json"
	resp_obj["body"] = json.dumps(current_game)
	return resp_obj

def get_board(req_obj):
	params = req_obj["body"].split("&")
	body = {}
	for param in params:
		body[param.split("=")[0].strip()] = param.split("=")[1].strip()
	method = getattr(importlib.import_module("models.dbConnector"), "get_board")
	current_board = method(int(body["game_id"]))

	method = getattr(importlib.import_module("models.dbConnector"), "get_player_hand")
	player_hand = method(int(body["game_id"]), body["email_id"])

	method = getattr(importlib.import_module("models.dbConnector"), "get_game")
	current_game = method(int(body["game_id"]))

	if player_hand == None:
		current_board["current_hand"] = ""
	else:
		current_board["current_hand"] = player_hand["current_hand"]

	current_board["current_player"] = current_game["current_player"]
	resp_obj = {}
	resp_obj["type"] = "application/json"
	resp_obj["body"] = json.dumps(current_board)
	return resp_obj

def create_game(req_obj):
	params = req_obj["body"].split("&")
	body = {}
	for param in params:
		body[param.split("=")[0].strip()] = param.split("=")[1].strip()
	method = getattr(importlib.import_module("models.dbConnector"), "create_game")
	current_game = method(body["email_id"])
	resp_obj = {}
	resp_obj["type"] = "application/json"
	resp_obj["body"] = json.dumps(current_game)
	return resp_obj

def play_move(req_obj):
	params = req_obj["body"].split("&")
	body = {}
	for param in params:
		body[param.split("=")[0].strip()] = param.split("=")[1].strip()
	body["game_id"] = int(body["game_id"])
	method = getattr(importlib.import_module("models.dbConnector"), "get_game")
	current_game = method(body["game_id"])
	current_player_index = 1
	player_count = 0
	for i in range(1,7):
		if current_game["P" + str(i)] == None:
			break
		else:
			player_count += 1
			if current_game["P" + str(i)] == body["email_id"]:
				current_player_index = i
	game_colour = "R"
	if player_count == 4:
		if current_player_index%2 == 0:
			game_colour = "G"
	elif player_count == 6:
		if current_player_index%3 == 2:
			game_colour = "G"
		elif current_player_index%3 == 0:
			game_colour = "B"

	method = getattr(importlib.import_module("models.dbConnector"), "get_board")
	current_game_board = method(body["game_id"])
	
	body["row"] = int(body["row"]);
	body["col"] = int(body["col"]);

	if int(body["remove"]) == 1:
		board = []
		rows = current_game_board["board_state"].split("\n")
		for row in rows:
			board.append(row.split("."))
		
		game_colour = "#"
		method = getattr(importlib.import_module("models.game"), "check_win")	
		existing_sequences = method(current_game_board["board_state"], game_colour)[1]
		try:
			if existing_sequences.index(body["row"]*10 + body["col"]):
				return None
		except:
			pass

	method = getattr(importlib.import_module("models.game"), "move_to_board")
	board_str = method(current_game_board["board_state"], body["row"], body["col"], game_colour)
	method = getattr(importlib.import_module("models.dbConnector"), "play_move")
	resp_obj = {}
	resp_obj["type"] = "application/json"
	resp_body = method(body["game_id"], body["email_id"], board_str)
	if int(body["remove"]) == 1:
		resp_body["winner"] = False
	else:
		method = getattr(importlib.import_module("models.game"), "check_win")
		resp_body["winner"] = method(board_str, game_colour)[0]

	method = getattr(importlib.import_module("models.dbConnector"), "player_pick_card")
	player_hand = method(resp_body["game_id"], body["email_id"], body["current_card"].strip())

	resp_obj["body"] = {}
	resp_obj["body"]["winner"] = resp_body["winner"]
	resp_obj["body"]["board_state"] = board_str
	resp_obj["body"]["current_hand"] = player_hand["current_hand"]

	resp_body = json.dumps(resp_obj["body"])
	resp_obj["body"] = resp_body
	return resp_obj

def replace_card(req_obj):
	resp_obj = {}
	resp_obj["type"] = "application/json";
	params = req_obj["body"].split("&")
	body = {}
	for param in params:
		body[param.split("=")[0].strip()] = param.split("=")[1].strip()
	body["game_id"] = int(body["game_id"])

	method = getattr(importlib.import_module("models.dbConnector"), "player_pick_card")
	player_hand = method(body["game_id"], body["email_id"], body["current_card"].strip())

	resp_obj["body"] = json.dumps(player_hand)
	return resp_obj