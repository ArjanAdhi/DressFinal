# populate_database.py - Simple version for deployment
import sqlite3
import bcrypt
import os

def init_database():
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create clothes table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS clothes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            body_part TEXT NOT NULL,
            image_path TEXT NOT NULL,
            username TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create outfits table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS outfits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            top_name TEXT,
            bottom_name TEXT,
            shoes_name TEXT,
            saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create posts table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            body TEXT,
            author TEXT,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create admin user if doesn't exist
    try:
        admin_password = "!QAZxsw2"
        hashed_password = bcrypt.hashpw(admin_password.encode("utf-8"), bcrypt.gensalt())
        
        cursor.execute("""
            INSERT OR IGNORE INTO users (email, username, password, role, active) 
            VALUES (?, ?, ?, ?, ?)
        """, ("admin@dressez.com", "admin", hashed_password.decode("utf-8"), "admin", True))
        
        print("Admin user created/verified: username=admin, password=!QAZxsw2")
    except Exception as e:
        print(f"Error creating admin user: {e}")
    
    # Add sample clothing items if table is empty
    cursor.execute("SELECT COUNT(*) FROM clothes")
    count = cursor.fetchone()[0]
    
    if count == 0:
        sample_clothes = [
            ("Blue Denim Shirt", "shirt", "top", "/clothes/tops/blue-shirt.jpg"),
            ("White T-Shirt", "shirt", "top", "/clothes/tops/white-tshirt.jpg"),
            ("Black Sweater", "sweater", "top", "/clothes/tops/black-sweater.jpg"),
            ("Blue Jeans", "pants", "bottom", "/clothes/bottoms/blue-jeans.jpg"),
            ("Black Pants", "pants", "bottom", "/clothes/bottoms/black-pants.jpg"),
            ("Khaki Shorts", "shorts", "bottom", "/clothes/bottoms/khaki-shorts.jpg"),
            ("White Sneakers", "sneakers", "shoes", "/clothes/shoes/white-sneakers.jpg"),
            ("Brown Boots", "boots", "shoes", "/clothes/shoes/brown-boots.jpg"),
            ("Black Dress Shoes", "dress", "shoes", "/clothes/shoes/black-dress.jpg"),
        ]
        
        cursor.executemany("""
            INSERT INTO clothes (name, type, body_part, image_path) 
            VALUES (?, ?, ?, ?)
        """, sample_clothes)
        
        print(f"Added {len(sample_clothes)} sample clothing items")
    
    # Add sample posts
    cursor.execute("SELECT COUNT(*) FROM posts")
    if cursor.fetchone()[0] == 0:
        sample_posts = [
            ("Summer Style Tips", "Great tips for staying cool in summer", "user1", "pending"),
            ("Winter Wardrobe Essentials", "Must-have items for cold weather", "user2", "approved"),
            ("Business Casual Guide", "How to dress professionally yet comfortably", "user3", "pending"),
        ]
        
        cursor.executemany("""
            INSERT INTO posts (title, body, author, status) 
            VALUES (?, ?, ?, ?)
        """, sample_posts)
        
        print(f"Added {len(sample_posts)} sample posts")
    
    conn.commit()
    conn.close()
    print("Database initialized successfully!")

def create_clothes_directory():
    """Create the clothes directory structure"""
    base_dir = "clothes"
    subdirs = ["tops", "bottoms", "shoes"]
    
    for subdir in subdirs:
        path = os.path.join(base_dir, subdir)
        if not os.path.exists(path):
            os.makedirs(path)
            print(f"Created directory: {path}")

if __name__ == "__main__":
    print("Initializing database...")
    create_clothes_directory()
    init_database()
    print("Setup complete!")
