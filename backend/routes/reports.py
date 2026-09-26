import io
import csv
from flask import Blueprint, jsonify, request, Response
from sqlalchemy import func
from backend.models import db
from backend.models.complaint import Complaint
from backend.models.department import Department
from backend.models.feedback import Feedback
from backend.models.staff import Staff
from backend.models.user import User
from backend.middleware.auth_middleware import token_required

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/reports', methods=['GET'])
@token_required(allowed_roles=['admin'])
def get_reports():
    # Export CSV check
    export_format = request.args.get('format')
    if export_format == 'csv':
        return generate_csv_report()

    # General Reports Statistics JSON Response
    
    # 1. Total Complaints count by Status
    status_counts = db.session.query(
        Complaint.status, func.count(Complaint.id)
    ).group_by(Complaint.status).all()
    
    status_dict = {
        'Pending': 0,
        'Assigned': 0,
        'In Progress': 0,
        'Resolved': 0,
        'Closed': 0
    }
    for status, count in status_counts:
        status_dict[status] = count

    # 2. Complaints count by Category
    category_counts = db.session.query(
        Complaint.category, func.count(Complaint.id)
    ).group_by(Complaint.category).all()
    category_dict = {}
    for cat, count in category_counts:
        category_dict[cat] = count

    # 3. Complaints count by Department
    dept_counts = db.session.query(
        Department.department_name, func.count(Complaint.id)
    ).join(Complaint, Department.id == Complaint.department_id, isouter=True)\
     .group_by(Department.department_name).all()
    dept_dict = {}
    for dept_name, count in dept_counts:
        dept_dict[dept_name] = count

    # 4. Monthly Complaints distribution (for last 6 months or general)
    # Using strftime or extract to group by month
    monthly_counts = db.session.query(
        func.strftime('%Y-%m', Complaint.created_at).label('month'),
        func.count(Complaint.id)
    ).group_by('month').order_by('month').limit(12).all()
    
    monthly_dict = {}
    for month, count in monthly_counts:
        monthly_dict[month] = count

    # 5. Average feedback rating in total
    avg_rating_query = db.session.query(func.avg(Feedback.rating)).first()
    average_rating = round(float(avg_rating_query[0]), 2) if avg_rating_query[0] is not None else 0.0

    # 6. Average feedback rating by Department
    dept_ratings = db.session.query(
        Department.department_name,
        func.avg(Feedback.rating).label('avg_rating')
    ).join(Complaint, Department.id == Complaint.department_id)\
     .join(Feedback, Complaint.id == Feedback.complaint_id)\
     .group_by(Department.department_name).all()
     
    dept_ratings_dict = {}
    for dept_name, val in dept_ratings:
        dept_ratings_dict[dept_name] = round(float(val), 2) if val is not None else 0.0

    return jsonify({
        'status_summary': status_dict,
        'category_summary': category_dict,
        'department_summary': dept_dict,
        'monthly_summary': monthly_dict,
        'average_rating': average_rating,
        'department_ratings': dept_ratings_dict
    }), 200

def generate_csv_report():
    # Fetch all complaints in database with related details
    complaints = Complaint.query.order_by(Complaint.created_at.desc()).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Headers
    writer.writerow([
        'Complaint ID', 'Title', 'Description', 'Category', 'Location', 
        'Priority', 'Status', 'Raised By (Student)', 'Student Email', 
        'Department Assigned', 'Staff Assigned', 'Resolution Remarks', 
        'Created At', 'Updated At'
    ])
    
    for c in complaints:
        student_name = c.student.name if c.student else 'N/A'
        student_email = c.student.email if c.student else 'N/A'
        dept_name = c.department.department_name if c.department else 'Unassigned'
        staff_name = c.assigned_staff_rel.user.name if (c.assigned_staff_rel and c.assigned_staff_rel.user) else 'Unassigned'
        
        writer.writerow([
            c.id,
            c.title,
            c.description,
            c.category,
            c.location,
            c.priority,
            c.status,
            student_name,
            student_email,
            dept_name,
            staff_name,
            c.resolution_remarks or '',
            c.created_at.strftime('%Y-%m-%d %H:%M:%S') if c.created_at else '',
            c.updated_at.strftime('%Y-%m-%d %H:%M:%S') if c.updated_at else ''
        ])
        
    response = Response(output.getvalue(), mimetype='text/csv')
    response.headers['Content-Disposition'] = 'attachment; filename=complaints_report.csv'
    return response
