"""
Execute Action Node
Routes to appropriate tool based on extracted intent
"""
from agents.state import MoviState
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


def execute_action_node(state: MoviState) -> MoviState:
    """
    Executes the appropriate tool based on action_type and target_entity.
    
    For Phase 1-2: Only implements Bus Dashboard tools
    Later: Will add Routes and Stops/Paths tools
    """
    
    action_type = state.get("action_type")
    target_entity = state.get("target_entity")
    parameters = state.get("parameters", {})
    
    if not action_type or not target_entity:
        return {
            **state,
            "error": "Cannot execute: missing action_type or target_entity"
        }
    
    try:
        result = None
        
        # Bus Dashboard tools
        if target_entity == "vehicle" and action_type == "read":
            # Check if asking for unassigned vehicles
            if "unassigned" in state.get("user_intent", "").lower() or "not assigned" in state.get("user_intent", "").lower():
                result = get_unassigned_vehicles.invoke({})
        
        elif target_entity == "trip" and action_type == "read":
            trip_id = parameters.get("trip_name") or parameters.get("trip_id") or parameters.get("identifier")
            if trip_id:
                result = get_trip_status.invoke({"trip_identifier": trip_id})
            else:
                result = {"error": "Trip identifier not provided"}
        
        elif target_entity == "deployment" and action_type == "create":
            trip_id = parameters.get("trip_name") or parameters.get("trip_id") or parameters.get("trip")
            vehicle_id = parameters.get("vehicle_name") or parameters.get("vehicle_id") or parameters.get("vehicle")
            driver_id = parameters.get("driver_name") or parameters.get("driver_id") or parameters.get("driver")
            
            if trip_id and vehicle_id and driver_id:
                result = assign_vehicle_to_trip.invoke({
                    "trip_identifier": trip_id,
                    "vehicle_identifier": vehicle_id,
                    "driver_identifier": driver_id
                })
            else:
                result = {"error": "Missing required parameters: trip, vehicle, or driver"}
        
        elif target_entity == "deployment" and action_type == "delete":
            trip_id = parameters.get("trip_name") or parameters.get("trip_id") or parameters.get("trip")
            if trip_id:
                result = remove_vehicle_from_trip.invoke({"trip_identifier": trip_id})
            else:
                result = {"error": "Trip identifier not provided"}
        
        # Routes tools
        elif target_entity == "route" and action_type == "read":
            route_id = parameters.get("route_name") or parameters.get("route_id") or parameters.get("identifier")
            if route_id:
                result = get_route_details.invoke({"route_identifier": route_id})
            else:
                result = get_all_routes.invoke({})
        
        elif target_entity == "route" and action_type == "update":
            route_id = parameters.get("route_name") or parameters.get("route_id") or parameters.get("identifier")
            status = parameters.get("status")
            if route_id and status:
                result = update_route_status.invoke({"route_identifier": route_id, "new_status": status})
            else:
                result = {"error": "Missing route identifier or status"}
        
        # Stops & Paths tools
        elif target_entity == "stop" and action_type == "read":
            stop_id = parameters.get("stop_name") or parameters.get("stop_id") or parameters.get("identifier")
            search_query = parameters.get("search") or parameters.get("query")
            
            if search_query:
                result = search_stops_by_location.invoke({"query": search_query})
            elif stop_id:
                result = get_stop_details.invoke({"stop_identifier": stop_id})
            else:
                result = get_all_stops.invoke({})
        
        elif target_entity == "path" and action_type == "read":
            path_id = parameters.get("path_name") or parameters.get("path_id") or parameters.get("identifier")
            if path_id:
                result = get_path_details.invoke({"path_identifier": path_id})
            else:
                result = get_all_paths.invoke({})
        
        else:
            result = {
                "error": f"Action '{action_type}' on '{target_entity}' is not supported"
            }
        
        return {
            **state,
            "tool_result": result
        }
        
    except Exception as e:
        return {
            **state,
            "error": f"Tool execution failed: {str(e)}"
        }
