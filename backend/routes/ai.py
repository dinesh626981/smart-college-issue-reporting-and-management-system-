from flask import Blueprint, request, jsonify
from backend.services.llm_service import LLMService
from backend.middleware.auth_middleware import token_required
from backend.models.complaint import Complaint

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/chat', methods=['POST'])
@token_required()
def chat():
    data = request.get_json() or {}
    messages = data.get('messages', [])
    context = data.get('context', None)
    
    if not messages:
        return jsonify({'message': 'Messages array is required!'}), 400
        
    # Inject personalized student context if the user is a student
    from flask import g
    user = getattr(g, 'current_user', None)
    if user and user.role == 'student':
        recent_complaints = Complaint.query.filter_by(student_id=user.id).order_by(Complaint.created_at.desc()).limit(5).all()
        if recent_complaints:
            student_context = "Student's Recent Complaints:\n"
            for c in recent_complaints:
                assigned = f"Assigned to Staff ID: {c.assigned_staff}" if c.assigned_staff else "Not assigned yet"
                student_context += f"- ID: {c.id}, Title: '{c.title}', Category: {c.category}, Status: {c.status}, Assigned: {assigned}\n"
            
            # Combine frontend context with backend injected context
            context = f"{context}\n\n{student_context}" if context else student_context
            
    result = LLMService.chat(messages, context)
    
    if isinstance(result, dict) and not result.get('success'):
        return jsonify({'message': result.get('error', 'AI service error')}), 500
    elif isinstance(result, dict) and result.get('success'):
        return jsonify({'response': result.get('response')}), 200
    elif isinstance(result, str):
        # Fallback if it returns the "missing API key" string
        if "Missing API Key" in result:
            return jsonify({'message': 'AI assistant is not configured.'}), 503
        return jsonify({'response': result}), 200
        
    return jsonify({'message': 'Unknown AI error.'}), 500

@ai_bp.route('/analyze-issue', methods=['POST'])
@token_required()
def analyze_issue():
    data = request.get_json() or {}
    description = data.get('description')
    
    if not description or not description.strip():
        return jsonify({'message': 'Description is required!'}), 400
        
    analysis = LLMService.analyze_issue(description)
    if analysis:
        return jsonify(analysis), 200
    else:
        return jsonify({'message': 'Failed to analyze issue. AI unavailable.'}), 503

@ai_bp.route('/predict-category', methods=['POST'])
@token_required()
def predict_category():
    # Backward compatibility with existing ML system
    data = request.get_json() or {}
    text = data.get('text')
    
    if not text or not text.strip():
        return jsonify({'message': 'Text parameter is required!'}), 400
        
    try:
        from backend.services.prediction_service import PredictionService
        predicted = PredictionService.predict_category(text)
    except:
        # Fallback to LLM if ML is missing
        analysis = LLMService.analyze_issue(text)
        predicted = analysis.get('category') if analysis else 'Other'
        
    return jsonify({
        'category': predicted
    }), 200

@ai_bp.route('/check-duplicate', methods=['POST'])
@token_required()
def check_duplicate():
    data = request.get_json() or {}
    description = data.get('description')
    
    if not description:
        return jsonify({'message': 'Description is required!'}), 400
        
    # Get unresolved existing issues to compare against
    existing = Complaint.query.filter(Complaint.status.notin_(['Closed', 'Resolved'])).limit(20).all()
    
    result = LLMService.check_duplicate(description, existing)
    
    if result and result.get('is_duplicate'):
        # Get existing title and status
        dup_id = result.get('duplicate_of')
        if dup_id:
            dup_comp = Complaint.query.get(dup_id)
            if dup_comp:
                return jsonify({
                    'is_duplicate': True,
                    'existing_id': dup_comp.id,
                    'existing_title': dup_comp.title,
                    'existing_status': dup_comp.status,
                    'reason': result.get('reason')
                }), 200
                
    return jsonify({'is_duplicate': False}), 200

@ai_bp.route('/report-quality', methods=['POST'])
@token_required()
def report_quality():
    data = request.get_json() or {}
    description = data.get('description')
    
    if not description:
        return jsonify({'message': 'Description is required!'}), 400
        
    result = LLMService.analyze_report_quality(description)
    return jsonify(result), 200

@ai_bp.route('/issues/<int:issue_id>/ai-summary', methods=['GET'])
@token_required(allowed_roles=['admin', 'staff'])
def ai_summary(issue_id):
    from flask import g
    user = g.current_user
    complaint = Complaint.query.get_or_404(issue_id)
    
    if user.role == 'staff' and complaint.assigned_staff != user.staff_profile.id:
        return jsonify({'message': 'Access denied to this complaint!'}), 403
        
    summary = LLMService.summarize_issue(complaint.description, complaint.category, complaint.priority)
    
    if summary:
        return jsonify(summary), 200
    return jsonify({'message': 'Failed to generate AI summary.'}), 503

@ai_bp.route('/issues/<int:issue_id>/resolution-suggestions', methods=['POST'])
@token_required(allowed_roles=['admin', 'staff'])
def resolution_suggestions(issue_id):
    from flask import g
    user = g.current_user
    complaint = Complaint.query.get_or_404(issue_id)
    
    if user.role == 'staff' and complaint.assigned_staff != user.staff_profile.id:
        return jsonify({'message': 'Access denied to this complaint!'}), 403
        
    suggestions = LLMService.get_resolution_suggestions(complaint.description, complaint.category)
    
    if suggestions:
        return jsonify(suggestions), 200
    return jsonify({'message': 'Failed to generate resolution suggestions.'}), 503

@ai_bp.route('/issues/<int:issue_id>/status-explanation', methods=['POST'])
@token_required(allowed_roles=['student'])
def status_explanation(issue_id):
    complaint = Complaint.query.get_or_404(issue_id)
    
    from flask import g
    if complaint.student_id != g.current_user.id:
        return jsonify({'message': 'Access denied'}), 403
        
    issue_details = f"ID: {complaint.id}, Title: {complaint.title}, Category: {complaint.category}, Priority: {complaint.priority}, Remarks: {complaint.resolution_remarks}"
    explanation = LLMService.explain_status(issue_details, complaint.status)
    
    return jsonify({'explanation': explanation}), 200
