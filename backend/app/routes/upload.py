from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from app.utils.helpers import allowed_file, generate_unique_filename
import os

upload_bp = Blueprint('upload', __name__)

@upload_bp.route('/image', methods=['POST'])
@jwt_required()
def upload_image():
    """Upload product image"""
    if 'file' not in request.files:
        return jsonify({'message': 'No file provided'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'message': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({
            'message': 'Invalid file type. Allowed types: png, jpg, jpeg, gif, webp'
        }), 400

    try:
        # Generate unique filename
        filename = generate_unique_filename(file.filename)
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)

        # Save file
        file.save(filepath)

        # Generate URL (adjust this based on your setup)
        file_url = f'/api/upload/images/{filename}'

        return jsonify({
            'message': 'File uploaded successfully',
            'url': file_url,
            'filename': filename
        }), 201

    except Exception as e:
        return jsonify({'message': 'Error uploading file', 'error': str(e)}), 500


@upload_bp.route('/images/<filename>', methods=['GET'])
def get_image(filename):
    """Serve uploaded images"""
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)


@upload_bp.route('/images/<filename>', methods=['DELETE'])
@jwt_required()
def delete_image(filename):
    """Delete uploaded image"""
    try:
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)

        if os.path.exists(filepath):
            os.remove(filepath)
            return jsonify({'message': 'File deleted successfully'}), 200
        else:
            return jsonify({'message': 'File not found'}), 404

    except Exception as e:
        return jsonify({'message': 'Error deleting file', 'error': str(e)}), 500
