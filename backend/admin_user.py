import sqlite3
import bcrypt

conn = sqlite3.connect("database.db")
cursor = conn.cursor()

username = "admin"
email = "admin@example.com"
password = "!QAZxsw2"
role = "admin"

hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

try:
    cursor.execute(
        """INSERT INTO users (email, username, password, role) VALUES (?, ?, ?, ?)""",
        (email, username, hashed_password.decode("utf-8"), role)
    )
    conn.commit()
    print("Admin user created successfully!")
except sqlite3.IntergrityError:
    print("Admin user already exists.")

conn.close()
