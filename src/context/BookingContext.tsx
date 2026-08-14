import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Flight, Cab, Hotel, BookingItem,
  FlightFilter, CabFilter, HotelFilter, PassengerInfo, HotelRoom
} from '../types';
import { generateFlights, generateCabs, generateHotels } from '../services/dataGenerator';
import confetti from 'canvas-confetti';

interface BookingContextType {
  // Datasets
  allFlights: Flight[];
  allCabs: Cab[];
  allHotels: Hotel[];
  isLoadingData: boolean;

  // Active Tab & Cross-service Navigation
  activeTab: 'flights' | 'cabs' | 'hotels' | 'itinerary';
  setActiveTab: (tab: 'flights' | 'cabs' | 'hotels' | 'itinerary') => void;

  // Selection state for cross-service linking
  selectedFlight: Flight | null;
  setSelectedFlight: (flight: Flight | null) => void;
  crossBookFromFlight: (flight: Flight, target: 'cab' | 'hotel') => void;

  // Flight Filters State
  flightFilter: FlightFilter;
  setFlightFilter: React.Dispatch<React.SetStateAction<FlightFilter>>;
  resetFlightFilter: () => void;

  // Cab Filters State
  cabFilter: CabFilter;
  setCabFilter: React.Dispatch<React.SetStateAction<CabFilter>>;
  resetCabFilter: () => void;

  // Hotel Filters State
  hotelFilter: HotelFilter;
  setHotelFilter: React.Dispatch<React.SetStateAction<HotelFilter>>;
  resetHotelFilter: () => void;

  // Cart & Confirmed Bookings
  cart: BookingItem[];
  bookFlight: (flight: Flight, seat: string, passenger: PassengerInfo) => void;
  bookCab: (cab: Cab, pickupLoc: string, dropoffLoc: string, pickupTime: string, passenger: PassengerInfo) => void;
  bookHotel: (hotel: Hotel, room: HotelRoom, checkIn: string, checkOut: string, passenger: PassengerInfo) => void;
  cancelBooking: (bookingId: string) => void;
  clearAllBookings: () => void;

  // Active Modals
  seatModalFlight: Flight | null;
  setSeatModalFlight: (flight: Flight | null) => void;
  hotelDetailModal: Hotel | null;
  setHotelDetailModal: (hotel: Hotel | null) => void;
  showCheckoutModal: boolean;
  setShowCheckoutModal: (show: boolean) => void;
}

const defaultFlightFilter: FlightFilter = {
  originCode: '',
  destinationCode: '',
  date: '',
  cabinClass: 'All',
  maxPrice: 85000,
  stops: 'all',
  airlines: [],
  sortBy: 'price_asc'
};

const defaultCabFilter: CabFilter = {
  airportCode: '',
  type: 'All',
  passengers: 1,
  maxFare: 2000,
  sortBy: 'price_asc'
};

const defaultHotelFilter: HotelFilter = {
  airportCode: '',
  maxDistanceKm: 25,
  minStarRating: 3,
  maxPrice: 25000,
  freeShuttleOnly: false,
  sortBy: 'distance_asc'
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<'flights' | 'cabs' | 'hotels' | 'itinerary'>('flights');
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Massive Data Stores
  const [allFlights, setAllFlights] = useState<Flight[]>([]);
  const [allCabs, setAllCabs] = useState<Cab[]>([]);
  const [allHotels, setAllHotels] = useState<Hotel[]>([]);

  // Selected Flight for Cross-Booking Recommendations
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

  // Filters
  const [flightFilter, setFlightFilter] = useState<FlightFilter>(defaultFlightFilter);
  const [cabFilter, setCabFilter] = useState<CabFilter>(defaultCabFilter);
  const [hotelFilter, setHotelFilter] = useState<HotelFilter>(defaultHotelFilter);

  // Cart / Bookings
  const [cart, setCart] = useState<BookingItem[]>(() => {
    const saved = localStorage.getItem('skytrips_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Modals
  const [seatModalFlight, setSeatModalFlight] = useState<Flight | null>(null);
  const [hotelDetailModal, setHotelDetailModal] = useState<Hotel | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);

  // Initialize Massive Datasets on Mount & Dynamic API Fetching
  useEffect(() => {
    async function fetchFilteredFlights() {
      try {
        const params = new URLSearchParams();
        if (flightFilter.originCode) params.append('origin', flightFilter.originCode);
        if (flightFilter.destinationCode) params.append('destination', flightFilter.destinationCode);
        if (flightFilter.cabinClass && flightFilter.cabinClass !== 'All') params.append('cabinClass', flightFilter.cabinClass);
        if (flightFilter.stops && flightFilter.stops !== 'all') params.append('stops', flightFilter.stops);
        if (flightFilter.maxPrice) params.append('maxPrice', flightFilter.maxPrice.toString());
        params.append('limit', '500');

        const apiBase = window.location.port === '3000' ? 'http://127.0.0.1:5000' : '';
        const res = await fetch(`${apiBase}/api/flights?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (json.status === 'success' && Array.isArray(json.data)) {
            setAllFlights(json.data);
            if (isLoadingData) {
              const cabs = generateCabs(5200);
              const hotels = generateHotels(5200);
              setAllCabs(cabs);
              setAllHotels(hotels);
              setIsLoadingData(false);
            }
            return;
          }
        }
      } catch (err) {
        console.warn('Flask API fetch failed, using fallback generator:', err);
      }

      // Fallback local generator
      if (isLoadingData) {
        const flights = generateFlights(30500);
        const cabs = generateCabs(5200);
        const hotels = generateHotels(5200);
        setAllFlights(flights);
        setAllCabs(cabs);
        setAllHotels(hotels);
        setIsLoadingData(false);
      }
    }

    fetchFilteredFlights();
  }, [flightFilter.originCode, flightFilter.destinationCode, flightFilter.cabinClass, flightFilter.stops, flightFilter.maxPrice]);

  // Save Cart to LocalStorage
  useEffect(() => {
    localStorage.setItem('skytrips_cart', JSON.stringify(cart));
  }, [cart]);

  // Trigger celebration confetti on new booking
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // Fallback safe
    }
  };

  // Cross-Booking Helper: From Flight to Cab or Hotel with pre-filled destination context
  const crossBookFromFlight = (flight: Flight, target: 'cab' | 'hotel') => {
    setSelectedFlight(flight);
    if (target === 'cab') {
      setCabFilter(prev => ({
        ...prev,
        airportCode: flight.destination.code
      }));
      setActiveTab('cabs');
    } else if (target === 'hotel') {
      setHotelFilter(prev => ({
        ...prev,
        airportCode: flight.destination.code
      }));
      setActiveTab('hotels');
    }
  };

  const resetFlightFilter = () => setFlightFilter(defaultFlightFilter);
  const resetCabFilter = () => setCabFilter(defaultCabFilter);
  const resetHotelFilter = () => setHotelFilter(defaultHotelFilter);

  // Booking handlers
  const bookFlight = (flight: Flight, seat: string, passenger: PassengerInfo) => {
    const bookingRef = `FL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newBooking: BookingItem = {
      id: `bk-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      bookingRef,
      createdAt: new Date().toISOString(),
      type: 'flight',
      flightDetails: {
        flight,
        selectedSeat: seat,
        passengersCount: 1
      },
      passenger,
      totalPrice: flight.price,
      status: 'Confirmed'
    };

    setCart(prev => [newBooking, ...prev]);
    setSelectedFlight(flight);
    triggerConfetti();
  };

  const bookCab = (cab: Cab, pickupLoc: string, dropoffLoc: string, pickupTime: string, passenger: PassengerInfo) => {
    const bookingRef = `CB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const distanceEst = 25; // average km
    const fare = Math.round(cab.baseFare + distanceEst * cab.pricePerKm);

    const newBooking: BookingItem = {
      id: `bk-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      bookingRef,
      createdAt: new Date().toISOString(),
      type: 'cab',
      cabDetails: {
        cab,
        pickupLocation: pickupLoc || `${cab.airportCode} Terminal Exit`,
        dropoffLocation: dropoffLoc || `Downtown ${cab.city}`,
        pickupDateTime: pickupTime || new Date().toISOString(),
        estimatedDistanceKm: distanceEst
      },
      passenger,
      totalPrice: fare,
      status: 'Confirmed'
    };

    setCart(prev => [newBooking, ...prev]);
    triggerConfetti();
  };

  const bookHotel = (hotel: Hotel, room: HotelRoom, checkIn: string, checkOut: string, passenger: PassengerInfo) => {
    const bookingRef = `HT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const nights = 2; // Default 2 nights calculation
    const totalPrice = room.pricePerNight * nights;

    const newBooking: BookingItem = {
      id: `bk-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      bookingRef,
      createdAt: new Date().toISOString(),
      type: 'hotel',
      hotelDetails: {
        hotel,
        selectedRoom: room,
        checkInDate: checkIn || new Date().toISOString().split('T')[0],
        checkOutDate: checkOut || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        nights
      },
      passenger,
      totalPrice,
      status: 'Confirmed'
    };

    setCart(prev => [newBooking, ...prev]);
    triggerConfetti();
  };

  const cancelBooking = (bookingId: string) => {
    setCart(prev => prev.filter(b => b.id !== bookingId));
  };

  const clearAllBookings = () => {
    setCart([]);
  };

  return (
    <BookingContext.Provider
      value={{
        allFlights,
        allCabs,
        allHotels,
        isLoadingData,
        activeTab,
        setActiveTab,
        selectedFlight,
        setSelectedFlight,
        crossBookFromFlight,
        flightFilter,
        setFlightFilter,
        resetFlightFilter,
        cabFilter,
        setCabFilter,
        resetCabFilter,
        hotelFilter,
        setHotelFilter,
        resetHotelFilter,
        cart,
        bookFlight,
        bookCab,
        bookHotel,
        cancelBooking,
        clearAllBookings,
        seatModalFlight,
        setSeatModalFlight,
        hotelDetailModal,
        setHotelDetailModal,
        showCheckoutModal,
        setShowCheckoutModal
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
