import os
from dotenv import load_dotenv
load_dotenv()

from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from backend.config import Config
from backend.models import db
from backend.models.user import User
from backend.models.department import Department
from backend.models.staff import Staff
from backend.models.notification import Notification
from backend.services.email_service import init_mail

# Route Blueprints
from backend.routes.auth import auth_bp
from backend.routes.complaints import complaints_bp
from backend.routes.feedback import feedback_bp
from backend.routes.admin import admin_bp
from backend.routes.reports import reports_bp
from backend.routes.ai import ai_bp
from backend.routes.dashboard import dashboard_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Ensure Upload Folder exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Initialize extensions
    db.init_app(app)
    init_mail(app)

    # Register blueprints under /api prefix
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(complaints_bp, url_prefix='/api')
    app.register_blueprint(feedback_bp, url_prefix='/api')
    app.register_blueprint(admin_bp, url_prefix='/api')
    app.register_blueprint(reports_bp, url_prefix='/api')
    app.register_blueprint(ai_bp, url_prefix='/api')
    app.register_blueprint(dashboard_bp, url_prefix='/api')

    # Serve uploaded images statically
    @app.route('/api/uploads/<path:filename>')
    def serve_uploads(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # Root endpoint for health check
    @app.route('/health', methods=['GET'])
    def health():
        return jsonify({'status': 'healthy', 'message': 'Smart College System Backend is running!'}), 200

    # Create tables and seed data
    with app.app_context():
        db.create_all()
        
        # Safe migration for new columns
        from sqlalchemy import text
        try:
            db.session.execute(text("ALTER TABLE ai_analysis ADD COLUMN report_quality_status VARCHAR(50);"))
            db.session.execute(text("ALTER TABLE ai_analysis ADD COLUMN report_quality_reason TEXT;"))
            db.session.commit()
        except Exception:
            db.session.rollback()
            
        try:
            db.session.execute(text("ALTER TABLE users ADD COLUMN phone VARCHAR(15);"))
            db.session.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'student';"))
            db.session.execute(text("ALTER TABLE users ADD COLUMN created_at DATETIME;"))
            db.session.commit()
        except Exception:
            db.session.rollback()
            
        seed_data()

    return app

def seed_data():
    # 1. Seed Default Departments if empty
    if Department.query.count() == 0:
        print("Seeding default college departments...")
        depts = [
            "Maintenance & Estate Office",
            "IT & Network Cell",
            "Hostel Administration",
            "Security Department",
            "Housekeeping Division",
            "Library Administration",
            "Electrical Substation"
        ]
        for dept_name in depts:
            db.session.add(Department(department_name=dept_name))
        db.session.commit()
        print("Default departments seeded successfully.")

    # 2. Seed Default Admin Account
    admin_email = 'admin@college.com'
    admin_user = User.query.filter_by(email=admin_email).first()
    if not admin_user:
        admin = User(
            name='System Administrator',
            email=admin_email,
            phone='9876543210',
            role='admin'
        )
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.commit()
        print("Default admin created (admin@college.com / admin123).")
    else:
        # Ensure password is admin123 and role is admin
        admin_user.role = 'admin'
        admin_user.set_password('admin123')
        if not admin_user.phone:
            admin_user.phone = '9876543210'
        db.session.commit()

    # 3. Seed Default Student Account
    student_email = 'student@college.com'
    student_user = User.query.filter_by(email=student_email).first()
    if not student_user:
        student = User(
            name='Demo Student',
            email=student_email,
            phone='9876543211',
            role='student'
        )
        student.set_password('student123')
        db.session.add(student)
        db.session.commit()
        print("Default student created (student@college.com / student123).")
    else:
        student_user.role = 'student'
        student_user.set_password('student123')
        if not student_user.phone:
            student_user.phone = '9876543211'
        db.session.commit()

    # 4. Seed Default Staff Account
    staff_email = 'staff@college.com'
    staff_user = User.query.filter_by(email=staff_email).first()
    it_dept = Department.query.filter(Department.department_name.ilike('%IT%')).first()
    dept_id = it_dept.id if it_dept else 1

    if not staff_user:
        staff_account = User(
            name='IT Support Officer',
            email=staff_email,
            phone='9876543212',
            role='staff'
        )
        staff_account.set_password('staff123')
        db.session.add(staff_account)
        db.session.flush()

        staff_profile = Staff(
            user_id=staff_account.id,
            department_id=dept_id
        )
        db.session.add(staff_profile)
        db.session.commit()
        print("Default staff created (staff@college.com / staff123).")
    else:
        staff_user.role = 'staff'
        staff_user.set_password('staff123')
        if not staff_user.phone:
            staff_user.phone = '9876543212'
        if not staff_user.staff_profile:
            staff_profile = Staff(
                user_id=staff_user.id,
                department_id=dept_id
            )
            db.session.add(staff_profile)
        db.session.commit()

app = create_app()

if __name__ == '__main__':
    # Run server with debug reload enabled
    app.run(host='0.0.0.0', port=5001, debug=True)
