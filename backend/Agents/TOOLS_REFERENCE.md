# Movi AI Tools - Complete List

## Bus Dashboard Tools (4 tools)

### 1. get_unassigned_vehicles
- **Purpose**: Get vehicles not assigned to any trip
- **Usage**: "How many vehicles are unassigned?", "Show me free vehicles"
- **Returns**: Count and list of vehicles with license plate, type, capacity

### 2. get_trip_status
- **Purpose**: Get details of a specific trip
- **Usage**: "What's the status of trip 101?", "Show trip Morning Route A"
- **Parameters**: trip_identifier (ID or name)
- **Returns**: Trip details, booking %, live status, deployed vehicles/drivers

### 3. assign_vehicle_to_trip
- **Purpose**: Assign a vehicle and driver to a trip
- **Usage**: "Assign vehicle DL01AB1234 to trip 101 with driver John"
- **Parameters**: trip_identifier, vehicle_identifier, driver_identifier
- **Returns**: Success message with deployment details

### 4. remove_vehicle_from_trip
- **Purpose**: Remove all deployments from a trip
- **Usage**: "Remove vehicles from trip 101"
- **Parameters**: trip_identifier
- **Returns**: Success message with count of removed deployments

---

## Routes Tools (3 tools)

### 5. get_all_routes
- **Purpose**: Get all routes in the system
- **Usage**: "Show all routes", "List routes"
- **Returns**: Count and list of routes with details (name, direction, capacity, status)

### 6. get_route_details
- **Purpose**: Get detailed info about a specific route
- **Usage**: "Tell me about route 5", "Show Route A details"
- **Parameters**: route_identifier (ID or name)
- **Returns**: Full route details including path info

### 7. update_route_status
- **Purpose**: Activate or deactivate a route
- **Usage**: "Deactivate route 5", "Activate Morning Route A"
- **Parameters**: route_identifier, new_status (active/deactivated)
- **Returns**: Success message with updated status

---

## Stops & Paths Tools (5 tools)

### 8. get_all_stops
- **Purpose**: Get all stops in the system
- **Usage**: "Show all stops", "List stops"
- **Returns**: Count and list of stops with name, lat/lon

### 9. get_stop_details
- **Purpose**: Get details of a specific stop
- **Usage**: "Tell me about stop 15", "Show Electronic City stop"
- **Parameters**: stop_identifier (ID or name)
- **Returns**: Stop details with coordinates

### 10. get_all_paths
- **Purpose**: Get all paths with their stops
- **Usage**: "Show all paths", "List paths"
- **Returns**: Count and list of paths with ordered stops

### 11. get_path_details
- **Purpose**: Get detailed info about a specific path
- **Usage**: "Show path 3", "Tell me about Path A"
- **Parameters**: path_identifier (ID or name)
- **Returns**: Path details with ordered stops and coordinates

### 12. search_stops_by_location
- **Purpose**: Search stops by name
- **Usage**: "Find stops near Electronic City", "Search for Whitefield stops"
- **Parameters**: query (search term)
- **Returns**: Matching stops with details

---

## Tool Routing Logic

The system automatically routes user requests to the right tool based on:
- **action_type**: read, create, update, delete
- **target_entity**: vehicle, driver, trip, route, stop, path, deployment
- **current_page**: busDashboard, routes, stopsPaths

### Examples:
- "How many vehicles are free?" → vehicle + read → get_unassigned_vehicles
- "Show trip 101" → trip + read → get_trip_status
- "Assign vehicle X to trip Y" → deployment + create → assign_vehicle_to_trip
- "List all routes" → route + read (no ID) → get_all_routes
- "Show route 5" → route + read (with ID) → get_route_details
- "Deactivate route X" → route + update → update_route_status
- "Show all stops" → stop + read (no ID) → get_all_stops
- "Find stops near X" → stop + read (with search) → search_stops_by_location
- "Show path 3" → path + read (with ID) → get_path_details

---

## Database Models Used

- **Vehicle**: vehicle_id, license_plate, type, capacity, status
- **Driver**: driver_id, name, phone_number
- **DailyTrip**: trip_id, route_id, display_name, booking_status_percentage, live_status
- **Deployment**: deployment_id, trip_id, vehicle_id, driver_id
- **Route**: route_id, path_id, route_display_name, shift_time, direction, status, capacity
- **Stop**: stop_id, name, latitude, longitude
- **Path**: path_id, path_name
- **PathStop**: path_id, stop_id, stop_order (junction table)

---

## Implementation Status

✅ **All 12 tools implemented**
✅ **Intent extraction updated** - Handles all entities
✅ **Execute action node updated** - Routes to all tools
✅ **Model references fixed** - Uses correct field names
✅ **Simple and focused** - Each tool does one thing well

**Ready for testing!**
