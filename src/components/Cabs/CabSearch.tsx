import React, { useState, useMemo } from 'react';
import { Car, Star, Clock, Users, ShieldCheck, MapPin, Check, ChevronLeft, ChevronRight, Zap, Filter } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { AIRPORTS } from '../../services/dataGenerator';
import { Cab, PassengerInfo } from '../../types';

export const CabSearch: React.FC = () => {
  const { allCabs, cabFilter, setCabFilter, resetCabFilter, bookCab } = useBooking();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;

  // Selected Cab for booking modal
  const [selectedCabForBooking, setSelectedCabForBooking] = useState<Cab | null>(null);
  
  // Modal booking form state
  const [pickupLoc, setPickupLoc] = useState<string>('');
  const [dropoffLoc, setDropoffLoc] = useState<string>('');
  const [passenger, setPassenger] = useState<PassengerInfo>({
    fullName: 'Gaurav Kumar',
    email: 'gaurav.traveler@example.com',
    phone: '+1 (555) 234-5678'
  });
  const [isBooked, setIsBooked] = useState<boolean>(false);

  // Perform dynamic filtering across 5,000+ cabs
  const filteredCabs = useMemo(() => {
    let list = allCabs;

    if (cabFilter.airportCode) {
      list = list.filter(c => c.airportCode === cabFilter.airportCode);
    }

    if (cabFilter.type !== 'All') {
      list = list.filter(c => c.type === cabFilter.type);
    }

    if (cabFilter.passengers > 1) {
      list = list.filter(c => c.passengerCapacity >= cabFilter.passengers);
    }

    if (cabFilter.maxFare) {
      list = list.filter(c => c.baseFare <= cabFilter.maxFare);
    }

    // Sort
    return [...list].sort((a, b) => {
      if (cabFilter.sortBy === 'price_asc') return a.baseFare - b.baseFare;
      if (cabFilter.sortBy === 'rating_desc') return b.driverRating - a.driverRating;
      if (cabFilter.sortBy === 'wait_asc') return a.estimatedWaitMinutes - b.estimatedWaitMinutes;
      return 0;
    });
  }, [allCabs, cabFilter]);

  const totalPages = Math.ceil(filteredCabs.length / pageSize) || 1;
  const paginatedCabs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCabs.slice(start, start + pageSize);
  }, [filteredCabs, currentPage, pageSize]);

  const handleOpenBooking = (cab: Cab) => {
    setSelectedCabForBooking(cab);
    setPickupLoc(`${cab.airportCode} Terminal 1 Arrivals Gate`);
    setDropoffLoc(`Grand Hotel / City Center, ${cab.city}`);
    setIsBooked(false);
  };

  const handleConfirmCabBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCabForBooking) return;
    bookCab(selectedCabForBooking, pickupLoc, dropoffLoc, new Date().toISOString(), passenger);
    setIsBooked(true);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Hero Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-cyan-950/40 relative overflow-hidden">
        <div className="max-w-3xl mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Car className="w-3.5 h-3.5" /> 5,000+ Airport Cabs & Shuttles Ready
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Outfit']">
            Airport Transfer Cabs & Private Shuttles
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Pre-book verified driver transfers with flight delay tracking and guaranteed fixed fares across 35 international airport hubs.
          </p>
        </div>

        {/* Search Bar Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
          
          {/* Target Airport */}
          <div className="lg:col-span-4">
            <label className="block text-xs font-medium text-slate-400 mb-1">Select Airport Terminal</label>
            <select
              value={cabFilter.airportCode}
              onChange={e => {
                setCabFilter(prev => ({ ...prev, airportCode: e.target.value }));
                setCurrentPage(1);
              }}
              className="select-control font-semibold"
            >
              <option value="">All Airports (5,000+ Cabs)</option>
              {AIRPORTS.map(ap => (
                <option key={ap.code} value={ap.code}>
                  {ap.city} ({ap.code}) - {ap.name}
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle Class */}
          <div className="lg:col-span-4">
            <label className="block text-xs font-medium text-slate-400 mb-1">Vehicle Category</label>
            <select
              value={cabFilter.type}
              onChange={e => {
                setCabFilter(prev => ({ ...prev, type: e.target.value as any }));
                setCurrentPage(1);
              }}
              className="select-control font-semibold"
            >
              <option value="All">All Vehicle Classes</option>
              <option value="Economy Sedan">Economy Sedan</option>
              <option value="Executive SUV">Executive SUV</option>
              <option value="Electric Luxury">Electric Luxury (Tesla/EV)</option>
              <option value="Airport Shuttle">Airport Express Shuttle</option>
              <option value="Shared Van">Shared Van</option>
              <option value="VIP Limousine">VIP Limousine</option>
            </select>
          </div>

          {/* Passengers */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-slate-400 mb-1">Passengers</label>
            <select
              value={cabFilter.passengers}
              onChange={e => setCabFilter(prev => ({ ...prev, passengers: Number(e.target.value) }))}
              className="select-control font-semibold"
            >
              <option value={1}>1 Passenger</option>
              <option value={2}>2 Passengers</option>
              <option value={4}>4 Passengers</option>
              <option value={6}>6+ Passengers</option>
            </select>
          </div>

          {/* Sort */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-slate-400 mb-1">Sort By</label>
            <select
              value={cabFilter.sortBy}
              onChange={e => setCabFilter(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="select-control"
            >
              <option value="price_asc">Lowest Base Fare</option>
              <option value="rating_desc">Highest Driver Rating</option>
              <option value="wait_asc">Fastest Pickup (Min ETA)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main Cab Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar Filters */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-white flex items-center gap-2 font-['Outfit']">
                <Filter className="w-4 h-4 text-cyan-400" /> Filter Rides
              </span>
              <button onClick={resetCabFilter} className="text-xs text-cyan-400 hover:underline">
                Reset All
              </button>
            </div>

            {/* Max Base Fare Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Max Base Fare</span>
                <span className="font-bold text-white font-mono">${cabFilter.maxFare}</span>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                step="5"
                value={cabFilter.maxFare}
                onChange={e => setCabFilter(prev => ({ ...prev, maxFare: Number(e.target.value) }))}
                className="w-full accent-cyan-500 bg-slate-800"
              />
            </div>

            {/* EV & Special Badges info */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <Zap className="w-4 h-4" /> Zero-Emission EVs
              </div>
              <p className="text-slate-400">
                Choose Electric Luxury options for whisper-quiet airport transfers with complimentary Wi-Fi & water.
              </p>
            </div>

          </div>
        </aside>

        {/* Cab Cards List */}
        <main className="lg:col-span-9 space-y-4">
          
          <div className="flex items-center justify-between px-2 text-xs text-slate-400">
            <div>
              Showing <strong className="text-white">{filteredCabs.length}</strong> available cabs out of <strong className="text-slate-300">{allCabs.length.toLocaleString()}</strong> indexed.
            </div>
            <div>Page {currentPage} of {totalPages}</div>
          </div>

          {/* Cab Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedCabs.map(cab => (
              <div
                key={cab.id}
                className="glass-card p-5 rounded-2xl space-y-4 flex flex-col justify-between hover:border-cyan-500/40"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
                        {cab.type}
                      </span>
                      <h3 className="text-lg font-bold text-white mt-1.5 font-['Outfit']">
                        {cab.vehicleModel}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" /> Serving {cab.airportCode} ({cab.city})
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-extrabold text-white font-mono">${cab.baseFare}</div>
                      <span className="text-xs text-slate-400">+${cab.pricePerKm}/km</span>
                    </div>
                  </div>

                  {/* Driver Specs */}
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                    <div>
                      <div className="text-slate-400">Driver</div>
                      <div className="font-semibold text-slate-200">{cab.driverName}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Driver Rating</div>
                      <div className="font-semibold text-amber-400 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {cab.driverRating} ({cab.driverTrips} trips)
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Est. Pickup ETA</div>
                      <div className="font-semibold text-cyan-300 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> ~{cab.estimatedWaitMinutes} min wait
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Capacity</div>
                      <div className="font-semibold text-slate-200 flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" /> {cab.passengerCapacity} seats
                      </div>
                    </div>
                  </div>

                  {/* Features badges */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {cab.features.map((feat, i) => (
                      <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700">
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Instant Terminal Pickup
                  </span>
                  <button
                    onClick={() => handleOpenBooking(cab)}
                    className="btn-primary py-2 px-4 text-xs"
                  >
                    <ShieldCheck className="w-4 h-4" /> Reserve Cab
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

      {/* Cab Booking Modal */}
      {selectedCabForBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel border border-slate-700 rounded-3xl p-6 sm:p-8 w-full max-w-xl shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-['Outfit']">Reserve Airport Ride</h3>
                  <p className="text-xs text-slate-400">{selectedCabForBooking.vehicleModel} • {selectedCabForBooking.type}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCabForBooking(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {!isBooked ? (
              <form onSubmit={handleConfirmCabBooking} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Pickup Airport Terminal</label>
                  <input
                    type="text"
                    required
                    value={pickupLoc}
                    onChange={e => setPickupLoc(e.target.value)}
                    className="input-control font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Dropoff Address / Destination</label>
                  <input
                    type="text"
                    required
                    value={dropoffLoc}
                    onChange={e => setDropoffLoc(e.target.value)}
                    className="input-control font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Rider Full Name</label>
                    <input
                      type="text"
                      required
                      value={passenger.fullName}
                      onChange={e => setPassenger({ ...passenger, fullName: e.target.value })}
                      className="input-control"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={passenger.phone}
                      onChange={e => setPassenger({ ...passenger, phone: e.target.value })}
                      className="input-control"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>Base Ride Fare</span>
                    <span className="font-mono">${selectedCabForBooking.baseFare}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Est. Distance (25 km avg)</span>
                    <span className="font-mono">${selectedCabForBooking.pricePerKm * 25}</span>
                  </div>
                  <div className="flex justify-between font-bold text-white text-sm pt-2 border-t border-slate-800">
                    <span>Total Fare</span>
                    <span className="font-mono text-cyan-400">${selectedCabForBooking.baseFare + selectedCabForBooking.pricePerKm * 25}</span>
                  </div>
                </div>

                <button type="submit" className="w-full btn-primary justify-center py-3">
                  <ShieldCheck className="w-5 h-5" /> Confirm Cab Booking
                </button>
              </form>
            ) : (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40">
                  <Check className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white">Cab Ride Reserved!</h3>
                <p className="text-xs text-slate-400">
                  Driver <strong className="text-white">{selectedCabForBooking.driverName}</strong> will meet you at {pickupLoc}. Voucher saved to itinerary.
                </p>
                <button onClick={() => setSelectedCabForBooking(null)} className="btn-secondary">Close</button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
