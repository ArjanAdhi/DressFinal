from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from auth import auth_blueprint
from admin_routes import admin_routes
import os

# Set the path to your React build directory
react_build_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../dress-ez/dist"))

app = Flask(__name__, static_folder=react_build_path, static_url_path="")
app.secret_key = os.environ.get("SECRET_KEY", "supersecretkey_donttellanyone")
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SECURE"] = False  # Set to True in production with HTTPS

# Enable CORS for all routes
CORS(app, supports_credentials=True, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Register blueprints
app.register_blueprint(auth_blueprint, url_prefix="/auth")
app.register_blueprint(admin_routes)


# Serve clothing images
@app.route('/clothes/<path:filename>')
def serve_clothes(filename):
    clothes_dir = os.path.join(app.root_path, 'clothes')
    if not os.path.exists(clothes_dir):
        os.makedirs(clothes_dir)
        # Create subdirectories
        for subdir in ['tops', 'bottoms', 'shoes']:
            subdir_path = os.path.join(clothes_dir, subdir)
            if not os.path.exists(subdir_path):
                os.makedirs(subdir_path)

    try:
        return send_from_directory(clothes_dir, filename)
    except FileNotFoundError:
        return jsonify({"error": "Image not found"}), 404


# Health check endpoint
@app.route('/health')
def health_check():
    return jsonify({"status": "healthy", "message": "DressEZ is running!"})


# Serve React app for all other routes
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    # Handle specific paths that should return the React app
    react_routes = ['login', 'register', 'admin-dashboard', 'user-dashboard', 'filter', 'pick', 'settings',
                    'add-clothes', 'admin/users', 'admin/content', 'admin/data-entry', 'admin/analytics']

    if path in react_routes:
        return send_from_directory(app.static_folder, "index.html")

    # For other paths, try to serve the actual file first
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)

    # Default to React app
    return send_from_directory(app.static_folder, "index.html")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_ENV") != "production"

    print("Starting DressEZ server...")
    print(f"React build path: {react_build_path}")
    print(f"Port: {port}")
    print(f"Debug mode: {debug}")

    app.run(host='0.0.0.0', port=port, debug=debug)