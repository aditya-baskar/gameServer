import SocketServer
import json
import sys
import threading
import urllib2

def load_routes():
	global routes
	with open("routes.config") as json_data:
		routes = json.load(json_data)

class ThreadedTCPServer(SocketServer.ThreadingMixIn, SocketServer.TCPServer):
    pass

class MyTCPHandler(SocketServer.BaseRequestHandler):
	def parse_request(self):
		print self.data
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
					header["type"] = parts[0]
					if parts[0].lower() == "get" and parts[1].find("?") >= 0:
						header["url"] = parts[1].split("?", 1)[0]
						body = parts[1].split("?")[1]
					else:
						header["url"] = parts[1]

				elif line.find(":") >= 0:
					pair = line.split(":", 1)
					header[pair[0].strip()] = pair[1].strip()

			elif header["type"].lower() != "get":
				body += line + "\n"
		print header
		print body
		self.parsed = {"header": header, "body": body.strip()}

	def validate_reqest(self):
		global routes
		header = self.parsed["header"]
		for route in routes:
			if route["url"] == header["url"] and header["type"] == route["method"]:
				return True
		return False

	def execute_request(self):
		global routes
		try:
			user_handlers = __import__(user_file)
		except:
			print "error with provided file"
			return None
		req_header = self.parsed["header"]
		for obj in routes:
			if obj["url"] == req_header["url"]:
				func_name = obj["handler"];
		try:
			method = getattr(user_handlers, func_name)
		except:
			print "error when loading function"
			return None
		return method(self.parsed)

	def handle(self):
		self.data = self.request.recv(1024).strip()
		self.parse_request()
		ret_val = None
		if self.validate_reqest():
			print "here"
			ret_val = self.execute_request()
		self.request.sendall(str(ret_val))

if __name__ == "__main__":
	load_routes()
	HOST, PORT = "localhost", 9998
	try:
		global user_file
		if sys.argv[1].find(".") >= 0:
			user_file = sys.argv[1].split(".")[0]
		else:
			user_file = sys.argv[1]
		print user_file
	except:
		print "no user file given"
		sys.exit()
	with open("server.config") as json_data:
		data = json.load(json_data)
		HOST = str(data["host"])
		PORT = data["port"]
	server = ThreadedTCPServer((HOST, PORT), MyTCPHandler)
	server_thread = threading.Thread(target=server.serve_forever)
	server_thread.daemon = True
	server_thread.start()

	while raw_input("type exit to stop server: ") != "exit":
		print "server running"

	server.shutdown()
	server.server_close()