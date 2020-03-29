import mysql.connector

def execute_write_command(command_to_execute):
	connection = mysql.connector.connect(host='localhost', database='gaming_platform', user='root', password='abcdefgh')
	if connection.is_connected():
		cursor = connection.cursor()
		cursor.execute(command_to_execute);
		cursor.close()
		connection.commit()
	connection.close()

def execute_read_command(command_to_execute):
	connection = mysql.connector.connect(host='localhost', database='gaming_platform', user='root', password='abcdefgh')
	record = None
	if connection.is_connected():
		cursor = connection.cursor()
		cursor.execute(command_to_execute);
		record = cursor.fetchall()
		cursor.close()
		connection.commit()
	connection.close()
	return record