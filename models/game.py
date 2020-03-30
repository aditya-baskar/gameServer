def record_to_game(db_record):
	game_obj {
		"game_id": db_record[0],
		"P1": db_record[1],
		"P2": db_record[2],
		"P3": db_record[3],
		"P4": db_record[4],
		"P5": db_record[5],
		"P6": db_record[6],
		"current_player": db_record[7],
		"started": db_record[8]
	}
	return game_obj

def recordlist_to_game(record_list):
	games = []
	for record in record_list:
		games.push(record_to_game(record))
	ret_obj = {}
	ret_obj["games"] = games
	return ret_obj

def record_to_board(db_record):
	board_obj {
		"game_id": db_record[0],
		"board_state": db_record[1]
	}
	return board_obj

