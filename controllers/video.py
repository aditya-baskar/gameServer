import importlib
import json

def join_room(req_obj):
	params = req_obj["body"].split("&")
	body = {}
	for param in params:
		body[param.split("=")[0].strip()] = param.split("=")[1].strip()
	method = getattr(importlib.import_module("models.dbConnector"), "add_user_to_room")
	adding_state = method(body["room_name"], body["username"]);
	method = getattr(importlib.import_module("models.dbConnector"), "get_chat_room")
	current_room = method(body["room_name"])

	resp_obj = {}
	resp_obj["type"] = "application/json"
	resp_obj["body"] = str(json.dumps(current_room))
	return resp_obj

def get_room(req_obj):
	params = req_obj["body"].split("&")
	body = {}
	for param in params:
		body[param.split("=")[0].strip()] = param.split("=")[1].strip()
	method = getattr(importlib.import_module("models.dbConnector"), "get_chat_room")
	current_room = method(body["room_name"])

	resp_obj = {}
	resp_obj["type"] = "application/json"
	resp_obj["body"] = str(json.dumps(current_room))
	return resp_obj
