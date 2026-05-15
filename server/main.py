from datetime import datetime, timedelta, timezone
from io import BytesIO

import jwt
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
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

SUBJECTS_DB = [
    {
        "id": "6cc8d499-3512-4652-8ecc-f495f8af4f10",
        "nombre": "Programacion",
        "code": "PRG101",
    }
]

SEMESTERS_DB = [
    {
        "id": "15f029b4-f4ef-4774-bf57-f61163f283a7",
        "name": "2026-1",
        "code": "2026-1",
        "is_active": True,
    }
]

GROUPS_DB = [
    {
        "id": "94a99cca-6f4a-4745-9a93-6178d436f17f",
        "nombre": "Grupo A",
        "codigo_grupo": "A-2026",
        "subject_id": "6cc8d499-3512-4652-8ecc-f495f8af4f10",
        "semester_id": "15f029b4-f4ef-4774-bf57-f61163f283a7",
        "docente_id": "2",
    }
]

STUDENTS_DB = [
    {
        "id": "79c77ebf-2d0f-40be-8ffc-9f4b78d11f6d",
        "nombre": "Ana",
        "apellido": "Lopez",
    },
    {
        "id": "83f6e6ea-1d8b-4db0-a5b6-a68d0d1fa7ba",
        "nombre": "Luis",
        "apellido": "Perez",
    },
]

ENROLLMENTS_DB = [
    {
        "id": "790ebf3e-5044-4cea-82af-72f1774bd84e",
        "student_id": "79c77ebf-2d0f-40be-8ffc-9f4b78d11f6d",
        "group_id": "94a99cca-6f4a-4745-9a93-6178d436f17f",
        "status": "ACTIVE",
    },
    {
        "id": "14a94f7a-abdb-4f3c-a624-42325ef4776e",
        "student_id": "83f6e6ea-1d8b-4db0-a5b6-a68d0d1fa7ba",
        "group_id": "94a99cca-6f4a-4745-9a93-6178d436f17f",
        "status": "ACTIVE",
    },
]

EVALUATIONS_DB = [
    {
        "id": "7d56476b-4fb2-48f9-a96d-545878935dc7",
        "group_id": "94a99cca-6f4a-4745-9a93-6178d436f17f",
        "name": "Evaluacion 1",
        "weight": 30,
        "rubric_id": "rubric-1",
    },
    {
        "id": "ea6e9312-4097-4541-b13f-f4ed8da5f22d",
        "group_id": "94a99cca-6f4a-4745-9a93-6178d436f17f",
        "name": "Evaluacion 2",
        "weight": 30,
        "rubric_id": "rubric-1",
    },
    {
        "id": "689f4eca-6e66-42af-b8fa-510af9f73dcd",
        "group_id": "94a99cca-6f4a-4745-9a93-6178d436f17f",
        "name": "Evaluacion 3",
        "weight": 40,
        "rubric_id": "rubric-1",
    },
]

GRADES_DB = [
    {
        "id": "c6b6d450-a016-4f80-a1cc-745138059f76",
        "evaluation_id": "7d56476b-4fb2-48f9-a96d-545878935dc7",
        "enrollment_id": "790ebf3e-5044-4cea-82af-72f1774bd84e",
        "final_score": 4.0,
        "status": "SENT",
        "is_locked": False,
    },
    {
        "id": "7f660d98-6f8f-4a35-86ff-e0f6b9ed65a1",
        "evaluation_id": "7d56476b-4fb2-48f9-a96d-545878935dc7",
        "enrollment_id": "14a94f7a-abdb-4f3c-a624-42325ef4776e",
        "final_score": 3.8,
        "status": "SENT",
        "is_locked": False,
    },
    {
        "id": "b7ff8cf4-badb-4e88-a6a8-39f1f81dcb5d",
        "evaluation_id": "ea6e9312-4097-4541-b13f-f4ed8da5f22d",
        "enrollment_id": "790ebf3e-5044-4cea-82af-72f1774bd84e",
        "final_score": 3.5,
        "status": "SENT",
        "is_locked": False,
    },
    {
        "id": "99566e8a-95cf-4c57-8ea8-ab95f1b3d6bf",
        "evaluation_id": "ea6e9312-4097-4541-b13f-f4ed8da5f22d",
        "enrollment_id": "14a94f7a-abdb-4f3c-a624-42325ef4776e",
        "final_score": 3.9,
        "status": "SENT",
        "is_locked": False,
    },
    {
        "id": "8337a15e-9a89-446e-bce0-2890d5cf6fcf",
        "evaluation_id": "689f4eca-6e66-42af-b8fa-510af9f73dcd",
        "enrollment_id": "790ebf3e-5044-4cea-82af-72f1774bd84e",
        "final_score": 5.0,
        "status": "SENT",
        "is_locked": False,
    },
    {
        "id": "da5f6ff3-07b3-4722-b458-c6b4eea21715",
        "evaluation_id": "689f4eca-6e66-42af-b8fa-510af9f73dcd",
        "enrollment_id": "14a94f7a-abdb-4f3c-a624-42325ef4776e",
        "final_score": 4.5,
        "status": "SENT",
        "is_locked": False,
    },
]

FINALIZATION_DB = {}
FINAL_REPORTS = {}


def get_group(group_id):
    return next((group for group in GROUPS_DB if group["id"] == group_id), None)


def get_semester(semester_id):
    return next((semester for semester in SEMESTERS_DB if semester["id"] == semester_id), None)


def get_subject(subject_id):
    return next((subject for subject in SUBJECTS_DB if subject["id"] == subject_id), None)


def get_group_evaluations(group_id):
    return [evaluation for evaluation in EVALUATIONS_DB if evaluation["group_id"] == group_id]


def get_group_enrollments(group_id):
    return [enrollment for enrollment in ENROLLMENTS_DB if enrollment["group_id"] == group_id]


def is_active_enrollment(enrollment):
    raw_status = enrollment.get("status")
    if isinstance(raw_status, bool):
        return raw_status
    if raw_status is None or raw_status == "":
        return True
    return str(raw_status).strip().upper() in {"ACTIVE", "ACTIVO", "ENROLLED", "MATRICULADO"}


def get_evaluation_grades(evaluation_id):
    return [grade for grade in GRADES_DB if grade["evaluation_id"] == evaluation_id]


def normalize_grade_status(status):
    return str(status or "").strip().upper()


def build_student_consolidated_rows(group_id):
    evaluations = get_group_evaluations(group_id)
    enrollments = [en for en in get_group_enrollments(group_id) if is_active_enrollment(en)]
    students_by_id = {student["id"]: student for student in STUDENTS_DB}

    rows = []
    for enrollment in enrollments:
        student = students_by_id.get(enrollment["student_id"], {})
        scores = []
        row = {
            "student_name": f"{student.get('nombre', '')} {student.get('apellido', '')}".strip() or enrollment["student_id"],
            "scores": [],
            "final_semester_score": 0,
        }

        for evaluation in evaluations:
            grade = next(
                (
                    item
                    for item in get_evaluation_grades(evaluation["id"])
                    if item["enrollment_id"] == enrollment["id"]
                ),
                None,
            )
            score = grade.get("final_score") if grade else None
            row["scores"].append({
                "evaluation_name": evaluation["name"],
                "weight": evaluation["weight"],
                "final_score": score,
            })
            if isinstance(score, (int, float)):
                scores.append((score * float(evaluation["weight"])) / 100)

        row["final_semester_score"] = round(sum(scores), 2)
        rows.append(row)

    return rows


def generate_official_pdf(group_id, finalized_at):
    group = get_group(group_id)
    semester = get_semester(group.get("semester_id")) if group else None
    subject = get_subject(group.get("subject_id")) if group else None
    rows = build_student_consolidated_rows(group_id)

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    y = height - 50
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(50, y, "UNIVERSIDAD - REPORTE OFICIAL DE NOTAS FINALES")
    y -= 24

    pdf.setFont("Helvetica", 10)
    pdf.drawString(50, y, f"Grupo: {group.get('nombre', 'N/A') if group else 'N/A'}")
    y -= 14
    pdf.drawString(50, y, f"Semestre: {semester.get('name', 'N/A') if semester else 'N/A'}")
    y -= 14
    pdf.drawString(50, y, f"Asignatura: {subject.get('nombre', 'N/A') if subject else 'N/A'}")
    y -= 14
    pdf.drawString(50, y, "Docente: Juan Docente")
    y -= 14
    pdf.drawString(50, y, f"Fecha de consolidacion: {finalized_at}")
    y -= 22

    evaluations = get_group_evaluations(group_id)
    header = ["Estudiante"] + [ev["name"] for ev in evaluations] + ["Final"]
    pdf.setFont("Helvetica-Bold", 9)
    x = 50
    for title in header:
        pdf.drawString(x, y, title)
        x += 78
    y -= 14

    pdf.setFont("Helvetica", 9)
    for row in rows:
        if y < 70:
            pdf.showPage()
            y = height - 50
            pdf.setFont("Helvetica", 9)

        x = 50
        pdf.drawString(x, y, row["student_name"][:16])
        x += 78

        for score in row["scores"]:
            score_text = "-"
            if isinstance(score["final_score"], (int, float)):
                score_text = f"{float(score['final_score']):.2f}"
            pdf.drawString(x, y, score_text)
            x += 78

        pdf.drawString(x, y, f"{row['final_semester_score']:.2f}")
        y -= 13

    average = 0
    if rows:
        average = round(sum(item["final_semester_score"] for item in rows) / len(rows), 2)

    y -= 10
    pdf.setFont("Helvetica-Bold", 10)
    pdf.drawString(50, y, f"Promedio del grupo: {average:.2f}")

    pdf.save()
    buffer.seek(0)
    return buffer.read()


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


@app.route("/api/academic/groups", methods=["GET"])
def get_groups():
    return jsonify({"data": GROUPS_DB}), 200


@app.route("/api/academic/groups/<group_id>", methods=["GET"])
def get_group_by_id(group_id):
    group = get_group(group_id)
    if not group:
        return jsonify({"message": "Group not found"}), 404
    return jsonify({"data": group}), 200


@app.route("/api/academic/subjects", methods=["GET"])
def get_subjects():
    return jsonify({"data": SUBJECTS_DB}), 200


@app.route("/api/academic/subjects/<subject_id>", methods=["GET"])
def get_subject_by_id(subject_id):
    subject = get_subject(subject_id)
    if not subject:
        return jsonify({"message": "Subject not found"}), 404
    return jsonify({"data": subject}), 200


@app.route("/api/academic/semesters", methods=["GET"])
def get_semesters():
    return jsonify({"data": SEMESTERS_DB}), 200


@app.route("/api/academic/semesters/<semester_id>", methods=["GET"])
def get_semester_by_id(semester_id):
    semester = get_semester(semester_id)
    if not semester:
        return jsonify({"message": "Semester not found"}), 404
    return jsonify({"data": semester}), 200


@app.route("/api/academic/enrollments", methods=["GET"])
def get_enrollments():
    group_id = request.args.get("group_id")
    records = ENROLLMENTS_DB
    if group_id:
        records = [item for item in records if item["group_id"] == group_id]
    return jsonify({"data": records}), 200


@app.route("/api/academic/students", methods=["GET"])
def get_students():
    return jsonify({"data": STUDENTS_DB}), 200


@app.route("/api/evaluation/evaluations", methods=["GET"])
def get_evaluations():
    group_id = request.args.get("group_id")
    records = EVALUATIONS_DB
    if group_id:
        records = [item for item in records if item["group_id"] == group_id]
    return jsonify({"data": records}), 200


@app.route("/api/grades", methods=["GET"])
def get_grades():
    evaluation_id = request.args.get("evaluation_id")
    records = GRADES_DB
    if evaluation_id:
        records = [item for item in records if item["evaluation_id"] == evaluation_id]
    return jsonify({"data": records}), 200


@app.route("/api/grades/finalize/group/<group_id>/status", methods=["GET"])
def get_group_finalization_status(group_id):
    record = FINALIZATION_DB.get(group_id)
    if not record:
        return (
            jsonify(
                {
                    "data": {
                        "group_id": group_id,
                        "finalized": False,
                        "finalized_at": None,
                        "locked": False,
                    }
                }
            ),
            200,
        )

    return jsonify({"data": record}), 200


@app.route("/api/grades/finalize/groups", methods=["GET"])
def get_finalization_overview():
    data = []
    for group in GROUPS_DB:
        record = FINALIZATION_DB.get(group["id"])
        data.append(
            {
                "group_id": group["id"],
                "finalized": bool(record),
                "finalized_at": record.get("finalized_at") if record else None,
                "locked": record.get("locked", False) if record else False,
            }
        )
    return jsonify({"data": data}), 200


@app.route("/api/grades/finalize/group/<group_id>", methods=["POST"])
def finalize_group_final_grades(group_id):
    payload = request.get_json(silent=True) or {}
    confirmed = payload.get("confirmed") is True

    if not confirmed:
        return jsonify({"message": "Debes confirmar la consolidacion oficial."}), 400

    group = get_group(group_id)
    if not group:
        return jsonify({"message": "Grupo no encontrado."}), 404

    semester = get_semester(group.get("semester_id"))
    if not semester or not semester.get("is_active"):
        return jsonify({"message": "El semestre del grupo no esta activo."}), 409

    evaluations = get_group_evaluations(group_id)
    if not evaluations:
        return jsonify({"message": "El grupo no tiene evaluaciones registradas."}), 409

    active_enrollments = [en for en in get_group_enrollments(group_id) if is_active_enrollment(en)]
    if not active_enrollments:
        return jsonify({"message": "No hay inscripciones activas para consolidar."}), 409

    active_enrollment_ids = {item["id"] for item in active_enrollments}

    for evaluation in evaluations:
        grades = get_evaluation_grades(evaluation["id"])
        if len(grades) != len(active_enrollments):
            return (
                jsonify(
                    {
                        "message": f"La evaluacion {evaluation['name']} no tiene grades completas.",
                    }
                ),
                409,
            )

        grades_by_enrollment = {grade["enrollment_id"]: grade for grade in grades}
        if set(grades_by_enrollment.keys()) != active_enrollment_ids:
            return (
                jsonify(
                    {
                        "message": f"La evaluacion {evaluation['name']} no cubre todas las inscripciones activas.",
                    }
                ),
                409,
            )

        for grade in grades:
            if not isinstance(grade.get("final_score"), (int, float)):
                return (
                    jsonify(
                        {
                            "message": f"La evaluacion {evaluation['name']} tiene grades sin final_score.",
                        }
                    ),
                    409,
                )
            if normalize_grade_status(grade.get("status")) not in {"SUBMITTED", "SENT"}:
                return (
                    jsonify(
                        {
                            "message": f"La evaluacion {evaluation['name']} contiene grades no enviadas.",
                        }
                    ),
                    409,
                )

    if group_id in FINALIZATION_DB:
        return jsonify({"data": FINALIZATION_DB[group_id]}), 200

    finalized_at = datetime.now(timezone.utc).isoformat()
    record = {
        "group_id": group_id,
        "success": True,
        "finalized": True,
        "finalized_at": finalized_at,
        "locked": True,
        "immutable": True,
    }
    FINALIZATION_DB[group_id] = record

    evaluation_ids = {evaluation["id"] for evaluation in evaluations}
    for grade in GRADES_DB:
        if grade["evaluation_id"] in evaluation_ids and grade["enrollment_id"] in active_enrollment_ids:
            grade["is_locked"] = True

    FINAL_REPORTS[group_id] = generate_official_pdf(group_id, finalized_at)

    return jsonify({"data": record}), 200


@app.route("/api/grades/finalize/group/<group_id>/report", methods=["GET"])
def download_final_report(group_id):
    record = FINALIZATION_DB.get(group_id)
    if not record:
        return jsonify({"message": "El grupo aun no esta consolidado oficialmente."}), 409

    content = FINAL_REPORTS.get(group_id)
    if not content:
        content = generate_official_pdf(group_id, record["finalized_at"])
        FINAL_REPORTS[group_id] = content

    filename = f"reporte-final-{group_id}.pdf"
    return send_file(
        BytesIO(content),
        mimetype="application/pdf",
        as_attachment=True,
        download_name=filename,
    )


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
