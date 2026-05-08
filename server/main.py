from datetime import datetime, timedelta, timezone

import jwt
from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
app.config["SECRET_KEY"] = "your-secret-key-2024"

USERS_DB = {
    "admin@admin.com": {
        "id": 1,
        "email": "admin@admin.com",
        "password": generate_password_hash("admin123"),
        "name": "Administrador",
        "username": "admin",
        "phone": "123456789",
        "rol": "administrador",
    },
    "docente@docente.com": {
        "id": 2,
        "email": "docente@docente.com",
        "password": generate_password_hash("docente123"),
        "name": "Juan Docente",
        "username": "docente",
        "phone": "987654321",
        "rol": "docente",
    },
    "estudiante@estudiante.com": {
        "id": 3,
        "email": "estudiante@estudiante.com",
        "password": generate_password_hash("estudiante123"),
        "name": "María Estudiante",
        "username": "estudiante",
        "phone": "555666777",
        "rol": "estudiante",
    },
}


def create_token(user_id, email):
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=24),
    }
    return jwt.encode(payload, app.config["SECRET_KEY"], algorithm="HS256")


@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "ok", "message": "API Academic Server Running"}), 200


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    user = USERS_DB.get(email)
    if not user:
        return jsonify({"message": "User not found"}), 401

    if not check_password_hash(user["password"], password):
        return jsonify({"message": "Invalid password"}), 401

    user_response = {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "username": user["username"],
        "phone": user["phone"],
        "rol": user["rol"],
    }

    return jsonify(
        {
            "message": "Login successful",
            "token": create_token(user["id"], user["email"]),
            "user": user_response,
        }
    ), 200


@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip()
    password = data.get("password", "")
    name = data.get("name", "").strip()

    if not email or not password or not name:
        return jsonify({"message": "Email, password and name are required"}), 400

    if email in USERS_DB:
        return jsonify({"message": "Email already exists"}), 409

    user_id = len(USERS_DB) + 1
    user = {
        "id": user_id,
        "email": email,
        "password": generate_password_hash(password),
        "name": name,
        "username": data.get("username", email.split("@")[0]),
        "phone": data.get("phone", ""),
        "rol": data.get("rol", "usuario"),
    }
    USERS_DB[email] = user

    user_response = {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "username": user["username"],
        "phone": user["phone"],
        "rol": user["rol"],
    }

    return jsonify(
        {
            "message": "Registration successful",
            "token": create_token(user_id, email),
            "user": user_response,
        }
    ), 201


@app.errorhandler(404)
def not_found(_error):
    return jsonify({"message": "Endpoint not found", "status": "error"}), 404


@app.errorhandler(500)
def server_error(error):
    return jsonify({"message": "Server error", "status": "error", "details": str(error)}), 500


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5002, debug=False, threaded=True, use_reloader=False)
