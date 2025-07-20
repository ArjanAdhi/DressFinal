from flask import Blueprint, request, jsonify, session
import sqlite3
import bcrypt
from functools import wraps

auth_blueprint = Blueprint("auth", __name__)


def get_db():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    return conn


def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'role' not in session or session['role'] != 'admin':
            return jsonify({"error": "Admin access required"}), 403
        return f(*args, **kwargs)

    return decorated_function


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'username' not in session:
            return jsonify({"error": "Login required"}), 401
        return f(*args, **kwargs)

    return decorated_function


@auth_blueprint.route("/register", methods=["POST", "OPTIONS"])
def register():
    if request.method == "OPTIONS":
        return '', 200

    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    email = data.get("email")
    username = data.get("username")
    password_plain = data.get("password")

    if not email or not username or not password_plain:
        return jsonify({"error": "All fields are required"}), 400

    hashed_password = bcrypt.hashpw(password_plain.encode("utf-8"), bcrypt.gensalt())

    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO users (email, username, password, role, active) VALUES (?, ?, ?, ?, ?)",
                       (email, username, hashed_password.decode("utf-8"), "user", True))
        conn.commit()
        return jsonify({"message": "User registered successfully!"}), 201
    except sqlite3.IntegrityError as e:
        if "username" in str(e):
            return jsonify({"error": "Username already exists!"}), 400
        elif "email" in str(e):
            return jsonify({"error": "Email already exists!"}), 400
        else:
            return jsonify({"error": "User already exists!"}), 400
    except Exception as e:
        print(f"Registration error: {e}")
        return jsonify({"error": "Registration failed"}), 500
    finally:
        conn.close()


@auth_blueprint.route("/login", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        return '', 200

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    username = data.get("username")
    password_attempt = data.get("password")

    if not username or not password_attempt:
        return jsonify({"error": "Username and password are required"}), 400

    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT password, role, active FROM users WHERE username = ?", (username,))
        row = cursor.fetchone()

        if row:
            stored_hash, role, active = row

            # Check if user is active
            if not active:
                return jsonify({"error": "Account is deactivated"}), 401

            if bcrypt.checkpw(password_attempt.encode("utf-8"), stored_hash.encode("utf-8")):
                session["username"] = username
                session["role"] = role
                session.permanent = True
                print(f"User {username} logged in successfully as {role}")
                return jsonify({"message": "Login successful!", "role": role}), 200
            else:
                return jsonify({"error": "Invalid password"}), 401
        else:
            return jsonify({"error": "Invalid username"}), 401
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({"error": "Login failed"}), 500
    finally:
        conn.close()


@auth_blueprint.route("/logout", methods=["POST", "OPTIONS"])
def logout():
    if request.method == "OPTIONS":
        return '', 200

    try:
        username = session.get("username", "Unknown")
        session.clear()
        print(f"User {username} logged out successfully")
        return jsonify({"message": "Logged out successfully!"}), 200
    except Exception as e:
        print(f"Logout error: {e}")
        return jsonify({"message": "Logged out"}), 200


@auth_blueprint.route("/check-session", methods=["GET"])
def check_session():
    """Check if user has a valid session"""
    try:
        if "username" in session and "role" in session:
            # Verify user still exists and is active
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT active FROM users WHERE username = ?", (session["username"],))
            row = cursor.fetchone()
            conn.close()

            if row and row["active"]:
                return jsonify({
                    "authenticated": True,
                    "username": session["username"],
                    "role": session["role"]
                }), 200
            else:
                session.clear()
                return jsonify({"authenticated": False}), 401
        else:
            return jsonify({"authenticated": False}), 401
    except Exception as e:
        print(f"Session check error: {e}")
        session.clear()
        return jsonify({"authenticated": False}), 401


@auth_blueprint.route("/change-password", methods=["POST", "OPTIONS"])
@login_required
def change_password():
    if request.method == "OPTIONS":
        return '', 200

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    old_password = data.get("oldPassword")
    new_password = data.get("newPassword")

    if not old_password or not new_password:
        return jsonify({"error": "Both old and new passwords are required"}), 400

    username = session["username"]

    conn = get_db()
    cursor = conn.cursor()
    try:
        # Get current password
        cursor.execute("SELECT password FROM users WHERE username = ?", (username,))
        row = cursor.fetchone()

        if not row:
            return jsonify({"error": "User not found"}), 404

        stored_hash = row["password"]

        # Verify old password
        if not bcrypt.checkpw(old_password.encode("utf-8"), stored_hash.encode("utf-8")):
            return jsonify({"error": "Current password is incorrect"}), 400

        # Hash new password
        new_hash = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt())

        # Update password
        cursor.execute("UPDATE users SET password = ? WHERE username = ?",
                       (new_hash.decode("utf-8"), username))
        conn.commit()

        return jsonify({"message": "Password updated successfully!"}), 200

    except Exception as e:
        print(f"Password change error: {e}")
        return jsonify({"error": "Failed to update password"}), 500
    finally:
        conn.close()


@auth_blueprint.route("/admin/check", methods=["GET"])
def check_admin():
    if "username" in session and session.get("role") == "admin":
        return jsonify({"access": "granted"}), 200
    return jsonify({"access": "denied"}), 403