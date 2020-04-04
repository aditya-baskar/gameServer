def get(req_obj):
	resp_obj = {}
	f = open("views/game_list.html", "r")
	resp_obj["body"] = f.read()
	resp_obj["type"] = "text/html"
	f.close()
	return resp_obj