import jwt
from flask import request, jsonify, current_app, g
from functools import wraps
from backend.models.user import User

def token_required(allowed_roles=None):
    """
    Decorator to protect routes with JWT.
    allowed_roles: list of roles permitted to access this route (e.g. ['student', 'admin', 'staff'])
    """
    if allowed_roles is None:
        allowed_roles = []

    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = None
            
            # Check Authorization header
            if 'Authorization' in request.headers:
                auth_header = request.headers['Authorization']
                # Header format should be 'Bearer <token>'
                if auth_header.startswith('Bearer '):
                    token = auth_header.split(" ")[1]
            
            if not token:
                return jsonify({'message': 'Access token is missing!'}), 401
            
            try:
                # Decode token
                data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
                current_user = User.query.filter_by(id=data['user_id']).first()
                
                if not current_user:
                    return jsonify({'message': 'User not found!'}), 401
                
                # Check roles if specified
                if allowed_roles and current_user.role not in allowed_roles:
                    return jsonify({'message': 'Unauthorized role access!'}), 403
                
                # Store user object in Flask globals for the request duration
                g.current_user = current_user
                
            except jwt.ExpiredSignatureError:
                return jsonify({'message': 'Token has expired! Please log in again.'}), 401
            except jwt.InvalidTokenError:
                return jsonify({'message': 'Invalid token! Please log in again.'}), 401
            
            return f(*args, **kwargs)
        return decorated
    return decorator
