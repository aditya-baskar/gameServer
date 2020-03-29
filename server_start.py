import SocketServer
import json
import sys
import threading
import urllib2
import importlib
from requests.models import Response

def load_routes():
	global routes
	with open("routes.config") as json_data:
		routes = json.load(json_data)

class MyTCPHandler(SocketServer.BaseRequestHandler):
	def parse_request(self):
		lines = self.data.split("\n")
		header = {}
		body = ""
		body_flag = False
		print self.data
		for line in lines:
			if (len(line.strip()) == 0):
				body_flag = True
				continue
			if body_flag == False:
				if line.split(" ")[0].lower() == "get" or line.split(" ")[0].lower() == "post" \
				or line.split(" ")[0].lower() == "put":
					parts = map(str.strip, line.split(" "))
					header["version"] = parts[2]
					header["method"] = parts[0]
					if parts[0].lower() == "get" and parts[1].find("?") >= 0:
						header["url"] = parts[1].split("?", 1)[0]
						body = parts[1].split("?")[1]
					else:
						header["url"] = parts[1]

				elif line.find(":") >= 0:
					pair = line.split(":", 1)
					header[pair[0].strip()] = pair[1].strip()

			elif header["method"].lower() != "get":
				body += line + "\n"
		print header["url"]
		header["url"] = urllib2.unquote(header["url"])
		self.parsed = {"header": header, "body": urllib2.unquote(body.strip())}

	def validate_reqest(self):
		global routes
		header = self.parsed["header"]
		for route in routes:
			if route["url"].lower() == header["url"].lower() and header["method"].lower() == route["method"].lower():
				return True
		return False

	def execute_request(self):
		global routes
		req_header = self.parsed["header"]
		func_name = req_header["method"]
		module = ""
		for obj in routes:
			if obj["url"] == req_header["url"] and req_header["method"].lower() == obj["method"].lower():
				if (obj.has_key("handler")):
					func_name = obj["handler"]
				module = obj["url"].split("/", 1)[1].replace("/", ".")
		try:
			method = getattr(importlib.import_module(module), func_name)
		except:
			print "error when loading function"
			return None
		return method(self.parsed)

	def handle(self):
		self.data = self.request.recv(1024).strip()
		self.parse_request()
		ret_val = None
		if self.validate_reqest():
			ret_val = self.execute_request()
			resp_obj = self.create_response(ret_val)
		else:
			try:
				open_method = "r"
				url = self.parsed["header"]["url"]
				if url.lower().endswith("jpg") or url.lower().endswith("jpeg") or url.lower().endswith("png"):
					open_method += "b"
				f = open(url.split("/", 1)[1], open_method)
				resp_obj = f.read()
			except:
				print "Unable to find file " + self.parsed["header"]["url"]
		print resp_obj
		self.request.sendall(resp_obj)

	def create_response(self,data):
		resp_string = self.parsed["header"]["version"] + " 200 OK\n" + \
		"Content-Type: " + data["type"] + "\n\n" + data["body"] 
		return resp_string

if __name__ == "__main__":
	load_routes()
	
	with open("server.config") as json_data:
		data = json.load(json_data)
		HOST = str(data["host"])
		PORT = data["port"]

	server = SocketServer.TCPServer((HOST, PORT), MyTCPHandler)
	server.serve_forever()