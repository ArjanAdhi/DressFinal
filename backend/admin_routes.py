from flask import Blueprint, jsonify, request, session
import sqlite3
from functools import wraps

admin_routes = Blueprint("admin_routes", __name__)


def get_db():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    return conn


def admin_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        print(f"Admin check: session role = {session.get('role')}")
        if session.get("role") != "admin":
            return jsonify({"error": "Unauthorized"}), 403
        return f(*args, **kwargs)

    return wrapper


def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        print(f"Login check: session username = {session.get('username')}")
        if 'username' not in session:
            return jsonify({"error": "Login required"}), 401
        return f(*args, **kwargs)

    return wrapper


# -------------------- CLOTHING MANAGEMENT --------------------
@admin_routes.route("/user/add-clothing", methods=["POST", "OPTIONS"])
def user_add_clothing():
    if request.method == "OPTIONS":
        return '', 200

    print("User add clothing called")
    data = request.get_json()
    print(f"Received data: {data}")

    if not data:
        return jsonify({"error": "No data provided"}), 400

    name = data.get("name")
    type_ = data.get("type")
    body_part = data.get("body_part")
    image_path = data.get("image_path")

    if not all([name, type_, body_part, image_path]):
        return jsonify({"error": "All fields are required"}), 400

    conn = get_db()
    try:
        # Create clothes table if it doesn't exist
        conn.execute("""
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

        # Insert the new clothing item
        username = session.get("username", "anonymous")
        conn.execute("""
            INSERT INTO clothes (name, type, body_part, image_path, username) 
            VALUES (?, ?, ?, ?, ?)
        """, (name, type_, body_part, image_path, username))

        conn.commit()
        print(f"Successfully added clothing item: {name}")
        return jsonify({"message": "Clothing item added successfully!"}), 201

    except Exception as e:
        print(f"Error adding clothing: {e}")
        return jsonify({"error": "Failed to add clothing item"}), 500
    finally:
        conn.close()


@admin_routes.route("/admin/add-clothing", methods=["POST", "OPTIONS"])
@admin_required
def admin_add_clothing():
    if request.method == "OPTIONS":
        return '', 200

    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    name = data.get("name")
    type_ = data.get("type")
    body_part = data.get("body_part")
    image_path = data.get("image_path")

    if not all([name, type_, body_part, image_path]):
        return jsonify({"error": "All fields are required"}), 400

    conn = get_db()
    try:
        # Create clothes table if it doesn't exist
        conn.execute("""
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

        # Insert the new clothing item
        conn.execute("""
            INSERT INTO clothes (name, type, body_part, image_path) 
            VALUES (?, ?, ?, ?)
        """, (name, type_, body_part, image_path))

        conn.commit()
        return jsonify({"message": "Clothing item added successfully!"}), 201

    except Exception as e:
        print(f"Error adding clothing: {e}")
        return jsonify({"error": "Failed to add clothing item"}), 500
    finally:
        conn.close()


# -------------------- FILTER CLOTHES --------------------
@admin_routes.route("/filter", methods=["GET", "OPTIONS"])
def filter_clothes():
    if request.method == "OPTIONS":
        return '', 200

    # Check if this is an API request (has query parameters or Accept header indicates JSON)
    accept_header = request.headers.get('Accept', '')
    has_params = bool(request.args)
    is_api_request = 'application/json' in accept_header or has_params or request.path.startswith('/api/')

    # If it looks like a browser navigation (no params, no JSON accept), don't handle it here
    if not is_api_request:
        return None  # Let Flask handle this as a regular route

    print("Filter clothes called")
    type_ = request.args.get("type", "").strip()
    part = request.args.get("part", "").strip()
    name = request.args.get("name", "").strip()

    print(f"Filter params: type={type_}, part={part}, name={name}")

    conn = get_db()
    try:
        # Create clothes table if it doesn't exist
        conn.execute("""
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

        cursor = conn.cursor()

        # Base query
        query = "SELECT name, type, body_part, image_path FROM clothes WHERE 1=1"
        params = []

        # Add filters if provided
        if type_:
            query += " AND LOWER(type) = LOWER(?)"
            params.append(type_)
        if part:
            query += " AND LOWER(body_part) = LOWER(?)"
            params.append(part)
        if name:
            query += " AND LOWER(name) LIKE LOWER(?)"
            params.append(f"%{name}%")

        # Add ordering for consistent results
        query += " ORDER BY name ASC"

        print(f"Executing query: {query} with params: {params}")
        cursor.execute(query, params)
        results = cursor.fetchall()
        print(f"Found {len(results)} items")

        items = []
        for row in results:
            # Ensure proper image path formatting
            image_path = row["image_path"]
            if not image_path.startswith("/clothes/"):
                image_path = f"/clothes/{image_path}"

            items.append({
                "name": row["name"],
                "type": row["type"],
                "body_part": row["body_part"],
                "image_path": image_path
            })

        return jsonify(items)

    except Exception as e:
        print(f"Database error in filter_clothes: {e}")
        return jsonify({"error": "Database error occurred"}), 500
    finally:
        conn.close()


# -------------------- USERS --------------------
@admin_routes.route("/auth/admin/users", methods=["GET", "OPTIONS"])
@admin_required
def get_users():
    if request.method == "OPTIONS":
        return '', 200

    conn = get_db()
    try:
        users = conn.execute("SELECT id, email, username, role, active FROM users").fetchall()
        return jsonify([dict(u) for u in users])
    except Exception as e:
        print(f"Error fetching users: {e}")
        return jsonify({"error": "Failed to fetch users"}), 500
    finally:
        conn.close()


@admin_routes.route("/auth/admin/users/<int:user_id>/toggle_active", methods=["POST", "OPTIONS"])
@admin_required
def toggle_user_active(user_id):
    if request.method == "OPTIONS":
        return '', 200

    conn = get_db()
    try:
        user = conn.execute("SELECT active FROM users WHERE id = ?", (user_id,)).fetchone()
        if not user:
            return jsonify({"error": "User not found"}), 404

        new_status = not user["active"]
        conn.execute("UPDATE users SET active = ? WHERE id = ?", (new_status, user_id))
        conn.commit()
        return jsonify({"message": "User status updated"})
    except Exception as e:
        print(f"Error toggling user status: {e}")
        return jsonify({"error": "Failed to update user status"}), 500
    finally:
        conn.close()


@admin_routes.route("/auth/admin/users/<int:user_id>/delete", methods=["POST", "OPTIONS"])
@admin_required
def delete_user(user_id):
    if request.method == "OPTIONS":
        return '', 200

    conn = get_db()
    try:
        conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
        conn.commit()
        return jsonify({"message": "User deleted"})
    except Exception as e:
        print(f"Error deleting user: {e}")
        return jsonify({"error": "Failed to delete user"}), 500
    finally:
        conn.close()


# -------------------- POSTS --------------------
@admin_routes.route("/auth/admin/posts", methods=["GET", "OPTIONS"])
@admin_required
def get_posts():
    if request.method == "OPTIONS":
        return '', 200

    conn = get_db()
    try:
        # Check if posts table exists
        tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='posts'").fetchall()
        if not tables:
            # Create a dummy posts table if it doesn't exist
            conn.execute("""
                CREATE TABLE IF NOT EXISTS posts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    body TEXT,
                    author TEXT,
                    status TEXT DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.commit()

        posts = conn.execute("SELECT * FROM posts").fetchall()
        return jsonify([dict(row) for row in posts]), 200
    except Exception as e:
        print(f"Error fetching posts: {e}")
        return jsonify({"error": "Failed to fetch posts"}), 500
    finally:
        conn.close()


@admin_routes.route("/auth/admin/posts/<int:post_id>/approve", methods=["POST", "OPTIONS"])
@admin_required
def approve_post(post_id):
    if request.method == "OPTIONS":
        return '', 200

    conn = get_db()
    try:
        conn.execute("UPDATE posts SET status = 'approved' WHERE id = ?", (post_id,))
        conn.commit()
        return jsonify({"message": "Post approved"})
    except Exception as e:
        print(f"Error approving post: {e}")
        return jsonify({"error": "Failed to approve post"}), 500
    finally:
        conn.close()


@admin_routes.route("/auth/admin/posts/<int:post_id>/delete", methods=["POST", "OPTIONS"])
@admin_required
def delete_post(post_id):
    if request.method == "OPTIONS":
        return '', 200

    conn = get_db()
    try:
        conn.execute("DELETE FROM posts WHERE id = ?", (post_id,))
        conn.commit()
        return jsonify({"message": "Post deleted"})
    except Exception as e:
        print(f"Error deleting post: {e}")
        return jsonify({"error": "Failed to delete post"}), 500
    finally:
        conn.close()


@admin_routes.route("/auth/admin/posts/<int:post_id>/edit", methods=["POST", "OPTIONS"])
@admin_required
def edit_post(post_id):
    if request.method == "OPTIONS":
        return '', 200

    data = request.get_json()
    filename = data.get("filename")
    label = data.get("label")

    conn = get_db()
    try:
        conn.execute("UPDATE posts SET title = ?, body = ? WHERE id = ?",
                     (filename, label, post_id))
        conn.commit()
        return jsonify({"message": "Post updated"})
    except Exception as e:
        print(f"Error updating post: {e}")
        return jsonify({"error": "Failed to update post"}), 500
    finally:
        conn.close()


# -------------------- ANALYTICS DASHBOARD --------------------
@admin_routes.route("/api/admin/analytics", methods=["GET", "OPTIONS"])
@admin_required
def get_analytics():
    if request.method == "OPTIONS":
        return '', 200

    conn = get_db()
    try:
        # USER STATS
        user_total = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        roles = conn.execute("SELECT role, COUNT(*) as count FROM users GROUP BY role").fetchall()
        role_breakdown = {r["role"]: r["count"] for r in roles}

        # CLOTHING STATS
        clothing_total = 0
        clothing_by_category = {}

        # Check if clothes table exists
        tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='clothes'").fetchall()
        if tables:
            clothing_total = conn.execute("SELECT COUNT(*) FROM clothes").fetchone()[0]
            categories = conn.execute("SELECT body_part, COUNT(*) as count FROM clothes GROUP BY body_part").fetchall()
            clothing_by_category = {c["body_part"]: c["count"] for c in categories}

        # POST STATS
        post_total = 0
        completion_stats = {}

        tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='posts'").fetchall()
        if tables:
            post_total = conn.execute("SELECT COUNT(*) FROM posts").fetchone()[0]
            categories = conn.execute("SELECT status, COUNT(*) as count FROM posts GROUP BY status").fetchall()
            completion_stats = {c["status"]: c["count"] for c in categories}

        return jsonify({
            "users": {
                "total": user_total,
                "by_role": role_breakdown
            },
            "clothing": {
                "total": clothing_total,
                "by_category": clothing_by_category
            },
            "posts": {
                "total": post_total,
                "by_status": completion_stats
            }
        })
    except Exception as e:
        print(f"Error fetching analytics: {e}")
        return jsonify({"error": "Failed to fetch analytics"}), 500
    finally:
        conn.close()


# -------------------- SAVE OUTFIT --------------------
@admin_routes.route("/save-outfit", methods=["POST", "OPTIONS"])
def save_outfit():
    if request.method == "OPTIONS":
        return '', 200

    data = request.get_json()
    username = session.get("username", "anonymous")

    conn = get_db()
    try:
        # Create outfits table if it doesn't exist
        conn.execute("""
            CREATE TABLE IF NOT EXISTS outfits (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                top_name TEXT,
                bottom_name TEXT,
                shoes_name TEXT,
                saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Extract outfit data
        top_name = data.get("top", {}).get("name", "Unknown")
        bottom_name = data.get("bottom", {}).get("name", "Unknown")
        shoes_name = data.get("shoes", {}).get("name", "Unknown")

        # Insert outfit
        conn.execute("""
            INSERT INTO outfits (username, top_name, bottom_name, shoes_name) 
            VALUES (?, ?, ?, ?)
        """, (username, top_name, bottom_name, shoes_name))

        conn.commit()
        return jsonify({"message": "Outfit saved successfully!"}), 200
    except Exception as e:
        print(f"Error saving outfit: {e}")
        return jsonify({"error": "Failed to save outfit"}), 500
    finally:
        conn.close()