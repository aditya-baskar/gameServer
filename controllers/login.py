import importlib
import json

def get(req_obj):
	resp_obj = {}
	f = open("views/login.html", "r")
	resp_obj["body"] = f.read()
	resp_obj["type"] = "text/html"
	f.close()
	return resp_obj

def post(req_obj):
	resp_obj = {}
	body = {}
	params = req_obj["body"].split("&")
	for param in params:
		body[param.split("=")[0]] = param.split("=")[1]
	method = getattr(importlib.import_module("models.dbConnector"), "check_and_add_user")
	body_obj = method(body["first_name"], body["last_name"], body["email_id"], body["auth_token"], body["img_url"])
	resp_obj["type"] = "application/json"
	resp_obj["body"] = str(json.dumps(body_obj))
	return resp_obj