def record_to_game(db_record):
	game_obj = {
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
		games.append(record_to_game(record))
	ret_obj = {}
	ret_obj["games"] = games
	return ret_obj

def record_to_board(db_record):
	board_obj = {
		"game_id": db_record[0],
		"board_state": db_record[1]
	}
	return board_obj

def move_to_board(board_str, row, col, colour):
	board = []
	rows = board_str.split("\n")
	for row in rows:
		board.append(row.split("."))
	board[row][col] = colour
	check_win(board, row, col)
	board_str = ""
	for row in board:
		for col in row:
			board_str += col
		board_str += '\n'
	board_str.strip()
	return board_str

def check_win(board_str, colour):
	win = False
	board = []
	rows = board_str.split("\n")
	for row in rows:
		board.append(row.split("."))
	sequence_index = []
	#checking rows
	for i in range(0,10):
		current_sequence = []
		sequence_count = 0
		for j in range(0,10):
			if board[i][j] == "A" or board[i][j] == colour:
				sequence_count += 1
				current_sequence.append(i*10 + j)
			else:
				if sequence_count >= 9:
					win = True
					sequence_index.append(current_sequence)
				else:
					if sequence_count >= 5:
						sequence_index.append(current_sequence)
					sequence_count = 0
					current_sequence = []
		if board[i][9] == "A" or board[i][9] == colour:
			if sequence_count >= 9:
				win = True
				sequence_index.append(current_sequence)
			else:
				if sequence_count >= 5:
					sequence_index.append(current_sequence)
	if win:
		return (True, sequence_index)
	#checking colums
	for j in range(0,10):
		current_sequence = []
		sequence_count = 0
		
		for i in range(0,10):
			if board[i][j] == "A" or board[i][j] == colour:
				sequence_count += 1
				current_sequence.append(i*10 + j)
			else:
				if sequence_count >= 9:
					win = True
					sequence_index.append(current_sequence)
				else:
					if sequence_count >= 5:
						sequence_index.append(current_sequence)
					sequence_count = 0
					current_sequence = []
		if board[9][j] == "A" or board[9][j] == colour:
			if sequence_count >= 9:
				win = True
				sequence_index.append(current_sequence)
			else:
				if sequence_count >= 5:
					sequence_index.append(current_sequence)
	if win or len(sequence_index) >= 2:
		return (True, sequence_index)
	#checking first set of diagonals
	starting_points = [(0,5), (0,4), (0,3), (0,2), (0,1), (0,0), (1,0), (2,0), (3,0), (4,0), (5,0)]
	
	for start in starting_points:
		i = start[0]
		j = start[1]
		current_sequence = []
		sequence_count = 0
		while i < 10 and j < 10:
			if board[i][j] == "A" or board[i][j] == colour:
				sequence_count += 1
				current_sequence.append(i*10 + j)
			else:
				if sequence_count >= 9:
					win = True
					sequence_index.append(current_sequence)
				else:
					if sequence_count >= 5:
						sequence_index.append(current_sequence)
					sequence_count = 0
					current_sequence = []
			if i == 9 or j == 9:
				if sequence_count >= 9:
					win = True
					sequence_index.append(current_sequence)
				else:
					if sequence_count >= 5:
						sequence_index.append(current_sequence)
			i += 1
			j += 1
	if win or len(sequence_index) >= 2:
		return (True, sequence_index)

	#checking first set of diagonals
	starting_points = [(0,4), (0,5), (0,6), (0,7), (0,8), (0,9), (1,9), (2,9), (3,9), (4,9), (5,9)]
	for start in starting_points:
		i = start[0]
		j = start[1]
		current_sequence = []
		sequence_count = 0
		while i < 10 and j > 0:
			if board[i][j] == "A" or board[i][j] == colour:
				sequence_count += 1
				current_sequence.append(i*10 + j)
			else:
				if sequence_count >= 9:
					win = True
					sequence_index.append(current_sequence)
				else:
					if sequence_count >= 5:
						sequence_index.append(current_sequence)
					sequence_count = 0
					current_sequence = []
			if i == 9 or j == 0:
				if sequence_count >= 9:
					win = True
					sequence_index.append(current_sequence)
				else:
					if sequence_count >= 5:
						sequence_index.append(current_sequence)
			i += 1
			j += -1
	if win or len(sequence_index) >= 2:
		return (True, sequence_index)
	
	return (False, sequence_index)

# game list object json
#{
#	"games" : [
#		{
#			"game_id": 1,
#			"P1": "test@test.com",
#			"P2": "test1@test.com",
#			"P3": "test2@test.com",
#			"P4": "test3@test.com",
#			"P5": "test4@test.com",
#			"P6": "test5@test.com",
#			"current_player": "test@test.com",
#			"started": true
#		}
#	]
#}