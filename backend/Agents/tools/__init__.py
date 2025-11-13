"""
Tools package for Movi AI Assistant
"""
from agents.tools.bus_dashboard_tools import (
    get_unassigned_vehicles,
    get_trip_status,
    assign_vehicle_to_trip,
    remove_vehicle_from_trip
)
from agents.tools.routes_tools import (
    get_all_routes,
    get_route_details,
    update_route_status
)
from agents.tools.stops_paths_tools import (
    get_all_stops,
    get_stop_details,
    get_all_paths,
    get_path_details,
    search_stops_by_location
)

__all__ = [
    # Bus Dashboard
    "get_unassigned_vehicles",
    "get_trip_status",
    "assign_vehicle_to_trip",
    "remove_vehicle_from_trip",
    # Routes
    "get_all_routes",
    "get_route_details",
    "update_route_status",
    # Stops & Paths
    "get_all_stops",
    "get_stop_details",
    "get_all_paths",
    "get_path_details",
    "search_stops_by_location"
]
