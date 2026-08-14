import React, { useState, useMemo } from 'react';
import { Building2, Star, MapPin, Bus, ShieldCheck, Check, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { AIRPORTS } from '../../services/dataGenerator';
import { Hotel, HotelRoom, PassengerInfo } from '../../types';

export const HotelSearch: React.FC = () => {
  const { allHotels, hotelFilter, setHotelFilter, resetHotelFilter, bookHotel } = useBooking();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;

  // Active hotel for room selector modal
  const [selectedHotelForModal, setSelectedHotelForModal] = useState<Hotel | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<HotelRoom | null>(null);
  
  const [checkInDate, setCheckInDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [checkOutDate, setCheckOutDate] = useState<string>(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);

  const [passenger, setPassenger] = useState<PassengerInfo>({
    fullName: 'Gaurav Kumar',
    email: 'gaurav.traveler@example.com',
    phone: '+1 (555) 234-5678'
  });

  const [isBooked, setIsBooked] = useState<boolean>(false);

  // Perform dynamic filtering across 5,000+ nearby hotels
  const filteredHotels = useMemo(() => {
    let list = allHotels;

    if (hotelFilter.airportCode) {
      list = list.filter(h => h.airportCode === hotelFilter.airportCode);
    }

    if (hotelFilter.maxDistanceKm) {
      list = list.filter(h => h.distanceKmToAirport <= hotelFilter.maxDistanceKm);
    }

    if (hotelFilter.minStarRating) {
      list = list.filter(h => h.starRating >= hotelFilter.minStarRating);
    }

    if (hotelFilter.maxPrice) {
      list = list.filter(h => h.pricePerNight <= hotelFilter.maxPrice);
    }

    if (hotelFilter.freeShuttleOnly) {
      list = list.filter(h => h.hasFreeShuttle);
    }

    // Sort
    return [...list].sort((a, b) => {
      if (hotelFilter.sortBy === 'distance_asc') return a.distanceKmToAirport - b.distanceKmToAirport;
      if (hotelFilter.sortBy === 'price_asc') return a.pricePerNight - b.pricePerNight;
      if (hotelFilter.sortBy === 'rating_desc') return b.starRating - a.starRating;
      if (hotelFilter.sortBy === 'score_desc') return b.guestScore - a.guestScore;
      return 0;
    });
  }, [allHotels, hotelFilter]);

  const totalPages = Math.ceil(filteredHotels.length / pageSize) || 1;
  const paginatedHotels = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredHotels.slice(start, start + pageSize);
  }, [filteredHotels, currentPage, pageSize]);

  const handleOpenHotelModal = (hotel: Hotel) => {
    setSelectedHotelForModal(hotel);
    setSelectedRoom(hotel.rooms[0] || null);
    setIsBooked(false);
  };

  const handleConfirmHotelBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHotelForModal || !selectedRoom) return;
    bookHotel(selectedHotelForModal, selectedRoom, checkInDate, checkOutDate, passenger);
    setIsBooked(true);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Hero Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-amber-950/40 relative overflow-hidden">
        <div className="max-w-3xl mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Building2 className="w-3.5 h-3.5" /> 5,000+ Luxury Transit Hotels Near Airports
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Outfit']">
            Hotels Located Near International Airports
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Book top-rated transit hotels positioned within minutes of all 35 airport terminals. Enjoy 24/7 free airport shuttles, soundproof suites, and express check-in.
          </p>
        </div>

        {/* Search Bar Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
          
          {/* Target Airport */}
          <div className="lg:col-span-4">
            <label className="block text-xs font-medium text-slate-400 mb-1">Near Airport Code</label>
            <select
              value={hotelFilter.airportCode}
              onChange={e => {
                setHotelFilter(prev => ({ ...prev, airportCode: e.target.value }));
                setCurrentPage(1);
              }}
              className="select-control font-semibold"
            >
              <option value="">All Airports (5,000+ Hotels)</option>
              {AIRPORTS.map(ap => (
                <option key={ap.code} value={ap.code}>
                  {ap.city} ({ap.code}) - {ap.name}
                </option>
              ))}
            </select>
          </div>

          {/* Proximity Distance */}
          <div className="lg:col-span-3">
            <label className="block text-xs font-medium text-slate-400 mb-1">Max Distance to Terminal</label>
            <select
              value={hotelFilter.maxDistanceKm}
              onChange={e => setHotelFilter(prev => ({ ...prev, maxDistanceKm: Number(e.target.value) }))}
              className="select-control font-semibold"
            >
              <option value={2}>Within 2 km (Terminal Walk)</option>
              <option value={5}>Within 5 km</option>
              <option value={10}>Within 10 km</option>
              <option value={20}>Within 20 km (City Vicinity)</option>
            </select>
          </div>

          {/* Star Rating */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-slate-400 mb-1">Min Stars</label>
            <select
              value={hotelFilter.minStarRating}
              onChange={e => setHotelFilter(prev => ({ ...prev, minStarRating: Number(e.target.value) }))}
              className="select-control font-semibold"
            >
              <option value={3}>3+ Stars</option>
              <option value={4}>4+ Stars</option>
              <option value={5}>5 Star Luxury</option>
            </select>
          </div>

          {/* Sort */}
          <div className="lg:col-span-3">
            <label className="block text-xs font-medium text-slate-400 mb-1">Sort By</label>
            <select
              value={hotelFilter.sortBy}
              onChange={e => setHotelFilter(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="select-control"
            >
              <option value="distance_asc">Closest to Terminal First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="score_desc">Highest Guest Review Score</option>
              <option value="rating_desc">Highest Star Rating</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-white flex items-center gap-2 font-['Outfit']">
                <Filter className="w-4 h-4 text-amber-400" /> Filter Hotels
              </span>
              <button onClick={resetHotelFilter} className="text-xs text-amber-400 hover:underline">
                Reset All
              </button>
            </div>

            {/* Max Price Night */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Max Price / Night</span>
                <span className="font-bold text-white font-mono">${hotelFilter.maxPrice}</span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="25"
                value={hotelFilter.maxPrice}
                onChange={e => setHotelFilter(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                className="w-full accent-amber-500 bg-slate-800"
              />
            </div>

            {/* Free Shuttle Toggle */}
            <div className="pt-2">
              <label className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hotelFilter.freeShuttleOnly}
                  onChange={e => setHotelFilter(prev => ({ ...prev, freeShuttleOnly: e.target.checked }))}
                  className="rounded border-slate-700 bg-slate-800 text-amber-500 accent-amber-500"
                />
                <span className="font-medium flex items-center gap-1">
                  <Bus className="w-3.5 h-3.5 text-amber-400" /> Free Airport Shuttle Only
                </span>
              </label>
            </div>

          </div>
        </aside>

        {/* Hotels Grid */}
        <main className="lg:col-span-9 space-y-4">
          
          <div className="flex items-center justify-between px-2 text-xs text-slate-400">
            <div>
              Showing <strong className="text-white">{filteredHotels.length}</strong> airport hotels out of <strong className="text-slate-300">{allHotels.length.toLocaleString()}</strong> indexed.
            </div>
            <div>Page {currentPage} of {totalPages}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedHotels.map(hotel => (
              <div
                key={hotel.id}
                className="glass-card p-5 rounded-2xl space-y-4 flex flex-col justify-between hover:border-amber-500/40"
              >
                <div>
                  
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1 text-amber-400 text-xs">
                      {Array.from({ length: hotel.starRating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    {hotel.badge && (
                      <span className="badge badge-gold font-mono text-[10px]">
                        {hotel.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white font-['Outfit']">{hotel.name}</h3>
                  
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <strong>{hotel.distanceKmToAirport} km</strong> from {hotel.airportCode} Terminal • {hotel.city}
                  </p>

                  <p className="text-xs text-slate-300 italic mt-2 line-clamp-1">"{hotel.tagline}"</p>

                  {/* Review Score & Price */}
                  <div className="flex items-center justify-between mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-extrabold text-sm flex items-center justify-center font-mono">
                        {hotel.guestScore}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">Superb Rating</div>
                        <div className="text-[11px] text-slate-400">{hotel.reviewCount} verified reviews</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-extrabold text-white font-mono">${hotel.pricePerNight}</div>
                      <div className="text-[10px] text-slate-400">/ night</div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {hotel.amenities.slice(0, 3).map((amen, idx) => (
                      <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {amen}
                      </span>
                    ))}
                  </div>

                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Free Cancellation
                  </span>
                  <button
                    onClick={() => handleOpenHotelModal(hotel)}
                    className="btn-primary py-2 px-4 text-xs"
                  >
                    <ShieldCheck className="w-4 h-4" /> View Rooms & Book
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="btn-secondary py-2 px-4 text-xs disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <span className="text-xs font-mono text-slate-400">Page {currentPage} of {totalPages}</span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="btn-secondary py-2 px-4 text-xs disabled:opacity-40"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </main>

      </div>

      {/* Hotel Room Selection Modal */}
      {selectedHotelForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="glass-panel border border-slate-700 rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl my-auto max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-['Outfit']">{selectedHotelForModal.name}</h3>
                  <p className="text-xs text-slate-400">
                    {selectedHotelForModal.distanceKmToAirport} km from {selectedHotelForModal.airportCode} Terminal • {selectedHotelForModal.address}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedHotelForModal(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {!isBooked ? (
              <form onSubmit={handleConfirmHotelBooking} className="space-y-6">
                
                {/* Room Options */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Select Room Suite</label>
                  <div className="space-y-2">
                    {selectedHotelForModal.rooms.map(room => (
                      <div
                        key={room.id}
                        onClick={() => setSelectedRoom(room)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          selectedRoom?.id === room.id
                            ? 'bg-amber-950/30 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-sm text-white">{room.name}</div>
                            <div className="text-xs text-slate-400">{room.bedType} • {room.sizeSqFt} sq ft • Up to {room.capacity} guests</div>
                          </div>
                          <div className="text-right">
                            <div className="font-extrabold text-lg text-white font-mono">${room.pricePerNight}</div>
                            <div className="text-[10px] text-slate-400">/ night</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Check-in Date</label>
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={e => setCheckInDate(e.target.value)}
                      className="input-control font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Check-out Date</label>
                    <input
                      type="date"
                      value={checkOutDate}
                      onChange={e => setCheckOutDate(e.target.value)}
                      className="input-control font-semibold"
                    />
                  </div>
                </div>

                {/* Guest Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Primary Guest Name</label>
                    <input
                      type="text"
                      required
                      value={passenger.fullName}
                      onChange={e => setPassenger({ ...passenger, fullName: e.target.value })}
                      className="input-control"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Email Confirmation</label>
                    <input
                      type="email"
                      required
                      value={passenger.email}
                      onChange={e => setPassenger({ ...passenger, email: e.target.value })}
                      className="input-control"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>Room Rate (2 Nights)</span>
                    <span className="font-mono">${(selectedRoom?.pricePerNight || 0) * 2}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Airport Taxes & Resort Fees</span>
                    <span className="font-mono">Included</span>
                  </div>
                  <div className="flex justify-between font-bold text-white text-sm pt-2 border-t border-slate-800">
                    <span>Total Amount</span>
                    <span className="font-mono text-amber-400">${(selectedRoom?.pricePerNight || 0) * 2}</span>
                  </div>
                </div>

                <button type="submit" className="w-full btn-primary justify-center py-3">
                  <ShieldCheck className="w-5 h-5" /> Reserve Hotel Room
                </button>

              </form>
            ) : (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40">
                  <Check className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white">Hotel Reservation Confirmed!</h3>
                <p className="text-xs text-slate-400">
                  {selectedRoom?.name} at <strong className="text-white">{selectedHotelForModal.name}</strong> reserved. Free shuttle details included on voucher.
                </p>
                <button onClick={() => setSelectedHotelForModal(null)} className="btn-secondary">Close</button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
