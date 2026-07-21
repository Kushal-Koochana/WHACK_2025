from flask import Flask

from models import GameScore, Money, QuizScore, User, db

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

with app.app_context():
    db.session.query(QuizScore).delete()
    db.session.query(GameScore).delete()
    db.session.query(Money).delete()
    db.session.query(User).delete()
    db.session.commit()

print("All rows deleted from users, money, quiz_scores, and game_scores.")
