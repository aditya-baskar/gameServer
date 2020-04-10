import importlib

def record_to_user(db_record):
	user_obj = {
		"email_id": db_record[0],
		"first_name": db_record[1],
		"last_name": db_record[2],
		"current_game": db_record[3],
		"auth_token": db_record[4]
	}
	return user_obj

def validate_user(email_id, auth_token):
	method = getattr(importlib.import_module("models.dbConnector"), "get_user")
	cur_user = method(email_id)
	return cur_user["auth_token"] == auth_token
