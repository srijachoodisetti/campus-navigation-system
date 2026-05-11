
export interface Building {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  type: 'academic' | 'residential' | 'recreational' | 'administrative' | 'food';
  image?: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  locationId: string;
  startTime: string;
  endTime: string;
  category: 'social' | 'academic' | 'sports' | 'workshop';
}

export interface GraphNode {
  id: string;
  adj: { [key: string]: number }; // Adjacency list: neighborId -> weight (distance)
}

export interface RouteResult {
  path: string[];
  distance: number;
}

export type UserRole = 'student' | 'guest' | 'admin';

export type AppView = 'home' | 'map' | 'navigation' | 'admin' | 'assistant';
