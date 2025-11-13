// Types matching backend schemas

export enum RouteStatus {
  ACTIVE = "active",
  DEACTIVATED = "deactivated"
}

export enum VehicleType {
  BUS = "bus",
  CAB = "cab"
}

// Stop types
export interface Stop {
  stop_id: number;
  name: string;
  latitude: number;
  longitude: number;
}

export interface StopCreate {
  name: string;
  latitude: number;
  longitude: number;
}

// Path types
export interface PathStop {
  stop_id: number;
  stop_order: number;
}

export interface Path {
  path_id: number;
  path_name: string;
  stops: PathStop[];
}

export interface PathCreate {
  path_name: string;
  stops: PathStop[];
}

// Route types
export interface Route {
  route_id: number;
  path_id: number;
  route_display_name: string;
  shift_time: string; // "HH:MM:SS" format
  direction: string;
  start_point: string;
  end_point: string;
  capacity: number;
  allocated_waitlist: number;
  status: RouteStatus;
}

export interface RouteCreate {
  path_id: number;
  route_display_name: string;
  shift_time: string;
  direction: string;
  start_point: string;
  end_point: string;
  capacity: number;
  allocated_waitlist?: number;
  status?: RouteStatus;
}

// Vehicle types
export interface Vehicle {
  vehicle_id: number;
  license_plate: string;
  type: VehicleType;
  capacity: number;
  status: string;
}

export interface VehicleCreate {
  license_plate: string;
  type: VehicleType;
  capacity: number;
  status?: string;
}

// Driver types
export interface Driver {
  driver_id: number;
  name: string;
  phone_number: string;
}

export interface DriverCreate {
  name: string;
  phone_number: string;
}

// Daily Trip types
export interface DailyTrip {
  trip_id: number;
  route_id: number;
  display_name: string;
  booking_status_percentage: number;
  live_status: string;
}

export interface DailyTripCreate {
  route_id: number;
  display_name: string;
  booking_status_percentage: number;
  live_status: string;
}

// Deployment types
export interface Deployment {
  deployment_id: number;
  trip_id: number;
  vehicle_id: number;
  driver_id: number;
}

export interface DeploymentCreate {
  trip_id: number;
  vehicle_id: number;
  driver_id: number;
}
