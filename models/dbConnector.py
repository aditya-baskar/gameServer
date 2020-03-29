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

def check_and_add_user(first_name, last_name, email_id):
	records = execute_read_command("Select * from Users where email_id='" + email_id + "';")
	print first_name + last_name + email_id
	if len(records) == 0:
		execute_write_command("Insert into Users Values ('" + email_id + "', '" + first_name + "', '" + last_name + "', -1);")
		records = execute_read_command("Select * from Users where email_id='" + email_id + "';")
	return records[0]
