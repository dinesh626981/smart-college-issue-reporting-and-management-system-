from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Import models here so they are registered with SQLAlchemy
from backend.models.user import User
from backend.models.department import Department
from backend.models.staff import Staff
from backend.models.complaint import Complaint
from backend.models.feedback import Feedback
from backend.models.ai_analysis import AIAnalysis
from backend.models.notification import Notification

