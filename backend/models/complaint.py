from datetime import datetime
from backend.models import db

class Complaint(db.Model):
    __tablename__ = 'complaints'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    priority = db.Column(db.String(20), nullable=False)  # 'Low', 'Medium', 'High'
    image = db.Column(db.String(255), nullable=True)
    completion_image = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(20), default='Pending')  # 'Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed'
    student_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id', ondelete='SET NULL'), nullable=True)
    assigned_staff = db.Column(db.Integer, db.ForeignKey('staff.id', ondelete='SET NULL'), nullable=True)
    resolution_remarks = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    student = db.relationship('User', back_populates='complaints', foreign_keys=[student_id])
    department = db.relationship('Department', back_populates='complaints')
    assigned_staff_rel = db.relationship('Staff', back_populates='assigned_complaints', foreign_keys=[assigned_staff])
    feedbacks = db.relationship('Feedback', back_populates='complaint', cascade="all, delete-orphan")
    ai_analysis = db.relationship('AIAnalysis', back_populates='complaint', uselist=False, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'location': self.location,
            'priority': self.priority,
            'image': self.image,
            'completion_image': self.completion_image,
            'status': self.status,
            'student_id': self.student_id,
            'student_name': self.student.name if self.student else None,
            'department_id': self.department_id,
            'department_name': self.department.department_name if self.department else None,
            'assigned_staff': self.assigned_staff,
            'assigned_staff_name': self.assigned_staff_rel.user.name if (self.assigned_staff_rel and self.assigned_staff_rel.user) else None,
            'resolution_remarks': self.resolution_remarks,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'ai_analysis': self.ai_analysis.to_dict() if self.ai_analysis else None
        }
