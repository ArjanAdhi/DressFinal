# fix_database.py - Run this to fix the database schema
import sqlite3


def fix_database():
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    try:
        # Check if username column exists
        cursor.execute("PRAGMA table_info(clothes)")
        columns = [column[1] for column in cursor.fetchall()]

        if 'username' not in columns:
            print("Adding username column to clothes table...")
            cursor.execute("ALTER TABLE clothes ADD COLUMN username TEXT")
            print("Username column added successfully!")
        else:
            print("Username column already exists.")

        # Check current table structure
        print("\nCurrent clothes table structure:")
        cursor.execute("PRAGMA table_info(clothes)")
        for column in cursor.fetchall():
            print(f"  {column[1]} ({column[2]})")

        conn.commit()
        print("\nDatabase schema updated successfully!")

    except Exception as e:
        print(f"Error updating database: {e}")
    finally:
        conn.close()


if __name__ == "__main__":
    fix_database()