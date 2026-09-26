from flask import Blueprint, request, jsonify, g
from backend.models import db
from backend.models.feedback import Feedback
from backend.models.complaint import Complaint
from backend.middleware.auth_middleware import token_required

feedback_bp = Blueprint('feedback', __name__)

@feedback_bp.route('/feedback', methods=['POST'])
@token_required(allowed_roles=['student'])
def submit_feedback():
    data = request.get_json() or {}
    complaint_id = data.get('complaint_id')
    rating = data.get('rating')
    comment = data.get('comment')

    if not complaint_id or rating is None:
        return jsonify({'message': 'Missing complaint_id or rating!'}), 400

    try:
        rating = int(rating)
        if rating < 1 or rating > 5:
            return jsonify({'message': 'Rating must be between 1 and 5 stars!'}), 400
    except ValueError:
        return jsonify({'message': 'Rating must be a valid integer!'}), 400

    # Retrieve complaint and verify ownership
    complaint = Complaint.query.get_or_404(complaint_id)
    if complaint.student_id != g.current_user.id:
        return jsonify({'message': 'You can only give feedback for your own complaints!'}), 403

    # Verify status is Resolved or Closed
    if complaint.status not in ['Resolved', 'Closed']:
        return jsonify({'message': 'Feedback can only be submitted for resolved or closed complaints!'}), 400

    # Check if feedback already exists for this complaint
    existing_feedback = Feedback.query.filter_by(complaint_id=complaint_id).first()
    if existing_feedback:
        return jsonify({'message': 'Feedback already submitted for this complaint!'}), 409

    # Create feedback
    feedback = Feedback(
        complaint_id=complaint_id,
        rating=rating,
        comment=comment
    )

    try:
        db.session.add(feedback)
        db.session.commit()
        return jsonify({
            'message': 'Feedback submitted successfully! Thank you.',
            'feedback': feedback.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to submit feedback: {str(e)}'}), 500

@feedback_bp.route('/feedback', methods=['GET'])
@token_required(allowed_roles=['admin'])
def get_all_feedback():
    """Admin can fetch all feedback to review ratings."""
    feedbacks = Feedback.query.order_by(Feedback.created_at.desc()).all()
    
    # Calculate metrics
    total_ratings = len(feedbacks)
    avg_rating = 0.0
    if total_ratings > 0:
        avg_rating = round(sum(f.rating for f in feedbacks) / total_ratings, 2)

    return jsonify({
        'feedbacks': [f.to_dict() for f in feedbacks],
        'total_feedback_count': total_ratings,
        'average_rating': avg_rating
    }), 200
