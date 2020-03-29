import importlib
import json

def get(req_obj):
	resp_obj = {}
	f = open("views/login.html", "r")
	resp_obj["body"] = f.read()
	resp_obj["type"] = "text/html"
	f.close()
	print resp_obj
	return resp_obj

def post(req_obj):
	resp_obj = {}
	body = {}
	params = req_obj["body"].split("&")
	for param in params:
		body[param.split("=")[0]] = param.split("=")[1]
	method = getattr(importlib.import_module("models.dbConnector"), "check_and_add_user")
	cur_user = method(body["first_name"], body["last_name"], body["email_id"])
	resp_obj["type"] = "application/json"
	body_obj = {
		"email_id": cur_user[0],
		"first_name": cur_user[1],
		"last_name": cur_user[2],
		"current_game": cur_user[3]
	}
	resp_obj["body"] = str(json.dumps(body_obj))
	return resp_obj