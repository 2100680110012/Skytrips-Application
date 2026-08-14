import { Airport, Flight, Cab, Hotel, CabinClass, CabType, HotelRoom } from '../types';

// Top Major Indian Domestic Hubs used across Flights, Cabs, and Hotels
export const AIRPORTS: Airport[] = [
  { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'India', latitude: 19.0896, longitude: 72.8656 },
  { code: 'DEL', name: 'Indira Gandhi International Airport (T3/T2/T1)', city: 'New Delhi', country: 'India', latitude: 28.5562, longitude: 77.1000 },
  { code: 'BLR', name: 'Kempegowda International Airport', city: 'Bengaluru', country: 'India', latitude: 13.1986, longitude: 77.7066 },
  { code: 'HYD', name: 'Rajiv Gandhi International Airport', city: 'Hyderabad', country: 'India', latitude: 17.2403, longitude: 78.4294 },
  { code: 'MAA', name: 'Chennai International Airport', city: 'Chennai', country: 'India', latitude: 12.9941, longitude: 80.1709 },
  { code: 'CCU', name: 'Netaji Subhash Chandra Bose Intl Airport', city: 'Kolkata', country: 'India', latitude: 22.6547, longitude: 88.4467 },
  { code: 'AMD', name: 'Sardar Vallabhbhai Patel Intl Airport', city: 'Ahmedabad', country: 'India', latitude: 23.0772, longitude: 72.6347 },
  { code: 'GOI', name: 'Dabolim International Airport', city: 'Goa (Dabolim)', country: 'India', latitude: 15.3808, longitude: 73.8314 },
  { code: 'GOX', name: 'Manohar International Airport', city: 'Goa (Mopa)', country: 'India', latitude: 15.7483, longitude: 73.8650 },
  { code: 'PNQ', name: 'Pune International Airport', city: 'Pune', country: 'India', latitude: 18.5821, longitude: 73.9197 },
  { code: 'COK', name: 'Cochin International Airport', city: 'Kochi', country: 'India', latitude: 10.1520, longitude: 76.4019 },
  { code: 'JAI', name: 'Jaipur International Airport', city: 'Jaipur', country: 'India', latitude: 26.8242, longitude: 75.8122 },
  { code: 'LKO', name: 'Chaudhary Charan Singh Intl Airport', city: 'Lucknow', country: 'India', latitude: 26.7606, longitude: 80.8893 },
  { code: 'PAT', name: 'Jay Prakash Narayan Airport', city: 'Patna', country: 'India', latitude: 25.5913, longitude: 85.0880 },
  { code: 'GAW', name: 'Lokpriya Gopinath Bordoloi Intl Airport', city: 'Guwahati', country: 'India', latitude: 26.1061, longitude: 91.5859 },
  { code: 'SXR', name: 'Sheikh ul-Alam International Airport', city: 'Srinagar', country: 'India', latitude: 33.9871, longitude: 74.7741 },
  { code: 'IXC', name: 'Shaheed Bhagat Singh Intl Airport', city: 'Chandigarh', country: 'India', latitude: 30.6735, longitude: 76.7885 },
  { code: 'VNS', name: 'Lal Bahadur Shastri Intl Airport', city: 'Varanasi', country: 'India', latitude: 25.4524, longitude: 82.8590 },
  { code: 'IDR', name: 'Devi Ahilya Bai Holkar Airport', city: 'Indore', country: 'India', latitude: 22.7217, longitude: 75.8011 },
  { code: 'BHO', name: 'Raja Bhoj Airport', city: 'Bhopal', country: 'India', latitude: 23.2875, longitude: 77.3374 },
  { code: 'NAG', name: 'Dr. Babasaheb Ambedkar Intl Airport', city: 'Nagpur', country: 'India', latitude: 21.0922, longitude: 79.0472 },
  { code: 'BBI', name: 'Biju Patnaik International Airport', city: 'Bhubaneswar', country: 'India', latitude: 20.2444, longitude: 85.8178 },
  { code: 'RPR', name: 'Swami Vivekananda Airport', city: 'Raipur', country: 'India', latitude: 21.1804, longitude: 81.7388 },
  { code: 'VTZ', name: 'Visakhapatnam International Airport', city: 'Visakhapatnam', country: 'India', latitude: 17.7211, longitude: 83.2245 },
  { code: 'CJB', name: 'Coimbatore International Airport', city: 'Coimbatore', country: 'India', latitude: 11.0300, longitude: 77.0434 },
  { code: 'TRV', name: 'Thiruvananthapuram Intl Airport', city: 'Thiruvananthapuram', country: 'India', latitude: 8.4821, longitude: 76.9200 },
  { code: 'ATQ', name: 'Sri Guru Ram Dass Jee Intl Airport', city: 'Amritsar', country: 'India', latitude: 31.7096, longitude: 74.7973 },
  { code: 'UDR', name: 'Maharana Pratap Airport', city: 'Udaipur', country: 'India', latitude: 24.6177, longitude: 73.8961 },
  { code: 'DED', name: 'Dehradun Airport (Jolly Grant)', city: 'Dehradun', country: 'India', latitude: 30.1897, longitude: 78.1803 },
  { code: 'AYJ', name: 'Maharishi Valmiki Intl Airport', city: 'Ayodhya', country: 'India', latitude: 26.7456, longitude: 82.1481 }
];

export const AIRLINES = [
  { name: 'IndiGo', code: '6E', color: '#133582' },
  { name: 'Air India', code: 'AI', color: '#ed1b24' },
  { name: 'Vistara', code: 'UK', color: '#4b164c' },
  { name: 'Akasa Air', code: 'QP', color: '#ff5000' },
  { name: 'SpiceJet', code: 'SG', color: '#f26522' },
  { name: 'Air India Express', code: 'IX', color: '#e31837' },
  { name: 'AIX Connect', code: 'I5', color: '#d81e05' }
];

const AIRCRAFT_MODELS = ['Boeing 787-9 Dreamliner', 'Airbus A350-1000', 'Boeing 777-300ER', 'Airbus A380-800', 'Airbus A321neo', 'Boeing 737 MAX 9'];
const AMENITIES_LIST = ['Free High-Speed Wi-Fi', 'In-seat Power & USB', 'Live TV & Movies', 'Complimentary Gourmet Meals', 'Lie-flat Seats', 'Noise-canceling Headphones'];

// Pseudo-Random Generator for consistent, fast deterministic generation
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// ----------------------------------------------------
// GENERATE 30,000+ FLIGHTS
// ----------------------------------------------------
export function generateFlights(totalCount = 30500): Flight[] {
  const flights: Flight[] = [];
  const airportCount = AIRPORTS.length;
  const airlineCount = AIRLINES.length;

  for (let i = 0; i < totalCount; i++) {
    const seed = i * 1.618;
    const originIdx = Math.floor(seededRandom(seed + 1) * airportCount);
    let destIdx = Math.floor(seededRandom(seed + 2) * airportCount);
    if (destIdx === originIdx) destIdx = (originIdx + 1) % airportCount;

    const origin = AIRPORTS[originIdx];
    const destination = AIRPORTS[destIdx];

    const airline = AIRLINES[Math.floor(seededRandom(seed + 3) * airlineCount)];
    const flightNum = `${airline.code}-${Math.floor(100 + seededRandom(seed + 4) * 8999)}`;

    // Departure time spread across next 14 days
    const dayOffset = Math.floor(seededRandom(seed + 5) * 14);
    const hour = Math.floor(seededRandom(seed + 6) * 24);
    const minute = Math.floor(seededRandom(seed + 7) * 4) * 15;
    
    const depDate = new Date();
    depDate.setDate(depDate.getDate() + dayOffset);
    depDate.setHours(hour, minute, 0, 0);

    // Duration based on rough distance simulation + random factor
    const baseDuration = Math.floor(120 + seededRandom(seed + 8) * 780); // 2h to 15h
    const arrDate = new Date(depDate.getTime() + baseDuration * 60 * 1000);

    const stopsRnd = seededRandom(seed + 9);
    const stops = stopsRnd < 0.6 ? 0 : stopsRnd < 0.85 ? 1 : 2;
    let stopoverAirport: string | undefined = undefined;
    if (stops > 0) {
      const stopIdx = (originIdx + destIdx + 3) % airportCount;
      stopoverAirport = AIRPORTS[stopIdx].code;
    }

    const classRnd = seededRandom(seed + 10);
    const cabinClass: CabinClass = classRnd < 0.5 ? 'Economy' : classRnd < 0.75 ? 'Premium Economy' : classRnd < 0.9 ? 'Business' : 'First Class';

    let basePrice = 180 + Math.floor(seededRandom(seed + 11) * 1200);
    if (cabinClass === 'Premium Economy') basePrice = Math.floor(basePrice * 1.5);
    if (cabinClass === 'Business') basePrice = Math.floor(basePrice * 3.2);
    if (cabinClass === 'First Class') basePrice = Math.floor(basePrice * 5.5);
    if (stops === 0) basePrice = Math.floor(basePrice * 1.15); // Non-stop premium

    const aircraft = AIRCRAFT_MODELS[Math.floor(seededRandom(seed + 12) * AIRCRAFT_MODELS.length)];
    const terminal = `T${Math.floor(1 + seededRandom(seed + 13) * 4)}`;
    const gate = `${String.fromCharCode(65 + Math.floor(seededRandom(seed + 14) * 6))}${Math.floor(1 + seededRandom(seed + 15) * 30)}`;

    const availSeats = Math.floor(1 + seededRandom(seed + 16) * 42);

    flights.push({
      id: `fl-${i + 1}`,
      flightNumber: flightNum,
      airline: airline.name,
      airlineCode: airline.code,
      airlineColor: airline.color,
      origin,
      destination,
      departureTime: depDate.toISOString(),
      arrivalTime: arrDate.toISOString(),
      durationMinutes: baseDuration,
      stops,
      stopoverAirport,
      price: basePrice,
      cabinClass,
      availableSeats: availSeats,
      aircraft,
      terminal,
      gate,
      status: seededRandom(seed + 17) > 0.15 ? 'On Time' : 'Scheduled',
      amenities: AMENITIES_LIST.slice(0, 3 + Math.floor(seededRandom(seed + 18) * 3))
    });
  }

  return flights;
}

// ----------------------------------------------------
// GENERATE 5,000+ CABS (Connected to Airports)
// ----------------------------------------------------
const DRIVER_FIRST_NAMES = ['Alexander', 'Marcus', 'Sophia', 'David', 'Elena', 'Viktor', 'Kenji', 'Rajesh', 'Priya', 'Carlos', 'Fatima', 'Liam', 'Noah', 'Emma', 'Oliver', 'Lucas', 'Mason', 'Ethan', 'Chloe', 'Zoe'];
const DRIVER_LAST_NAMES = ['Smith', 'Chen', 'Patel', 'Kim', 'Garcia', 'Müller', 'Takahashi', 'Singh', 'Silva', 'Kowalski', 'Dubois', 'Novak', 'Santos', 'O\'Connor', 'Al-Mansoor'];

const CAB_TYPES: { type: CabType; models: string[]; baseFare: number; perKm: number; cap: [number, number]; electric: boolean; shuttle: boolean }[] = [
  { type: 'Economy Sedan', models: ['Toyota Camry', 'Honda Accord', 'Hyundai Sonata', 'Nissan Altima'], baseFare: 12, perKm: 1.8, cap: [4, 2], electric: false, shuttle: false },
  { type: 'Executive SUV', models: ['Cadillac Escalade', 'BMW X7', 'Mercedes GLE', 'Audi Q8'], baseFare: 35, perKm: 3.5, cap: [6, 5], electric: false, shuttle: false },
  { type: 'Electric Luxury', models: ['Tesla Model S', 'Porsche Taycan', 'Lucid Air', 'Mercedes EQE'], baseFare: 28, perKm: 3.0, cap: [4, 3], electric: true, shuttle: false },
  { type: 'Airport Shuttle', models: ['Mercedes Sprinter Van', 'Ford Transit Shuttle'], baseFare: 18, perKm: 1.5, cap: [10, 10], electric: false, shuttle: true },
  { type: 'Shared Van', models: ['Toyota HiAce', 'Volkswagen Crafter'], baseFare: 10, perKm: 1.2, cap: [8, 8], electric: false, shuttle: true },
  { type: 'VIP Limousine', models: ['Rolls-Royce Ghost', 'Mercedes-Maybach S-Class', 'Bentley Flying Spur'], baseFare: 90, perKm: 7.5, cap: [3, 3], electric: false, shuttle: false }
];

export function generateCabs(totalCount = 5200): Cab[] {
  const cabs: Cab[] = [];
  const airportCount = AIRPORTS.length;

  for (let i = 0; i < totalCount; i++) {
    const seed = i * 2.718;
    const airport = AIRPORTS[i % airportCount];
    const cabConfig = CAB_TYPES[Math.floor(seededRandom(seed + 1) * CAB_TYPES.length)];

    const driverName = `${DRIVER_FIRST_NAMES[Math.floor(seededRandom(seed + 2) * DRIVER_FIRST_NAMES.length)]} ${DRIVER_LAST_NAMES[Math.floor(seededRandom(seed + 3) * DRIVER_LAST_NAMES.length)]}`;
    const vehicleModel = cabConfig.models[Math.floor(seededRandom(seed + 4) * cabConfig.models.length)];

    const rating = parseFloat((4.4 + seededRandom(seed + 5) * 0.59).toFixed(2));
    const trips = Math.floor(120 + seededRandom(seed + 6) * 4800);
    const waitMin = Math.floor(2 + seededRandom(seed + 7) * 12);

    const features = ['GPS Live Tracking', 'Air Conditioning', 'Free Bottled Water', 'Flight Delayed Auto-Adjust'];
    if (cabConfig.electric) features.push('Quiet EV Cabin', 'Eco-Friendly Zero Emission');
    if (cabConfig.shuttle) features.push('Luggage Assistance', 'Fixed Terminal Pickup');
    if (cabConfig.type === 'VIP Limousine' || cabConfig.type === 'Executive SUV') features.push('Leather Interior', 'Onboard Wi-Fi', 'Complimentary Champagne');

    cabs.push({
      id: `cab-${i + 1}`,
      airportCode: airport.code,
      airportName: airport.name,
      city: airport.city,
      type: cabConfig.type,
      vehicleModel,
      driverName,
      driverRating: rating,
      driverTrips: trips,
      baseFare: cabConfig.baseFare,
      pricePerKm: cabConfig.perKm,
      passengerCapacity: cabConfig.cap[0],
      luggageCapacity: cabConfig.cap[1],
      estimatedWaitMinutes: waitMin,
      features,
      isElectric: cabConfig.electric,
      isShuttle: cabConfig.shuttle,
      status: waitMin < 5 ? 'Nearby' : 'Available'
    });
  }

  return cabs;
}

// ----------------------------------------------------
// GENERATE 5,000+ NEARBY HOTELS (Connected to Airports)
// ----------------------------------------------------
const HOTEL_PREFIXES = ['The Grand', 'Crown Plaza', 'Skyline Luxury', 'Airport Gateway', 'Marriott Executive', 'Hilton Terminal', 'Radisson Blu', 'Hyatt Regency', 'Novotel Transit', 'InterContinental', 'Sheraton Grand', 'Aloft Airport', 'CitizenM Terminal', 'Four Points', 'Holiday Inn Express', 'Pullman Suites', 'Swissôtel Sanctuary', 'Fairmont Horizon', 'Rosewood Airport', 'Ritz-Carlton Air Hub'];
const HOTEL_TAGLINES = [
  'Direct walkway connection to Airport Terminal',
  'Luxury suites with panoramic runway views',
  '24/7 complimentary airport express shuttle',
  'Ultra-quiet soundproof rooms & rooftop pool',
  'Top-rated transit hotel with executive lounge access',
  'Premium spa & wellness center near terminals'
];

const HOTEL_AMENITIES_POOL = [
  'Free Airport Shuttle (24/7)',
  'Soundproof Triple-Glazed Windows',
  '24-Hour Express Check-in',
  'Rooftop Infinity Pool',
  'Full Spa & Wellness Sauna',
  '24/7 Fitness Center',
  'Free Ultra-Fast Wi-Fi',
  'Complimentary Buffet Breakfast',
  'Flight Status Terminal Display Screen',
  'Executive Business Lounge'
];

export function generateHotels(totalCount = 5200): Hotel[] {
  const hotels: Hotel[] = [];
  const airportCount = AIRPORTS.length;

  for (let i = 0; i < totalCount; i++) {
    const seed = i * 3.1415;
    const airport = AIRPORTS[i % airportCount];
    const prefix = HOTEL_PREFIXES[Math.floor(seededRandom(seed + 1) * HOTEL_PREFIXES.length)];
    const name = `${prefix} ${airport.city} (${airport.code})`;

    const distanceKm = parseFloat((0.4 + seededRandom(seed + 2) * 14.5).toFixed(1));
    const starRating = Math.floor(seededRandom(seed + 3) * 3) + 3; // 3, 4, 5 stars
    const guestScore = parseFloat((7.6 + seededRandom(seed + 4) * 2.3).toFixed(1));
    const reviewCount = Math.floor(85 + seededRandom(seed + 5) * 3400);

    let pricePerNight = Math.floor(75 + seededRandom(seed + 6) * 380);
    if (starRating === 4) pricePerNight = Math.floor(pricePerNight * 1.4);
    if (starRating === 5) pricePerNight = Math.floor(pricePerNight * 2.2);

    const hasFreeShuttle = seededRandom(seed + 7) > 0.25 || distanceKm < 2.0;
    const has24HourCheckin = seededRandom(seed + 8) > 0.15;
    const hasSoundproof = seededRandom(seed + 9) > 0.20;

    const tagline = HOTEL_TAGLINES[Math.floor(seededRandom(seed + 10) * HOTEL_TAGLINES.length)];

    const selectedAmenities = HOTEL_AMENITIES_POOL.filter((_, idx) => seededRandom(seed + 11 + idx) > 0.35);
    if (hasFreeShuttle && !selectedAmenities.includes('Free Airport Shuttle (24/7)')) {
      selectedAmenities.unshift('Free Airport Shuttle (24/7)');
    }

    const rooms: HotelRoom[] = [
      {
        id: `rm-${i}-1`,
        name: 'Deluxe King Room with Airport View',
        pricePerNight: pricePerNight,
        capacity: 2,
        bedType: '1 King Bed',
        sizeSqFt: 350,
        isAvailable: true
      },
      {
        id: `rm-${i}-2`,
        name: 'Executive Transit Suite',
        pricePerNight: Math.floor(pricePerNight * 1.45),
        capacity: 3,
        bedType: '1 King Bed + 1 Sofa Bed',
        sizeSqFt: 520,
        isAvailable: true
      },
      {
        id: `rm-${i}-3`,
        name: 'Presidential Runway Panorama Suite',
        pricePerNight: Math.floor(pricePerNight * 2.5),
        capacity: 4,
        bedType: '2 Super King Beds',
        sizeSqFt: 850,
        isAvailable: true
      }
    ];

    let badge: string | undefined = undefined;
    if (distanceKm <= 1.0) badge = 'Connected to Terminal';
    else if (guestScore >= 9.3) badge = 'Traveler\'s Choice 2026';
    else if (hasFreeShuttle) badge = 'Free 24/7 Shuttle';

    hotels.push({
      id: `ht-${i + 1}`,
      name,
      airportCode: airport.code,
      airportName: airport.name,
      city: airport.city,
      country: airport.country,
      distanceKmToAirport: distanceKm,
      starRating,
      guestScore,
      reviewCount,
      pricePerNight,
      address: `${Math.floor(100 + seededRandom(seed + 12) * 8900)} Airport Boulevard, near ${airport.code} Terminal, ${airport.city}`,
      tagline,
      amenities: selectedAmenities,
      hasFreeShuttle,
      has24HourCheckin,
      hasSoundproofRooms: hasSoundproof,
      rooms,
      badge
    });
  }

  return hotels;
}

// ----------------------------------------------------
// REAL-TIME FLIGHT TELEMETRY API CLIENT
// ----------------------------------------------------
export async function fetchRealtimeFlightStatus(flightNumber: string, originCode = 'DEL', destCode = 'BOM') {
  try {
    const res = await fetch(`/api/flights/live?flightNumber=${encodeURIComponent(flightNumber)}&origin=${encodeURIComponent(originCode)}&destination=${encodeURIComponent(destCode)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.status === 'success') {
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Realtime API unavailable, using simulated telemetry:', err);
  }

  // Fallback client-side simulated telemetry
  return {
    flightNumber,
    origin: originCode,
    destination: destCode,
    status: 'IN_AIR',
    altitudeFt: 34200,
    speedKnots: 495,
    lat: 23.82,
    lon: 75.14,
    delayMinutes: 0,
    heading: 215.4,
    progressPercent: 54.2,
    lastUpdated: new Date().toLocaleTimeString(),
    dataSource: 'Browser Local Simulator'
  };
}

