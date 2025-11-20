from flask import request, current_app
import os
import uuid
from werkzeug.utils import secure_filename

def get_client_ip():
    """Get client IP address from request"""
    if request.environ.get('HTTP_X_FORWARDED_FOR'):
        return request.environ['HTTP_X_FORWARDED_FOR'].split(',')[0]
    return request.environ.get('REMOTE_ADDR', 'Unknown')

def allowed_file(filename):
    """Check if file has allowed extension"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

def generate_unique_filename(filename):
    """Generate unique filename while preserving extension"""
    filename = secure_filename(filename)
    name, ext = os.path.splitext(filename)
    unique_name = f"{name}_{uuid.uuid4().hex}{ext}"
    return unique_name
