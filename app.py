import datetime
import json

from flask import (
    Flask,
    redirect,
    render_template,
    request,
    send_from_directory,
    session,
    url_for,
)
from werkzeug.utils import secure_filename

from gemini import queryGemini
from models import GameScore, Money, QuizScore, User, db
from pdfHighlighting import highlight_pdf

app = Flask(__name__)
app.secret_key = "replace-this-with-a-secure-random-key"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

with app.app_context():
    db.create_all()


@app.context_processor
def inject_request():
    return dict(request=request)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template("login.html")
    elif request.method == "POST":
        email = request.form["email"]
        password = request.form["password"]

        user = User.query.filter_by(email=email).first()

        if user is not None and user.password == password:
            session["user_id"] = user.user_id
            return redirect(url_for("home", username=user.user_id))
        else:
            return render_template("login.html", error="Invalid credentials")


@app.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "GET":
        return render_template("signup.html")
    elif request.method == "POST":
        username = request.form["name"]
        email = request.form["email"]
        password = request.form["password"]

        existing_user = User.query.filter_by(email=email).first()
        if existing_user is not None:
            return render_template(
                "signup.html", error="An account with that email already exists"
            )

        new_user = User(username=username, email=email, password=password)
        db.session.add(new_user)
        db.session.commit()

        return redirect(url_for("login"))


@app.route("/submit", methods=["POST"])
def submit():
    pdf = request.files["file"]
    filename = secure_filename(pdf.filename)
    save_path = f"uploads/{filename}"
    pdf.save(save_path)

    try:
        response = queryGemini(filename)
        response = json.loads(response)
    except Exception as e:
        print("Contract analysis failed:", e)
        return render_template(
            "upload.html",
            error="Something went wrong analysing that file. Please check the server's Gemini API key and try again.",
        )

    highlighted_filename = None
    try:
        phrases = response.get("part_5") or response.get("part_4") or []
        if isinstance(phrases, list) and phrases:
            highlighted_filename = f"highlighted_{filename}"
            highlighted_path = f"uploads/{highlighted_filename}"
            highlight_pdf(save_path, highlighted_path, phrases)
    except Exception as e:
        print("Highlighting failed:", e)

    pdf_to_show = highlighted_filename or filename
    return render_template("upload.html", response=response, pdf_filename=pdf_to_show)


@app.route("/uploads/<path:filename>")
def uploaded_file(filename):
    return send_from_directory("uploads", filename)


@app.route("/quiz")
def quiz():
    return render_template("quiz.html")


@app.route("/game")
def game():
    return render_template("game.html")


@app.route("/cashflow")
def cashflow():
    return render_template("cash-flow-tracker.html")


@app.route("/contractconsultant")
def contractconsultant():
    return render_template("upload.html")


@app.route("/home/")
@app.route("/home/<username>")
def home(username=None):
    return render_template("index.html", username=username)


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("index"))


@app.route("/api/entries/<username>", methods=["GET"])
def get_entries(username):
    user_id = session.get("user_id")
    if not user_id:
        today_iso = datetime.date.today().isoformat()
        return json.dumps(
            [
                {
                    "id": "demo1",
                    "date": today_iso,
                    "description": "Salary",
                    "amount": 2000.0,
                    "type": "income",
                },
                {
                    "id": "demo2",
                    "date": today_iso,
                    "description": "Coffee",
                    "amount": 3.50,
                    "type": "expense",
                },
            ]
        )

    rows = Money.query.filter_by(user_id=user_id).all()
    entries = [
        {
            "id": row.money_id,
            "date": row.date.isoformat() if isinstance(row.date, (datetime.date, datetime.datetime)) else row.date,
            "description": row.description,
            "amount": row.amount,
            "type": row.type,
        }
        for row in rows
    ]
    return json.dumps(entries)


@app.route("/api/entries", methods=["POST"])
def add_entry():
    user_id = session.get("user_id")
    if not user_id:
        return json.dumps({"status": "unauthorized"}), 401
    data = request.json
    date_str = data.get("date")
    description = data.get("description")
    amount = float(data.get("amount", 0))
    entry_type = data.get("type")

    try:
        date = datetime.date.fromisoformat(date_str)
    except (TypeError, ValueError):
        return json.dumps({"status": "error", "message": "date must be in YYYY-MM-DD format"}), 400

    new_entry = Money(
        user_id=user_id,
        date=date,
        description=description,
        amount=amount,
        type=entry_type,
    )
    db.session.add(new_entry)
    db.session.commit()

    return json.dumps({"status": "success", "id": new_entry.money_id})


@app.route("/api/entries/<int:entry_id>", methods=["DELETE"])
def delete_entry(entry_id):
    user_id = session.get("user_id")
    if not user_id:
        return json.dumps({"status": "unauthorized"}), 401

    Money.query.filter_by(money_id=entry_id, user_id=user_id).delete()
    db.session.commit()

    return json.dumps({"status": "success"})


@app.route("/api/quiz", methods=["POST"])
def save_quiz_score():
    user_id = session.get("user_id")
    if not user_id:
        return json.dumps({"status": "unauthorized"}), 401
    data = request.json
    score = int(data.get("score", 700))

    new_score = QuizScore(user_id=user_id, score=score)
    db.session.add(new_score)
    db.session.commit()

    return json.dumps({"status": "success"})


@app.route("/api/quiz/high", methods=["GET"])
def get_quiz_high_score():
    user_id = session.get("user_id")
    if not user_id:
        return json.dumps({"high_score": 0, "logged_in": False})

    high_score = (
        db.session.query(db.func.max(QuizScore.score))
        .filter(QuizScore.user_id == user_id)
        .scalar()
    )

    return json.dumps(
        {"high_score": high_score if high_score is not None else 0, "logged_in": True}
    )


@app.route("/api/snake", methods=["POST"])
def save_snake_score():
    user_id = session.get("user_id")
    if not user_id:
        return json.dumps({"status": "unauthorized"}), 401
    data = request.json
    score = int(data.get("score", 0))

    new_score = GameScore(user_id=user_id, score=score)
    db.session.add(new_score)
    db.session.commit()

    return json.dumps({"status": "success"})


@app.route("/api/snake/high", methods=["GET"])
def get_snake_high_score():
    user_id = session.get("user_id")
    if not user_id:
        return json.dumps({"high_score": 0, "logged_in": False})

    high_score = (
        db.session.query(db.func.max(GameScore.score))
        .filter(GameScore.user_id == user_id)
        .scalar()
    )

    return json.dumps(
        {"high_score": high_score if high_score is not None else 0, "logged_in": True}
    )


if __name__ == "__main__":
    app.run(debug=True)
