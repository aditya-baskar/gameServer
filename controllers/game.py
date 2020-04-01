import importlib
import json

def get_games(req_obj):
	resp_obj = {}
	resp_obj["type"] = "application/json"
	body_str = req_obj["body"]
	params = body_str.split("&")
	body_obj = {}
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
	body["game_id"] = int(body[game_id])
	method = getattr(importlib.import_module("models.dbConnector"), "get_game")
	curent_game = method(body[game_id])
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
	current_game = method(int(body["game_id"]))
	resp_obj["type"] = "application/json"
	resp_obj["body"] = json.dumps(current_game)
	return resp_obj

def create_game(req_obj):
	params = req_obj["body"].split("&")
	body = {}
	for param in params:
		body[param.split("=")[0].strip()] = param.split("=")[1].strip()
	method = getattr(importlib.import_module("models.dbConnector"), "create_game")
	current_game = method(body["email_id"])
	resp_obj["type"] = "application/json"
	resp_obj["body"] = json.dumps(current_game)
	return resp_obj

def play_move(req_obj):
	params = req_obj["body"].split("&")
	body = {}
	for param in params:
		body[param.split("=")[0].strip()] = param.split("=")[1].strip()
	body["game_id"] = int(body[game_id])
	method = getattr(importlib.import_module("models.dbConnector"), "get_game")
	curent_game = method(body[game_id])
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
		if player_count%2 == 0:
			game_colour = "G"
	elif player_count == 6:
		if player_count%3 == 2:
			game_colour = "G"
		elif player_count%3 == 0:
			game_colour = "B"

	method = getattr(importlib.import_module("models.dbConnector"), "get_board")
	current_game_board = method(body[game_id])
	
	if int(body["remove"]) == 1:
		board = []
		rows = current_game_board["board_state"].split("\n")
		for row in rows:
			board.append(row.split("."))
		
		game_colour = "#"
		method = getattr(importlib.import_module("models.game"), "check_win")	
		existing_sequences = method(current_game_board["board_state"], board[int(body["row"])][int(body["col"])])[1]
		try:
			if existing_sequences.index(int(body["row"])*10 + int(body["col"])):
				return None
		except:
			pass

	method = getattr(importlib.import_module("models.game"), "move_to_board")
	board_str = method(current_game_board["board_state"], int(body["row"]), int(body["col"]), game_colour)
	method = getattr(importlib.import_module("models.dbConnector"), "play_move")
	resp_obj = {}
	resp_obj["type"] = "application/json"
	body = method(body["game_id"], body["email_id"], board_str)
	if int(body["remove"]) == 1:
		body["winner"] = False
	else:
		method = getattr(importlib.import_module("models.game"), "check_win")	
		boay["winner"] = method(current_game_board["board_state"], board[int(body["row"])][int(body["col"])])[0]
	return resp_obj