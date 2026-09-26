import os
from flask import Blueprint, request, jsonify, g, current_app
from werkzeug.utils import secure_filename
from backend.models import db
from backend.models.complaint import Complaint
from backend.models.staff import Staff
from backend.models.user import User
from backend.models.department import Department
from backend.middleware.auth_middleware import token_required
from backend.utils.helpers import is_allowed_file
from backend.models.ai_analysis import AIAnalysis
from backend.models.notification import Notification
from backend.services.llm_service import LLMService
from backend.services.email_service import send_complaint_status_email, send_admin_work_completed_email

complaints_bp = Blueprint('complaints', __name__)

@complaints_bp.route('/complaints', methods=['POST'])
@token_required(allowed_roles=['student'])
def create_complaint():
    # Handle multipart/form-data for file upload
    title = request.form.get('title')
    description = request.form.get('description')
    category = request.form.get('category')
    location = request.form.get('location')
    priority = request.form.get('priority', 'Medium')
    
    if not title or not description or not category or not location:
        return jsonify({'message': 'Missing title, description, category, or location!'}), 400

    image_filename = None
    if 'image' in request.files:
        file = request.files['image']
        if file and file.filename != '':
            # Validate size (content_length header or direct checking)
            # If server has content length limit, flask raises 413. We check file content size as backup.
            file.seek(0, os.SEEK_END)
            file_size = file.tell()
            file.seek(0)
            
            if file_size > current_app.config['MAX_CONTENT_LENGTH']:
                return jsonify({'message': 'Image exceeds maximum size of 5MB!'}), 400
                
            if is_allowed_file(file.filename):
                filename = secure_filename(file.filename)
                import uuid
                # Make filename unique
                name, ext = os.path.splitext(filename)
                unique_filename = f"{uuid.uuid4().hex}{ext}"
                
                # Ensure upload path exists
                os.makedirs(current_app.config['UPLOAD_FOLDER'], exist_ok=True)
                
                file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename))
                image_filename = unique_filename
            else:
                return jsonify({'message': 'Only JPG, JPEG and PNG images are allowed!'}), 400

    # Create complaint
    complaint = Complaint(
        title=title,
        description=description,
        category=category,
        location=location,
        priority=priority,
        status='Pending',
        image=image_filename,
        student_id=g.current_user.id
    )

    try:
        db.session.add(complaint)
        db.session.commit()
        
        # Perform AI Analysis (Run synchronously for now)
        try:
            analysis_data = LLMService.analyze_issue(description)
            quality_data = LLMService.analyze_report_quality(description)
            
            if analysis_data or quality_data:
                analysis_data = analysis_data or {}
                quality_data = quality_data or {}
                
                ai_analysis = AIAnalysis(
                    complaint_id=complaint.id,
                    category=analysis_data.get('category'),
                    subcategory=analysis_data.get('subcategory'),
                    summary=analysis_data.get('summary'),
                    severity=analysis_data.get('severity'),
                    urgency=analysis_data.get('urgency'),
                    suggested_department=analysis_data.get('suggested_department'),
                    keywords=','.join(analysis_data.get('keywords', [])) if isinstance(analysis_data.get('keywords'), list) else analysis_data.get('keywords'),
                    missing_information=','.join(analysis_data.get('missing_information', [])) if isinstance(analysis_data.get('missing_information'), list) else analysis_data.get('missing_information'),
                    recommended_action=analysis_data.get('recommended_action'),
                    confidence=float(analysis_data.get('confidence', 0.0)) if analysis_data.get('confidence') is not None else None,
                    report_quality_status=quality_data.get('status', 'Valid'),
                    report_quality_reason=quality_data.get('reason', '')
                )
                db.session.add(ai_analysis)
                db.session.commit()
        except Exception as ai_e:
            print(f"Failed to perform AI analysis: {str(ai_e)}")
            # Do not fail the complaint creation if AI fails
            try:
                ai_analysis_fallback = AIAnalysis(
                    complaint_id=complaint.id,
                    report_quality_status='UNAVAILABLE',
                    report_quality_reason='AI Service Unavailable or failed during processing.',
                    category='Other'
                )
                db.session.add(ai_analysis_fallback)
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                print(f"Failed to save AI fallback record: {str(e)}")
        
        return jsonify({
            'message': 'Complaint registered successfully!',
            'complaint': complaint.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to create complaint: {str(e)}'}), 500

@complaints_bp.route('/complaints', methods=['GET'])
@token_required()
def get_complaints():
    user = g.current_user
    
    # Base query
    query = Complaint.query
    
    # Role-based scoping
    if user.role == 'student':
        query = query.filter_by(student_id=user.id)
    elif user.role == 'staff':
        # Staff see complaints assigned to them
        if user.staff_profile:
            query = query.filter_by(assigned_staff=user.staff_profile.id)
        else:
            return jsonify({'message': 'Staff profile not configured!'}), 400

    # Filters
    status_filter = request.args.get('status')
    category_filter = request.args.get('category')
    dept_filter = request.args.get('department_id')
    priority_filter = request.args.get('priority')
    
    if status_filter:
        query = query.filter(Complaint.status == status_filter)
    if category_filter:
        query = query.filter(Complaint.category == category_filter)
    if dept_filter:
        query = query.filter(Complaint.department_id == int(dept_filter))
    if priority_filter:
        query = query.filter(Complaint.priority == priority_filter)

    # Search (by ID, Title, Category, Student Name, Status)
    search_query = request.args.get('search')
    if search_query:
        search_pattern = f"%{search_query}%"
        # Join User table to search student name if required
        query = query.join(User, Complaint.student_id == User.id)
        
        # Build search criteria
        conditions = [
            Complaint.title.like(search_pattern),
            Complaint.category.like(search_pattern),
            Complaint.location.like(search_pattern),
            Complaint.status.like(search_pattern),
            User.name.like(search_pattern)
        ]
        
        # Check if search term is numeric to query Complaint ID
        if search_query.isdigit():
            conditions.append(Complaint.id == int(search_query))
            
        query = query.filter(db.or_(*conditions))

    # Order by newest first
    complaints = query.order_by(Complaint.created_at.desc()).all()
    return jsonify([c.to_dict() for c in complaints]), 200

@complaints_bp.route('/complaints/<int:complaint_id>', methods=['GET'])
@token_required()
def get_complaint_details(complaint_id):
    user = g.current_user
    complaint = Complaint.query.get_or_404(complaint_id)
    
    # Enforce security boundaries
    if user.role == 'student' and complaint.student_id != user.id:
        return jsonify({'message': 'Access denied to this complaint!'}), 403
    elif user.role == 'staff' and complaint.assigned_staff != user.staff_profile.id:
        return jsonify({'message': 'Access denied to this complaint!'}), 403

    return jsonify(complaint.to_dict()), 200

@complaints_bp.route('/complaints/<int:complaint_id>', methods=['PUT'])
@token_required(allowed_roles=['admin', 'staff', 'student'])
def update_complaint(complaint_id):
    user = g.current_user
    complaint = Complaint.query.get_or_404(complaint_id)

    # Student updates (e.g. Closing a resolved complaint)
    if user.role == 'student':
        if complaint.student_id != user.id:
            return jsonify({'message': 'Access denied!'}), 403
            
        data = request.get_json() or {}
        new_status = data.get('status')
        if new_status == 'Closed':
            if complaint.status != 'Resolved':
                return jsonify({'message': 'Can only close resolved complaints!'}), 400
            complaint.status = 'Closed'
            db.session.commit()
            return jsonify({'message': 'Complaint closed successfully!', 'complaint': complaint.to_dict()}), 200
        else:
            return jsonify({'message': 'Students can only update status to Closed.'}), 400

    # Admin updates (Assign department, staff, priority, general status overrides)
    elif user.role == 'admin':
        # Check if form data (with image) or json data
        if request.content_type and 'multipart/form-data' in request.content_type:
            department_id = request.form.get('department_id')
            assigned_staff = request.form.get('assigned_staff')
            status = request.form.get('status')
            priority = request.form.get('priority')
            category = request.form.get('category')
            resolution_remarks = request.form.get('resolution_remarks')
        else:
            data = request.get_json() or {}
            department_id = data.get('department_id')
            assigned_staff = data.get('assigned_staff')
            status = data.get('status')
            priority = data.get('priority')
            category = data.get('category')
            resolution_remarks = data.get('resolution_remarks')

        old_status = complaint.status

        if department_id is not None:
            complaint.department_id = int(department_id) if department_id != '' and department_id != 'null' else None
        if assigned_staff is not None:
            # assigned_staff represents staff.id
            complaint.assigned_staff = int(assigned_staff) if assigned_staff != '' and assigned_staff != 'null' else None
            # If staff is assigned, auto transition status to 'Assigned' if it was 'Pending'
            if complaint.assigned_staff and complaint.status == 'Pending':
                complaint.status = 'Assigned'
                
        if status:
            complaint.status = status
        if priority:
            complaint.priority = priority
        if category:
            complaint.category = category
        if resolution_remarks:
            complaint.resolution_remarks = resolution_remarks

        try:
            db.session.commit()
            
            # Send email update to student if status changed
            if old_status != complaint.status and complaint.student:
                send_complaint_status_email(
                    complaint.student.email, 
                    complaint.title, 
                    complaint.status, 
                    complaint.resolution_remarks
                )
                
            return jsonify({'message': 'Complaint updated successfully!', 'complaint': complaint.to_dict()}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': f'Failed to update complaint: {str(e)}'}), 500

    # Staff updates (Can change status to 'In Progress' or 'Resolved', add remarks, upload completion image)
    elif user.role == 'staff':
        if complaint.assigned_staff != user.staff_profile.id:
            return jsonify({'message': 'Access denied! This complaint is not assigned to you.'}), 403
            
        status = request.form.get('status')
        resolution_remarks = request.form.get('resolution_remarks')
        
        if not status or status not in ['In Progress', 'Resolved']:
            return jsonify({'message': 'Staff can only set status to In Progress or Resolved.'}), 400

        # Optional completion image when marking resolved
        completion_image_filename = None
        if status == 'Resolved':
            if 'completion_image' in request.files:
                file = request.files['completion_image']
                if file and file.filename != '':
                    file.seek(0, os.SEEK_END)
                    file_size = file.tell()
                    file.seek(0)
                    
                    if file_size > current_app.config['MAX_CONTENT_LENGTH']:
                        return jsonify({'message': 'Completion image exceeds maximum size of 5MB!'}), 400
                        
                    if is_allowed_file(file.filename):
                        import uuid
                        filename = secure_filename(file.filename)
                        name, ext = os.path.splitext(filename)
                        unique_filename = f"resolved_{uuid.uuid4().hex}{ext}"
                        
                        os.makedirs(current_app.config['UPLOAD_FOLDER'], exist_ok=True)
                        file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename))
                        completion_image_filename = unique_filename
                    else:
                        return jsonify({'message': 'Only JPG, JPEG and PNG images are allowed for resolved proof!'}), 400

        complaint.status = status
        if resolution_remarks:
            complaint.resolution_remarks = resolution_remarks
        if completion_image_filename:
            complaint.completion_image = completion_image_filename

        # If work completed (status is Resolved), directly notify Administrator(s)
        if status == 'Resolved':
            staff_name = user.name
            dept_name = (
                user.staff_profile.department.department_name 
                if (user.staff_profile and user.staff_profile.department) 
                else "Department Staff"
            )
            
            # 1. Create in-app system notification for Admin
            admin_notice = Notification(
                target_role='admin',
                title=f"Work Completed: Task #{complaint.id}",
                message=f"Staff member {staff_name} ({dept_name}) has completed work and resolved complaint #{complaint.id}: '{complaint.title}'. Remarks: {resolution_remarks or 'Work successfully completed.'}",
                complaint_id=complaint.id,
                is_read=False
            )
            db.session.add(admin_notice)

        try:
            db.session.commit()
            
            # Email update to student
            if complaint.student:
                send_complaint_status_email(
                    complaint.student.email, 
                    complaint.title, 
                    complaint.status, 
                    complaint.resolution_remarks
                )

            # Direct email notification to all Administrators when work completed
            if status == 'Resolved':
                staff_name = user.name
                dept_name = (
                    user.staff_profile.department.department_name 
                    if (user.staff_profile and user.staff_profile.department) 
                    else "Department Staff"
                )
                admin_users = User.query.filter_by(role='admin').all()
                for admin in admin_users:
                    if admin.email:
                        send_admin_work_completed_email(
                            admin.email,
                            staff_name,
                            dept_name,
                            complaint.id,
                            complaint.title,
                            complaint.resolution_remarks
                        )
                
            return jsonify({
                'message': 'Work completed and complaint updated successfully! Admin has been notified.', 
                'complaint': complaint.to_dict()
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': f'Failed to update complaint: {str(e)}'}), 500

@complaints_bp.route('/complaints/<int:complaint_id>', methods=['DELETE'])
@token_required(allowed_roles=['admin'])
def delete_complaint(complaint_id):
    complaint = Complaint.query.get_or_404(complaint_id)
    
    # Remove files if they exist
    if complaint.image:
        try:
            os.remove(os.path.join(current_app.config['UPLOAD_FOLDER'], complaint.image))
        except OSError:
            pass
    if complaint.completion_image:
        try:
            os.remove(os.path.join(current_app.config['UPLOAD_FOLDER'], complaint.completion_image))
        except OSError:
            pass

    try:
        db.session.delete(complaint)
        db.session.commit()
        return jsonify({'message': 'Complaint deleted successfully!'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to delete complaint: {str(e)}'}), 500
