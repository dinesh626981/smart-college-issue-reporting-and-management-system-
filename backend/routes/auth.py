import jwt
import datetime
from flask import Blueprint, request, jsonify, current_app, g
from backend.models import db
from backend.models.user import User
from backend.models.staff import Staff
from backend.middleware.auth_middleware import token_required
from backend.utils.helpers import is_valid_email, generate_random_password
from backend.services.email_service import send_password_reset_email

auth_bp = Blueprint('auth', __name__)

def _process_registration(data, forced_role=None):
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    phone = data.get('phone')
    role = (forced_role or data.get('role', 'student') or 'student').strip().lower()

    # Basic validations
    if not name or not email or not password:
        return jsonify({'message': 'Missing name, email or password!'}), 400

    if not is_valid_email(email):
        return jsonify({'message': 'Invalid email format!'}), 400

    if len(password) < 8:
        return jsonify({'message': 'Password must be at least 8 characters long!'}), 400

    if role not in ['student', 'admin']:
        return jsonify({'message': 'Invalid role specified. Only student or admin accounts can be registered.'}), 400

    # If registering as admin, verify admin security key
    if role == 'admin':
        admin_code = data.get('admin_code') or data.get('admin_key') or data.get('admin_secret') or ''
        expected_code = current_app.config.get('ADMIN_REGISTRATION_KEY', 'admin123')
        if not admin_code or admin_code.strip() != expected_code:
            return jsonify({
                'message': 'Invalid Admin Security Key! Please check your institution admin code and try again.'
            }), 403

    try:
        # Check if user already exists
        if User.query.filter_by(email=email).first():
            return jsonify({'message': 'An account with this email already exists.'}), 409

        # Create new user
        user = User(
            name=name,
            email=email,
            phone=phone,
            role=role
        )
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        success_msg = (
            'Admin registration successful! Please log in to access the administrator dashboard.'
            if role == 'admin'
            else 'Student registration successful! Please login.'
        )
        return jsonify({'message': success_msg, 'user': user.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        error_str = str(e).lower()
        if 'duplicate' in error_str or 'unique' in error_str:
            return jsonify({'message': 'An account with this email already exists.'}), 409
        return jsonify({'message': f'Server error: {str(e)}'}), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    return _process_registration(data)

@auth_bp.route('/register-admin', methods=['POST'])
def register_admin():
    data = request.get_json() or {}
    return _process_registration(data, forced_role='admin')

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    identifier = (data.get('identifier') or data.get('email') or '').strip()
    password = data.get('password')

    if not identifier or not password:
        return jsonify({'message': 'Please provide your email or mobile number, and password!'}), 400

    # Normalization for phone lookup if user enters formatted number
    clean_digits = ''.join(filter(str.isdigit, identifier))
    
    # Match against email or phone number variations
    user = User.query.filter(
        (User.email.ilike(identifier)) |
        (User.phone == identifier) |
        (User.phone == clean_digits) |
        (User.phone == (clean_digits[-10:] if len(clean_digits) >= 10 else clean_digits))
    ).first()

    if not user or not user.check_password(password):
        return jsonify({'message': 'Invalid credentials!'}), 401

    # Generate JWT token
    token = jwt.encode({
        'user_id': user.id,
        'role': user.role,
        'exp': datetime.datetime.utcnow() + current_app.config['JWT_ACCESS_TOKEN_EXPIRES']
    }, current_app.config['SECRET_KEY'], algorithm='HS256')

    user_data = user.to_dict()
    
    # If the user is staff, we also want to return staff_id and department_id
    if user.role == 'staff' and user.staff_profile:
        user_data['staff_id'] = user.staff_profile.id
        user_data['department_id'] = user.staff_profile.department_id
        user_data['department_name'] = user.staff_profile.department.department_name if user.staff_profile.department else None

    return jsonify({
        'token': token,
        'user': user_data
    }), 200

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json() or {}
    identifier = (data.get('identifier') or data.get('email') or '').strip()

    if not identifier:
        return jsonify({'message': 'Please provide your registered email or mobile number!'}), 400

    clean_digits = ''.join(filter(str.isdigit, identifier))
    user = User.query.filter(
        (User.email.ilike(identifier)) |
        (User.phone == identifier) |
        (User.phone == clean_digits) |
        (User.phone == (clean_digits[-10:] if len(clean_digits) >= 10 else clean_digits))
    ).first()
    if not user:
        return jsonify({'message': 'Account not found with that email or mobile number!'}), 404

    # Generate temporary password
    temp_pass = generate_random_password(10)
    user.set_password(temp_pass)

    try:
        db.session.commit()
        # Send password reset email
        mail_sent = send_password_reset_email(user.email, temp_pass)
        
        response_msg = f'A temporary password has been sent to your registered email ({user.email}).'
        if not mail_sent:
            response_msg += ' (Simulated in server console logs since SMTP is not configured)'

        return jsonify({'message': response_msg}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to reset password: {str(e)}'}), 500

@auth_bp.route('/profile', methods=['GET'])
@token_required()
def get_profile():
    user = g.current_user
    user_data = user.to_dict()
    
    # Add staff specific details
    if user.role == 'staff' and user.staff_profile:
        user_data['staff_id'] = user.staff_profile.id
        user_data['department_id'] = user.staff_profile.department_id
        user_data['department_name'] = user.staff_profile.department.department_name if user.staff_profile.department else None

    return jsonify(user_data), 200

@auth_bp.route('/profile', methods=['PUT'])
@token_required()
def update_profile():
    user = g.current_user
    data = request.get_json() or {}

    name = data.get('name')
    phone = data.get('phone')
    current_password = data.get('current_password')
    new_password = data.get('new_password')

    # Update basic profile details
    if name:
        user.name = name
    if phone is not None:
        user.phone = phone

    # Update password if requested
    if new_password:
        if not current_password:
            return jsonify({'message': 'Current password is required to set a new password!'}), 400
        
        if not user.check_password(current_password):
            return jsonify({'message': 'Incorrect current password!'}), 401
            
        if len(new_password) < 8:
            return jsonify({'message': 'New password must be at least 8 characters long!'}), 400
            
        user.set_password(new_password)

    try:
        db.session.commit()
        
        user_data = user.to_dict()
        if user.role == 'staff' and user.staff_profile:
            user_data['staff_id'] = user.staff_profile.id
            user_data['department_id'] = user.staff_profile.department_id
            user_data['department_name'] = user.staff_profile.department.department_name if user.staff_profile.department else None

        return jsonify({
            'message': 'Profile updated successfully!',
            'user': user_data
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to update profile: {str(e)}'}), 500
