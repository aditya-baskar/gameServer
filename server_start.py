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
		header["url"] = urllib2.unquote(header["url"])
		self.parsed = {"header": header, "body": urllib2.unquote(body.strip())}

	def validate_reqest(self):
		global routes
		header = self.parsed["header"]
		for route in routes:
			if route["url"].lower() == header["url"].lower() and header["method"].lower() == route["method"].lower():
				return True
		return False

	def check_auth(self):
		return True
		header = self.parsed["header"]
		if self.parsed["header"]["url"].lower().find("api") == -1 or self.parsed["header"]["url"].find(".") != -1:
			return True
		else:
			method = getattr(importlib.import_module("models.user"), "validate_user")
			return method(header["User_Email"], header["Auth_Token"])

	def execute_request(self):
		global routes
		req_header = self.parsed["header"]
		func_name = req_header["method"]
		module = ""
		for obj in routes:
			if obj["url"] == req_header["url"] and req_header["method"].lower() == obj["method"].lower():
				if (obj.has_key("handler")):
					func_name = obj["handler"]
				module = obj["controller"]
		try:
			method = getattr(importlib.import_module(module), func_name)
		except:
			print "error when loading function"
			return None
		return method(self.parsed)

	def handle(self):
		self.data = self.request.recv(8196).strip()
		self.parse_request()
		ret_val = None
		if self.check_auth() == False:
			self.request.sendall(self.create_response(None, "401 Unauthorized"));
		elif self.validate_reqest():
			if self.parsed["header"]["url"] == "/":
				resp_str = self.parsed["header"]["version"] + " 302 Found\nLocation:http://" + self.parsed["header"]["Host"] + "/views/login\n"
				self.request.sendall(resp_str)
			else:
				ret_val = self.execute_request()
				if ret_val == None:
					print "Failed"
				self.request.sendall(self.create_response(ret_val))
		else:
			url = self.parsed["header"]["url"]
			resp_obj = {}
			if url.lower().endswith("js"):
				resp_obj["type"] = "text/javascript; charset=UTF-8"
			elif url.lower().endswith("png"):
				resp_obj["type"] = "image/png"
			elif url.lower().endswith("jpg"):
				resp_obj["type"] = "image/jpg"
			elif url.lower().endswith("jpeg"):
				resp_obj["type"] = "image/jpeg"
			elif url.lower().endswith("ico"):
				resp_obj["type"] = "image/png"
			elif url.lower().endswith("css"):
				resp_obj["type"] = "text/css"
			else:
				resp_obj["type"] = "text/html; charset=UTF-8"
			try:
				open_method = "r"
				if url.lower().endswith("jpg") or url.lower().endswith("jpeg") or url.lower().endswith("png"):
					open_method += "b"
				f = open(url.split("/", 1)[1], open_method)
				resp_obj["body"] = f.read()
			except:
				print "Unable to find file " + self.parsed["header"]["url"]
			self.request.sendall(self.create_response(resp_obj))

	def create_response(self,data,status="200 OK"):
		resp_string = ""
		if data == None:
			if status == "200 OK":
				status = "500 Internal Server Error"
			resp_string = self.parsed["header"]["version"] + " " + status + \
			"Content-Type: application/json\n\n{}" 
		else:
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