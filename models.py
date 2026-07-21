import datetime
 
from flask_sqlalchemy import SQLAlchemy
 
db = SQLAlchemy()
 
 
class User(db.Model):
    __tablename__ = "users"
 
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
 
    money_entries = db.relationship(
        "Money", backref="user", cascade="all, delete-orphan", passive_deletes=True
    )
    quiz_scores = db.relationship(
        "QuizScore", backref="user", cascade="all, delete-orphan", passive_deletes=True
    )
    game_scores = db.relationship(
        "GameScore", backref="user", cascade="all, delete-orphan", passive_deletes=True
    )
 
    def __repr__(self):
        return f"<User {self.user_id} {self.email}>"
 
 
class Money(db.Model):
    __tablename__ = "money"
 
    money_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False
    )
    date = db.Column(db.Date, nullable=False)
    description = db.Column(db.String(255), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    type = db.Column(db.String(50), nullable=False)
 
    def __repr__(self):
        return f"<Money {self.money_id} {self.type} {self.amount}>"
 
 
class QuizScore(db.Model):
    __tablename__ = "quiz_scores"
 
    quiz_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False
    )
    score = db.Column(db.Integer, nullable=False)
    date = db.Column(db.DateTime, default=datetime.datetime.utcnow)
 
    def __repr__(self):
        return f"<QuizScore {self.quiz_id} user={self.user_id} score={self.score}>"
 
 
class GameScore(db.Model):
    """High scores for the Credit Snake Game, kept per-user (mirrors QuizScore)."""
 
    __tablename__ = "game_scores"
 
    game_score_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False
    )
    score = db.Column(db.Integer, nullable=False)
    date = db.Column(db.DateTime, default=datetime.datetime.utcnow)
 
    def __repr__(self):
        return f"<GameScore {self.game_score_id} user={self.user_id} score={self.score}>"
