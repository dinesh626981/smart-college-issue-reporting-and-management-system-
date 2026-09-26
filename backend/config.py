import os
from datetime import timedelta

class Config:
    # Secret Key for JWT and Flask Sessions
    SECRET_KEY = os.environ.get('SECRET_KEY', 'smart-college-super-secret-key-12345')

    # Admin Registration Key
    ADMIN_REGISTRATION_KEY = os.environ.get('ADMIN_REGISTRATION_KEY', 'admin123')

    # JWT configuration
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1)
    
    # Database Configuration (Defaults to SQLite for local development if MySQL is not setup)
    # For MySQL, use: mysql+pymysql://username:password@host:port/database
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL', 
        'sqlite:///' + os.path.join(os.path.abspath(os.path.dirname(__file__)), 'college_system.db')
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # LLM Provider Configuration
    LLM_PROVIDER = os.environ.get('LLM_PROVIDER', 'gemini')
    LLM_API_KEY = os.environ.get('LLM_API_KEY', '')

    # Image Upload Folders
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5MB Max image size

    # Flask Mail Config
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'True').lower() in ['true', 'on', '1']
    MAIL_USE_SSL = os.environ.get('MAIL_USE_SSL', 'False').lower() in ['true', 'on', '1']
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME', None)
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD', None)
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER', 'noreply@smartcollegesystem.com')
