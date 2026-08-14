export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

export type CabinClass = 'Economy' | 'Premium Economy' | 'Business' | 'First Class';

export interface RealtimeTelemetry {
  flightNumber: string;
  origin: string;
  destination: string;
  status: 'SCHEDULED' | 'BOARDING' | 'IN_AIR' | 'DELAYED' | 'LANDED';
  altitudeFt: number;
  speedKnots: number;
  lat: number;
  lon: number;
  delayMinutes: number;
  heading: number;
  progressPercent: number;
  lastUpdated: string;
  dataSource?: string;
}

export interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  airlineCode: string;
  airlineColor: string;
  origin: Airport;
  destination: Airport;
  departureTime: string; // ISO String
  arrivalTime: string;   // ISO String
  durationMinutes: number;
  stops: number; // 0 = Direct, 1, 2
  stopoverAirport?: string;
  price: number;
  cabinClass: CabinClass;
  availableSeats: number;
  aircraft: string;
  terminal: string;
  gate: string;
  status: 'Scheduled' | 'On Time' | 'Boarding' | 'Delayed';
  amenities: string[];
  realtimeTelemetry?: RealtimeTelemetry;
}

export type CabType = 'Economy Sedan' | 'Executive SUV' | 'Electric Luxury' | 'Airport Shuttle' | 'Shared Van' | 'VIP Limousine';

export interface Cab {
  id: string;
  airportCode: string;
  airportName: string;
  city: string;
  type: CabType;
  vehicleModel: string;
  driverName: string;
  driverRating: number;
  driverTrips: number;
  baseFare: number;
  pricePerKm: number;
  passengerCapacity: number;
  luggageCapacity: number;
  estimatedWaitMinutes: number;
  features: string[];
  isElectric: boolean;
  isShuttle: boolean;
  status: 'Available' | 'Nearby' | 'High Demand';
}

export interface HotelRoom {
  id: string;
  name: string;
  pricePerNight: number;
  capacity: number;
  bedType: string;
  sizeSqFt: number;
  isAvailable: boolean;
}

export interface Hotel {
  id: string;
  name: string;
  airportCode: string;
  airportName: string;
  city: string;
  country: string;
  distanceKmToAirport: number; // Proximity to target airport
  starRating: number; // 3, 4, 5
  guestScore: number; // 7.0 - 9.9
  reviewCount: number;
  pricePerNight: number;
  address: string;
  tagline: string;
  amenities: string[];
  hasFreeShuttle: boolean;
  has24HourCheckin: boolean;
  hasSoundproofRooms: boolean;
  rooms: HotelRoom[];
  badge?: string;
}

export interface FlightFilter {
  originCode: string;
  destinationCode: string;
  date: string;
  cabinClass: CabinClass | 'All';
  maxPrice: number;
  stops: string; // 'all', '0', '1', '2+'
  airlines: string[];
  sortBy: 'price_asc' | 'price_desc' | 'duration_asc' | 'departure_asc';
}

export interface CabFilter {
  airportCode: string;
  type: CabType | 'All';
  passengers: number;
  maxFare: number;
  sortBy: 'price_asc' | 'rating_desc' | 'wait_asc';
}

export interface HotelFilter {
  airportCode: string;
  maxDistanceKm: number;
  minStarRating: number;
  maxPrice: number;
  freeShuttleOnly: boolean;
  sortBy: 'distance_asc' | 'price_asc' | 'rating_desc' | 'score_desc';
}

export interface PassengerInfo {
  fullName: string;
  email: string;
  phone: string;
  passportNumber?: string;
  specialRequests?: string;
}

export interface BookingItem {
  id: string;
  bookingRef: string;
  createdAt: string;
  type: 'flight' | 'cab' | 'hotel';
  flightDetails?: {
    flight: Flight;
    selectedSeat?: string;
    passengersCount: number;
  };
  cabDetails?: {
    cab: Cab;
    pickupLocation: string;
    dropoffLocation: string;
    pickupDateTime: string;
    estimatedDistanceKm: number;
  };
  hotelDetails?: {
    hotel: Hotel;
    selectedRoom: HotelRoom;
    checkInDate: string;
    checkOutDate: string;
    nights: number;
  };
  passenger: PassengerInfo;
  totalPrice: number;
  status: 'Confirmed' | 'Completed' | 'Pending';
}
