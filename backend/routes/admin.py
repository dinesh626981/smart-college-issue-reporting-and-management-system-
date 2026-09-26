from flask import Blueprint, request, jsonify
from backend.models import db
from backend.models.user import User
from backend.models.department import Department
from backend.models.staff import Staff
from backend.middleware.auth_middleware import token_required
from backend.utils.helpers import is_valid_email

admin_bp = Blueprint('admin', __name__)

# --- DEPARTMENTS MANAGEMENT ---

@admin_bp.route('/departments', methods=['GET'])
@token_required()
def get_departments():
    # Accessible to all logged in users (e.g. Student raising complaint selects department)
    departments = Department.query.order_by(Department.department_name.asc()).all()
    return jsonify([d.to_dict() for d in departments]), 200

@admin_bp.route('/departments', methods=['POST'])
@token_required(allowed_roles=['admin'])
def create_department():
    data = request.get_json() or {}
    name = data.get('department_name')

    if not name or not name.strip():
        return jsonify({'message': 'Department name is required!'}), 400

    name = name.strip()
    if Department.query.filter_by(department_name=name).first():
        return jsonify({'message': 'Department already exists!'}), 409

    dept = Department(department_name=name)
    try:
        db.session.add(dept)
        db.session.commit()
        return jsonify({'message': 'Department created successfully!', 'department': dept.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to create department: {str(e)}'}), 500

@admin_bp.route('/departments/<int:dept_id>', methods=['DELETE'])
@token_required(allowed_roles=['admin'])
def delete_department(dept_id):
    dept = Department.query.get_or_404(dept_id)
    try:
        db.session.delete(dept)
        db.session.commit()
        return jsonify({'message': 'Department deleted successfully!'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to delete department: {str(e)}'}), 500


# --- STUDENTS MANAGEMENT ---

@admin_bp.route('/students', methods=['GET'])
@token_required(allowed_roles=['admin'])
def get_students():
    students = User.query.filter_by(role='student').order_by(User.created_at.desc()).all()
    return jsonify([s.to_dict() for s in students]), 200

# --- ADMINS MANAGEMENT ---

@admin_bp.route('/admins', methods=['GET'])
@token_required(allowed_roles=['admin'])
def get_admins():
    admins = User.query.filter_by(role='admin').order_by(User.created_at.desc()).all()
    return jsonify([a.to_dict() for a in admins]), 200


# --- STAFF MANAGEMENT ---

@admin_bp.route('/staff', methods=['GET'])
@token_required()
def get_staff():
    # Fetch all staff. Accessible by Admin and potentially other users (e.g. to list for dropdown assignments)
    staff_members = Staff.query.all()
    return jsonify([s.to_dict() for s in staff_members]), 200

@admin_bp.route('/staff', methods=['POST'])
@token_required(allowed_roles=['admin'])
def create_staff():
    data = request.get_json() or {}
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    phone = data.get('phone')
    department_id = data.get('department_id')

    if not name or not email or not password or not department_id:
        return jsonify({'message': 'Missing name, email, password or department!'}), 400

    if not is_valid_email(email):
        return jsonify({'message': 'Invalid email format!'}), 400

    if len(password) < 8:
        return jsonify({'message': 'Password must be at least 8 characters long!'}), 400

    # Check if user email is unique
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'A user with this email already exists!'}), 409

    # Verify department exists
    dept = Department.query.get(department_id)
    if not dept:
        return jsonify({'message': 'Invalid department selection!'}), 400

    # 1. Create User entry
    user = User(
        name=name,
        email=email,
        phone=phone,
        role='staff'
    )
    user.set_password(password)

    try:
        db.session.add(user)
        db.session.flush() # Sync with database to get user.id

        # 2. Create Staff profile entry linked to user.id
        staff = Staff(
            user_id=user.id,
            department_id=int(department_id)
        )
        db.session.add(staff)
        db.session.commit()

        return jsonify({
            'message': 'Department Staff registered successfully!',
            'staff': staff.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to create staff member: {str(e)}'}), 500
