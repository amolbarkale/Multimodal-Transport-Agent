"""
Routes Management Tools
Tools for reading and managing routes
"""
from typing import Dict, Any
from database import get_db
from backend.database.models import Route, Path, RouteStatus
from langchain_core.tools import tool


@tool
def get_all_routes() -> Dict[str, Any]:
    """
    Get all routes with their details.
    
    Returns:
        Dictionary with count and list of routes
    """
    db = next(get_db())
    try:
        routes = db.query(Route).all()
        
        return {
            "count": len(routes),
            "routes": [
                {
                    "route_id": r.route_id,
                    "display_name": r.route_display_name,
                    "direction": r.direction,
                    "start_point": r.start_point,
                    "end_point": r.end_point,
                    "shift_time": str(r.shift_time),
                    "status": r.status.value,
                    "capacity": r.capacity,
                    "allocated_waitlist": r.allocated_waitlist,
                    "path_id": r.path_id
                }
                for r in routes
            ]
        }
    finally:
        db.close()


@tool
def get_route_details(route_identifier: str) -> Dict[str, Any]:
    """
    Get detailed information about a specific route including its path.
    
    Args:
        route_identifier: Route ID or display name
    
    Returns:
        Dictionary with route details and path information
    """
    db = next(get_db())
    try:
        # Find route by ID or name
        route = None
        if route_identifier.isdigit():
            route = db.query(Route).filter(Route.route_id == int(route_identifier)).first()
        
        if not route:
            route = db.query(Route).filter(Route.route_display_name.ilike(f"%{route_identifier}%")).first()
        
        if not route:
            return {"error": f"Route '{route_identifier}' not found"}
        
        # Get path details
        path = db.query(Path).filter(Path.path_id == route.path_id).first()
        
        return {
            "route_id": route.route_id,
            "display_name": route.route_display_name,
            "direction": route.direction,
            "start_point": route.start_point,
            "end_point": route.end_point,
            "shift_time": str(route.shift_time),
            "status": route.status.value,
            "capacity": route.capacity,
            "allocated_waitlist": route.allocated_waitlist,
            "path": {
                "path_id": path.path_id if path else None,
                "path_name": path.path_name if path else None
            }
        }
    finally:
        db.close()


@tool
def update_route_status(route_identifier: str, new_status: str) -> Dict[str, Any]:
    """
    Activate or deactivate a route.
    
    Args:
        route_identifier: Route ID or display name
        new_status: New status - "active" or "deactivated"
    
    Returns:
        Dictionary with success message and updated route info
    """
    db = next(get_db())
    try:
        # Validate status
        if new_status not in ["active", "deactivated"]:
            return {"error": "Status must be 'active' or 'deactivated'"}
        
        # Find route
        route = None
        if route_identifier.isdigit():
            route = db.query(Route).filter(Route.route_id == int(route_identifier)).first()
        
        if not route:
            route = db.query(Route).filter(Route.route_display_name.ilike(f"%{route_identifier}%")).first()
        
        if not route:
            return {"error": f"Route '{route_identifier}' not found"}
        
        # Update status
        route.status = RouteStatus.active if new_status == "active" else RouteStatus.deactivated
        db.commit()
        
        return {
            "success": True,
            "message": f"Route '{route.route_display_name}' status updated to {new_status}",
            "route_id": route.route_id,
            "new_status": route.status.value
        }
    finally:
        db.close()
