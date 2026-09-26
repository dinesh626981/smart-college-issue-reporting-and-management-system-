from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from backend.models import db

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(15), nullable=True)
    role = db.Column(db.String(20), nullable=False)  # 'student', 'admin', 'staff'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    # A student can have multiple complaints
    complaints = db.relationship('Complaint', back_populates='student', foreign_keys='Complaint.student_id')
    # A user can be linked to a single staff profile
    staff_profile = db.relationship('Staff', back_populates='user', uselist=False, cascade="all, delete-orphan")

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
