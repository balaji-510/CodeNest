import MySQLdb

def create_db(password):
    try:
        db = MySQLdb.connect(host="localhost", user="root", passwd=password)
        cursor = db.cursor()
        cursor.execute("CREATE DATABASE IF NOT EXISTS codenest_db")
        print(f"Database `codenest_db` created/verified successfully.")
        db.close()
        return True
    except Exception as e:
        print(f"Failed to create database: {e}")
        return False

# Use the password provided by the user in settings.py
create_db("Yash@259")
