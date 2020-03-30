import mysql.connector
import importlib

def execute_write_command(command_to_execute):
	connection = mysql.connector.connect(host='localhost', database='gaming_platform', user='root', password='abcdefgh')
	if connection.is_connected():
		cursor = connection.cursor()
		cursor.execute(command_to_execute);
		cursor.close()
		connection.commit()
	connection.close()

def execute_read_command(command_to_execute):
	connection = mysql.connector.connect(host='localhost', database='gaming_platform', user='root', password='abcdefgh')
	record = None
	if connection.is_connected():
		cursor = connection.cursor()
		cursor.execute(command_to_execute);
		record = cursor.fetchall()
		cursor.close()
		connection.commit()
	connection.close()
	return record

def check_and_add_user(first_name, last_name, email_id):
	records = execute_read_command("Select * from Users where email_id='" + email_id + "';")

	if len(records) == 0:
		execute_write_command("Insert into Users Values ('" + email_id + "', '" + first_name + "', '" + last_name + "', -1);")
		records = execute_read_command("Select * from Users where email_id='" + email_id + "';")

	method = getattr(importlib.import_module("models.user"), "record_to_user")
	return method(records[0])

def get_user(email_id):
	record = execute_read_command("Select * from Users where email_id='" + email_id + "';")[0]
	method = getattr(importlib.import_module("models.user"), "record_to_user")
	return method(record)	

def create_game(player_1):
	execute_write_command("Insert into ActiveGames (P1) Values ('" + player_1 + "');")
	new_game = execute_read_command("Select top 1 * from ActiveGames where P1 = '" + player_1 + "' order by game_id desc;")[0]
	return new_game

def get_all_games():
	all_games = execute_read_command("Select * from ActiveGames;")
	return all_games

def get_player_games(player_email):
	player_games = execute_read_command("Select * from ActiveGames where P1 = '" + player_email + "' or P2 = '" + player_email + "' or P3 = '" + player_email + "' or P4 = '" + player_email + "' or P5 = '" + player_email + "' or P6 = '" + player_email + "';")
	return player_games

def remove_player_from_game(game_id, player_email):
	current_game = execute_read_command("Select * from ActiveGames where game_id = " + str(game_id) + ";")[0]
	for i in (1,7):
		if current_game[i] == player_email:
			execute_write_command("Update table ActiveGames Set P" + str(i) + " = NULL where game_id = " + str(game_id) + ";")
			break

def add_player_to_game(player_email, game_id):
	execute_write_command("Update table Users set current_game = " + str(game_id) + " where email_id = '" + player_email + "';")
	current_game = execute_read_command("Select * from ActiveGames where game_id = " + str(game_id) + ";")[0]
	if current_game[8]:
		return None
	available_index = 8
	player_found = False
	for i in (1,7):
		if current_game[i] == None and i < available_index:
			available_index = i
		elif current_game[i] == player_email:
			player_found = True
			break
	if player_found == False:
		execute_write_command("Update table ActiveGames set P" + str(available_index) + " = '" + player_email + "';")
		current_game = execute_read_command("Select * from ActiveGames where game_id = " + str(game_id) + ";")[0]
	method = getattr(importlib.import_module("models.game"), "record_to_game")
	return method(current_game)

def start_game(game_id):
	current_game = execute_read_command("Select * from ActiveGames where game_id = " + str(game_id) + ";")[0]
	execute_write_command("Update table ActiveGames set started = True, current_player = '" + current_game[1] + "' where game_id = " + str(game_id) + ";")
	game_board = execute_read_command("Select * from CurrentBoard where game_id = " + str(game_id) + ";")
	if len(game_board) == 0:
		# '#' indicated unplayed spot
		starting_board = "A.#.#.#.#.#.#.#.#.A\n#.#.#.#.#.#.#.#.#.#\n#.#.#.#.#.#.#.#.#.#\n#.#.#.#.#.#.#.#.#.#\n#.#.#.#.#.#.#.#.#.#\n#.#.#.#.#.#.#.#.#.#\n#.#.#.#.#.#.#.#.#.#\n#.#.#.#.#.#.#.#.#.#\n#.#.#.#.#.#.#.#.#.#\nA.#.#.#.#.#.#.#.#.A"
		execute_write_command("Insert into CurrentBoard (game_id, board_state) Values (" + str(game_id) + ", '" + starting_board + "');")
		game_board = execute_read_command("Select * from CurrentBoard where game_id = " + str(game_id) + ";")
	method = getattr(importlib.import_module("models.game"), "record_to_board")
	return method(game_board)

