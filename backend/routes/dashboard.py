from flask import Blueprint, jsonify, g, request
from sqlalchemy import func
from backend.models import db
from backend.models.complaint import Complaint
from backend.models.user import User
from backend.models.staff import Staff
from backend.models.department import Department
from backend.models.notification import Notification
from backend.middleware.auth_middleware import token_required

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/dashboard', methods=['GET'])
@token_required()
def get_dashboard_data():
    user = g.current_user
    
    if user.role == 'student':
        # --- STUDENT DASHBOARD ---
        total = Complaint.query.filter_by(student_id=user.id).count()
        pending = Complaint.query.filter_by(student_id=user.id).filter(Complaint.status.in_(['Pending', 'Assigned', 'In Progress'])).count()
        resolved = Complaint.query.filter_by(student_id=user.id, status='Resolved').count()
        closed = Complaint.query.filter_by(student_id=user.id, status='Closed').count()
        
        # Recent complaints (last 5)
        recent_complaints = Complaint.query.filter_by(student_id=user.id)\
            .order_by(Complaint.created_at.desc()).limit(5).all()
            
        # Recent notifications
        notifications = []
        # First check persistent notifications for student
        db_notifs = Notification.query.filter(
            (Notification.user_id == user.id) | (Notification.target_role == 'student')
        ).order_by(Notification.created_at.desc()).limit(10).all()
        
        for n in db_notifs:
            notifications.append(n.to_dict())

        # Fallback to status update notifications if none stored
        if not notifications:
            updated_complaints = Complaint.query.filter_by(student_id=user.id)\
                .filter(Complaint.status != 'Pending')\
                .order_by(Complaint.updated_at.desc()).limit(5).all()
                
            for c in updated_complaints:
                notifications.append({
                    'id': c.id,
                    'title': f"Complaint Updated",
                    'message': f"Your complaint '{c.title}' is now '{c.status}'.",
                    'timestamp': c.updated_at.isoformat() if c.updated_at else None
                })
            
        # Add welcome notification if still empty
        if not notifications:
            notifications.append({
                'id': 0,
                'title': 'Welcome to Smart College System',
                'message': 'You can raise college-related issues online and track their status in real-time.',
                'timestamp': user.created_at.isoformat() if user.created_at else None
            })
            
        return jsonify({
            'role': 'student',
            'stats': {
                'total': total,
                'pending': pending,
                'resolved': resolved,
                'closed': closed
            },
            'recent_complaints': [c.to_dict() for c in recent_complaints],
            'notifications': notifications
        }), 200
        
    elif user.role == 'staff':
        # --- STAFF DASHBOARD ---
        if not user.staff_profile:
            return jsonify({'message': 'Staff profile not found!'}), 400
            
        staff_id = user.staff_profile.id
        
        assigned = Complaint.query.filter_by(assigned_staff=staff_id).count()
        completed = Complaint.query.filter_by(assigned_staff=staff_id).filter(Complaint.status.in_(['Resolved', 'Closed'])).count()
        pending = Complaint.query.filter_by(assigned_staff=staff_id).filter(Complaint.status.in_(['Pending', 'Assigned', 'In Progress'])).count()
        
        recent_assigned = Complaint.query.filter_by(assigned_staff=staff_id)\
            .order_by(Complaint.updated_at.desc()).limit(5).all()

        # Specific completed work list for staff
        completed_complaints = Complaint.query.filter_by(assigned_staff=staff_id)\
            .filter(Complaint.status.in_(['Resolved', 'Closed']))\
            .order_by(Complaint.updated_at.desc()).all()

        # Specific pending work list for staff
        pending_complaints = Complaint.query.filter_by(assigned_staff=staff_id)\
            .filter(Complaint.status.in_(['Pending', 'Assigned', 'In Progress']))\
            .order_by(Complaint.updated_at.desc()).all()

        # Staff notifications
        staff_notifs = Notification.query.filter(
            (Notification.user_id == user.id) | (Notification.target_role == 'staff')
        ).order_by(Notification.created_at.desc()).limit(10).all()
        notifications = [n.to_dict() for n in staff_notifs]

        if not notifications:
            notifications.append({
                'id': 0,
                'title': 'Staff Operations Ready',
                'message': 'Work assigned to your department will be displayed in your active queue. Mark them resolved to directly notify Admin.',
                'timestamp': user.created_at.isoformat() if user.created_at else None
            })
            
        return jsonify({
            'role': 'staff',
            'stats': {
                'assigned': assigned,
                'completed': completed,
                'pending': pending
            },
            'recent_complaints': [c.to_dict() for c in recent_assigned],
            'completed_complaints': [c.to_dict() for c in completed_complaints],
            'pending_complaints': [c.to_dict() for c in pending_complaints],
            'notifications': notifications
        }), 200
        
    elif user.role == 'admin':
        # --- ADMIN DASHBOARD ---
        total_students = User.query.filter_by(role='student').count()
        total_staff = Staff.query.count()
        total_complaints = Complaint.query.count()
        
        pending = Complaint.query.filter(Complaint.status.in_(['Pending', 'Assigned', 'In Progress'])).count()
        resolved = Complaint.query.filter_by(status='Resolved').count()
        closed = Complaint.query.filter_by(status='Closed').count()
        
        # Recent complaints (last 5)
        recent_complaints = Complaint.query.order_by(Complaint.created_at.desc()).limit(5).all()
        
        # Fetch Admin notifications (including work completed alerts from staff)
        admin_notifs = Notification.query.filter(
            (Notification.target_role == 'admin') | (Notification.user_id == user.id)
        ).order_by(Notification.created_at.desc()).limit(20).all()
        
        notifications = [n.to_dict() for n in admin_notifs]
        
        # If no DB notifications exist yet, generate from recently resolved complaints by staff
        if not notifications:
            staff_resolved = Complaint.query.filter(Complaint.assigned_staff.isnot(None))\
                .filter(Complaint.status.in_(['Resolved', 'Closed']))\
                .order_by(Complaint.updated_at.desc()).limit(5).all()
            for c in staff_resolved:
                staff_name = c.assigned_staff_rel.user.name if (c.assigned_staff_rel and c.assigned_staff_rel.user) else "Staff"
                notifications.append({
                    'id': c.id,
                    'title': f"Work Completed: Task #{c.id}",
                    'message': f"Staff member {staff_name} resolved complaint #{c.id}: '{c.title}'. Remarks: {c.resolution_remarks or 'None provided.'}",
                    'timestamp': c.updated_at.isoformat() if c.updated_at else None,
                    'is_read': True
                })

        if not notifications:
            notifications.append({
                'id': 0,
                'title': 'Administrator Command Center',
                'message': 'All system metrics and staff work completion alerts will appear here in real-time.',
                'timestamp': user.created_at.isoformat() if user.created_at else None,
                'is_read': True
            })

        unread_count = Notification.query.filter(
            ((Notification.target_role == 'admin') | (Notification.user_id == user.id)),
            Notification.is_read == False
        ).count()

        return jsonify({
            'role': 'admin',
            'stats': {
                'total_students': total_students,
                'total_staff': total_staff,
                'total_complaints': total_complaints,
                'pending': pending,
                'resolved': resolved,
                'closed': closed
            },
            'recent_complaints': [c.to_dict() for c in recent_complaints],
            'notifications': notifications,
            'unread_notifications_count': unread_count
        }), 200
        
    return jsonify({'message': 'Unknown user role!'}), 400


@dashboard_bp.route('/notifications', methods=['GET'])
@token_required()
def get_notifications():
    user = g.current_user
    notifs = Notification.query.filter(
        (Notification.user_id == user.id) | (Notification.target_role == user.role)
    ).order_by(Notification.created_at.desc()).all()
    
    # If empty and admin, populate dynamic notices
    result = [n.to_dict() for n in notifs]
    if not result and user.role == 'admin':
        staff_resolved = Complaint.query.filter(Complaint.assigned_staff.isnot(None))\
            .filter(Complaint.status.in_(['Resolved', 'Closed']))\
            .order_by(Complaint.updated_at.desc()).limit(10).all()
        for c in staff_resolved:
            staff_name = c.assigned_staff_rel.user.name if (c.assigned_staff_rel and c.assigned_staff_rel.user) else "Staff"
            result.append({
                'id': c.id,
                'title': f"Work Completed: Task #{c.id}",
                'message': f"Staff member {staff_name} resolved complaint #{c.id}: '{c.title}'. Remarks: {c.resolution_remarks or 'Completed.'}",
                'timestamp': c.updated_at.isoformat() if c.updated_at else None,
                'is_read': False
            })

    return jsonify(result), 200


@dashboard_bp.route('/notifications/<int:notification_id>/read', methods=['PUT'])
@token_required()
def mark_notification_read(notification_id):
    notif = Notification.query.get(notification_id)
    if notif:
        notif.is_read = True
        db.session.commit()
    return jsonify({'message': 'Notification marked as read'}), 200


@dashboard_bp.route('/notifications/read-all', methods=['PUT'])
@token_required()
def mark_all_notifications_read():
    user = g.current_user
    Notification.query.filter(
        (Notification.user_id == user.id) | (Notification.target_role == user.role)
    ).update({'is_read': True}, synchronize_session=False)
    db.session.commit()
    return jsonify({'message': 'All notifications marked as read'}), 200

