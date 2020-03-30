def get(req_obj):
	resp_obj = {}
	resp_obj["type"] = "text/html"
	resp_obj["body"] = "<html><body><h1>Hello World!</h1></body></html>"
	return resp_obj

def post(req_obj):
	return "done"