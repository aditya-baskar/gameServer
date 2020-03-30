def record_to_user(db_record):
	user_obj = {
		"email_id": db_record[0],
		"first_name": db_record[1],
		"last_name": db_record[2],
		"current_game": db_record[3]
	}
	return user_obj