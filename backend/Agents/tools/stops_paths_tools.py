"""
Stops and Paths Management Tools
Tools for reading and managing stops and paths
"""
from typing import Dict, Any
from database import get_db
from models import Stop, Path, PathStop
from langchain_core.tools import tool


@tool
def get_all_stops() -> Dict[str, Any]:
    """
    Get all stops with their details.
    
    Returns:
        Dictionary with count and list of stops
    """
    db = next(get_db())
    try:
        stops = db.query(Stop).all()
        
        return {
            "count": len(stops),
            "stops": [
                {
                    "stop_id": s.stop_id,
                    "name": s.name,
                    "latitude": s.latitude,
                    "longitude": s.longitude
                }
                for s in stops
            ]
        }
    finally:
        db.close()


@tool
def get_stop_details(stop_identifier: str) -> Dict[str, Any]:
    """
    Get detailed information about a specific stop.
    
    Args:
        stop_identifier: Stop ID or name
    
    Returns:
        Dictionary with stop details
    """
    db = next(get_db())
    try:
        # Find stop by ID or name
        stop = None
        if stop_identifier.isdigit():
            stop = db.query(Stop).filter(Stop.stop_id == int(stop_identifier)).first()
        
        if not stop:
            stop = db.query(Stop).filter(Stop.name.ilike(f"%{stop_identifier}%")).first()
        
        if not stop:
            return {"error": f"Stop '{stop_identifier}' not found"}
        
        return {
            "stop_id": stop.stop_id,
            "name": stop.name,
            "latitude": stop.latitude,
            "longitude": stop.longitude
        }
    finally:
        db.close()


@tool
def get_all_paths() -> Dict[str, Any]:
    """
    Get all paths with their stops.
    
    Returns:
        Dictionary with count and list of paths
    """
    db = next(get_db())
    try:
        paths = db.query(Path).all()
        
        path_list = []
        for p in paths:
            # Get ordered stops for this path
            path_stops = db.query(PathStop).filter(PathStop.path_id == p.path_id).order_by(PathStop.stop_order).all()
            
            stops_info = []
            for ps in path_stops:
                stop = db.query(Stop).filter(Stop.stop_id == ps.stop_id).first()
                if stop:
                    stops_info.append({
                        "stop_order": ps.stop_order,
                        "stop_id": stop.stop_id,
                        "name": stop.name
                    })
            
            path_list.append({
                "path_id": p.path_id,
                "path_name": p.path_name,
                "stop_count": len(stops_info),
                "stops": stops_info
            })
        
        return {
            "count": len(path_list),
            "paths": path_list
        }
    finally:
        db.close()


@tool
def get_path_details(path_identifier: str) -> Dict[str, Any]:
    """
    Get detailed information about a specific path including all stops in order.
    
    Args:
        path_identifier: Path ID or name
    
    Returns:
        Dictionary with path details and ordered stops
    """
    db = next(get_db())
    try:
        # Find path by ID or name
        path = None
        if path_identifier.isdigit():
            path = db.query(Path).filter(Path.path_id == int(path_identifier)).first()
        
        if not path:
            path = db.query(Path).filter(Path.path_name.ilike(f"%{path_identifier}%")).first()
        
        if not path:
            return {"error": f"Path '{path_identifier}' not found"}
        
        # Get ordered stops
        path_stops = db.query(PathStop).filter(PathStop.path_id == path.path_id).order_by(PathStop.stop_order).all()
        
        stops_info = []
        for ps in path_stops:
            stop = db.query(Stop).filter(Stop.stop_id == ps.stop_id).first()
            if stop:
                stops_info.append({
                    "stop_order": ps.stop_order,
                    "stop_id": stop.stop_id,
                    "name": stop.name,
                    "latitude": stop.latitude,
                    "longitude": stop.longitude
                })
        
        return {
            "path_id": path.path_id,
            "path_name": path.path_name,
            "stop_count": len(stops_info),
            "stops": stops_info
        }
    finally:
        db.close()


@tool
def search_stops_by_location(query: str) -> Dict[str, Any]:
    """
    Search stops by name or location.
    
    Args:
        query: Search term for stop name
    
    Returns:
        Dictionary with matching stops
    """
    db = next(get_db())
    try:
        stops = db.query(Stop).filter(Stop.name.ilike(f"%{query}%")).all()
        
        return {
            "count": len(stops),
            "stops": [
                {
                    "stop_id": s.stop_id,
                    "name": s.name,
                    "latitude": s.latitude,
                    "longitude": s.longitude
                }
                for s in stops
            ]
        }
    finally:
        db.close()
