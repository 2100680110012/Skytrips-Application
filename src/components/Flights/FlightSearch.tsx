import React, { useState, useMemo, useEffect } from 'react';
import { Plane, ArrowRightLeft, Filter, Clock, ShieldCheck, Car, Building2, ChevronLeft, ChevronRight, AlertCircle, Radio, Activity, Compass, Navigation, RefreshCw, X } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { AIRPORTS, AIRLINES, fetchRealtimeFlightStatus } from '../../services/dataGenerator';
import { Flight, RealtimeTelemetry } from '../../types';
import { SeatSelectionModal } from './SeatSelectionModal';

export const FlightSearch: React.FC = () => {
  const { allFlights, flightFilter, setFlightFilter, resetFlightFilter, setSeatModalFlight, seatModalFlight, crossBookFromFlight } = useBooking();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;

  // Real-time Flight Radar Telemetry State
  const [radarFlight, setRadarFlight] = useState<Flight | null>(null);
  const [telemetry, setTelemetry] = useState<RealtimeTelemetry | null>(null);
  const [isFetchingTelemetry, setIsFetchingTelemetry] = useState<boolean>(false);

  const loadTelemetry = async (flight: Flight) => {
    setIsFetchingTelemetry(true);
    const data = await fetchRealtimeFlightStatus(flight.flightNumber, flight.origin.code, flight.destination.code);
    setTelemetry(data);
    setIsFetchingTelemetry(false);
  };

  const openRadarModal = (flight: Flight) => {
    setRadarFlight(flight);
    loadTelemetry(flight);
  };

  useEffect(() => {
    if (!radarFlight) return;
    const interval = setInterval(() => {
      loadTelemetry(radarFlight);
    }, 6000);
    return () => clearInterval(interval);
  }, [radarFlight]);

  // Perform dynamic high-speed filtering across 10,000+ flights
  const filteredFlights = useMemo(() => {
    let list = allFlights;

    if (flightFilter.originCode) {
      list = list.filter(f => f.origin.code === flightFilter.originCode);
    }

    if (flightFilter.destinationCode) {
      list = list.filter(f => f.destination.code === flightFilter.destinationCode);
    }

    if (flightFilter.cabinClass !== 'All') {
      list = list.filter(f => f.cabinClass === flightFilter.cabinClass);
    }

    if (flightFilter.maxPrice) {
      list = list.filter(f => f.price <= flightFilter.maxPrice);
    }

    if (flightFilter.stops !== 'all') {
      const stopsNum = parseInt(flightFilter.stops, 10);
      if (!isNaN(stopsNum)) {
        list = list.filter(f => f.stops === stopsNum);
      }
    }

    if (flightFilter.airlines.length > 0) {
      list = list.filter(f => flightFilter.airlines.includes(f.airline));
    }

    // Sort
    return [...list].sort((a, b) => {
      if (flightFilter.sortBy === 'price_asc') return a.price - b.price;
      if (flightFilter.sortBy === 'price_desc') return b.price - a.price;
      if (flightFilter.sortBy === 'duration_asc') return a.durationMinutes - b.durationMinutes;
      if (flightFilter.sortBy === 'departure_asc') return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
      return 0;
    });
  }, [allFlights, flightFilter]);

  // Reset page on filter change
  const totalPages = Math.ceil(filteredFlights.length / pageSize) || 1;
  const paginatedFlights = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredFlights.slice(start, start + pageSize);
  }, [filteredFlights, currentPage, pageSize]);

  const handleSwapAirports = () => {
    setFlightFilter(prev => ({
      ...prev,
      originCode: prev.destinationCode,
      destinationCode: prev.originCode
    }));
  };

  const toggleAirline = (airlineName: string) => {
    setFlightFilter(prev => {
      const exists = prev.airlines.includes(airlineName);
      const updated = exists ? prev.airlines.filter(a => a !== airlineName) : [...prev.airlines, airlineName];
      return { ...prev, airlines: updated };
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Hero Banner & Search Form */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-blue-500/20 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-blue-950/40 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-3xl mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Plane className="w-3.5 h-3.5" /> 10,000+ Real-Time Flights Indexed
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Outfit']">
            Search Global Flights & Connect Transfer Services
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Explore routes across 35 major airport hubs worldwide. Book your flight and instantly connect airport cabs and nearby hotels.
          </p>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
          
          {/* Origin */}
          <div className="lg:col-span-3">
            <label className="block text-xs font-medium text-slate-400 mb-1">From (Origin)</label>
            <select
              value={flightFilter.originCode}
              onChange={e => {
                setFlightFilter(prev => ({ ...prev, originCode: e.target.value }));
                setCurrentPage(1);
              }}
              className="select-control font-semibold"
            >
              <option value="">Any Origin (All Hubs)</option>
              {AIRPORTS.map(ap => (
                <option key={ap.code} value={ap.code}>
                  {ap.city} ({ap.code}) - {ap.name}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="lg:col-span-1 flex items-end justify-center py-1 sm:py-0">
            <button
              onClick={handleSwapAirports}
              title="Swap Origin and Destination"
              className="p-2.5 rounded-xl bg-slate-800 text-blue-400 hover:bg-slate-700 hover:text-white transition-all border border-slate-700"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Destination */}
          <div className="lg:col-span-3">
            <label className="block text-xs font-medium text-slate-400 mb-1">To (Destination)</label>
            <select
              value={flightFilter.destinationCode}
              onChange={e => {
                setFlightFilter(prev => ({ ...prev, destinationCode: e.target.value }));
                setCurrentPage(1);
              }}
              className="select-control font-semibold"
            >
              <option value="">Any Destination (All Hubs)</option>
              {AIRPORTS.map(ap => (
                <option key={ap.code} value={ap.code}>
                  {ap.city} ({ap.code}) - {ap.name}
                </option>
              ))}
            </select>
          </div>

          {/* Cabin Class */}
          <div className="lg:col-span-3">
            <label className="block text-xs font-medium text-slate-400 mb-1">Cabin Class</label>
            <select
              value={flightFilter.cabinClass}
              onChange={e => {
                setFlightFilter(prev => ({ ...prev, cabinClass: e.target.value as any }));
                setCurrentPage(1);
              }}
              className="select-control font-semibold"
            >
              <option value="All">All Cabin Classes</option>
              <option value="Economy">Economy</option>
              <option value="Premium Economy">Premium Economy</option>
              <option value="Business">Business Class</option>
              <option value="First Class">First Class</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-slate-400 mb-1">Sort By</label>
            <select
              value={flightFilter.sortBy}
              onChange={e => setFlightFilter(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="select-control"
            >
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="duration_asc">Shortest Duration</option>
              <option value="departure_asc">Earliest Departure</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main Results Layout: Sidebar + Flight Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Filter Sidebar */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-white flex items-center gap-2 font-['Outfit']">
                <Filter className="w-4 h-4 text-blue-400" /> Refine Search
              </span>
              <button
                onClick={resetFlightFilter}
                className="text-xs text-blue-400 hover:underline"
              >
                Reset All
              </button>
            </div>

            {/* Max Price Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Max Ticket Price</span>
                <span className="font-bold text-white font-mono">₹{flightFilter.maxPrice.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="2000"
                max="85000"
                step="500"
                value={flightFilter.maxPrice}
                onChange={e => setFlightFilter(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                className="w-full accent-blue-500 bg-slate-800"
              />
            </div>

            {/* Stops Filter */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Stops / Connections</label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
                {[
                  { label: 'All', val: 'all' },
                  { label: 'Direct', val: '0' },
                  { label: '1 Stop', val: '1' }
                ].map(opt => (
                  <button
                    key={opt.val}
                    onClick={() => setFlightFilter(prev => ({ ...prev, stops: opt.val }))}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      flightFilter.stops === opt.val
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Airlines Checkboxes */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Airlines ({AIRLINES.length})</label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {AIRLINES.map(airline => {
                  const checked = flightFilter.airlines.includes(airline.name);
                  return (
                    <label
                      key={airline.code}
                      className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer select-none py-1"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAirline(airline.name)}
                        className="rounded border-slate-700 bg-slate-800 text-blue-500 accent-blue-500"
                      />
                      <span>{airline.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

          </div>
        </aside>

        {/* Right Flights List */}
        <main className="lg:col-span-9 space-y-4">
          
          {/* Results Summary Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-2 text-xs text-slate-400">
            <div>
              Showing <strong className="text-white">{filteredFlights.length}</strong> matching flights out of <strong className="text-slate-300">{allFlights.length.toLocaleString()}</strong> indexed.
            </div>
            <div className="flex items-center gap-2">
              <span>Page {currentPage} of {totalPages}</span>
            </div>
          </div>

          {/* Flights Cards */}
          {paginatedFlights.length > 0 ? (
            <div className="space-y-4">
              {paginatedFlights.map(flight => (
                <div
                  key={flight.id}
                  className="glass-card p-5 sm:p-6 rounded-2xl space-y-4 hover:border-blue-500/40 transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    
                    {/* Airline Badge */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs font-mono shadow-md"
                        style={{ backgroundColor: flight.airlineColor }}
                      >
                        {flight.airlineCode}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-base">{flight.airline}</h4>
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {flight.flightNumber}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          {flight.aircraft} • Gate {flight.gate} ({flight.terminal})
                        </p>
                      </div>
                    </div>

                    {/* Price & Seats */}
                    <div className="text-right">
                      <div className="text-2xl font-extrabold text-white font-mono">₹{flight.price.toLocaleString()}</div>
                      <span className="text-xs text-emerald-400 font-medium">
                        {flight.availableSeats} seats left
                      </span>
                    </div>

                  </div>

                  {/* Flight Timeline Route */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center py-3 border-y border-slate-800/80">
                    
                    {/* Origin */}
                    <div className="sm:col-span-4 space-y-1">
                      <div className="text-xl font-extrabold text-white font-mono">
                        {new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-sm font-semibold text-slate-200">
                        {flight.origin.city} ({flight.origin.code})
                      </div>
                      <div className="text-xs text-slate-400">{flight.origin.name}</div>
                    </div>

                    {/* Flight Path Graphic */}
                    <div className="sm:col-span-4 text-center space-y-1 py-2 sm:py-0">
                      <div className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        {Math.floor(flight.durationMinutes / 60)}h {flight.durationMinutes % 60}m
                      </div>

                      <div className="relative flex items-center justify-center my-1">
                        <div className="w-full border-t border-slate-700 border-dashed"></div>
                        <Plane className="w-4 h-4 text-blue-400 absolute bg-slate-900 px-0.5 transform rotate-90" />
                      </div>

                      <div className="text-xs">
                        {flight.stops === 0 ? (
                          <span className="badge badge-green">Direct Non-Stop</span>
                        ) : (
                          <span className="badge badge-gold">{flight.stops} Stop ({flight.stopoverAirport})</span>
                        )}
                      </div>
                    </div>

                    {/* Destination */}
                    <div className="sm:col-span-4 text-left sm:text-right space-y-1">
                      <div className="text-xl font-extrabold text-white font-mono">
                        {new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-sm font-semibold text-slate-200">
                        {flight.destination.city} ({flight.destination.code})
                      </div>
                      <div className="text-xs text-slate-400">{flight.destination.name}</div>
                    </div>

                  </div>

                  {/* Connected Action Pushbuttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => openRadarModal(flight)}
                        className="btn-pushbutton border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-1.5"
                        title="Track Live Real-time Telemetry & Radar Position"
                      >
                        <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Live Telemetry
                      </button>

                      <button
                        onClick={() => crossBookFromFlight(flight, 'cab')}
                        className="btn-pushbutton"
                        title={`Book Cab transfer at ${flight.destination.code}`}
                      >
                        <Car className="w-3.5 h-3.5 text-cyan-400" /> Book Cab at {flight.destination.code}
                      </button>

                      <button
                        onClick={() => crossBookFromFlight(flight, 'hotel')}
                        className="btn-pushbutton"
                        title={`Book Hotel near ${flight.destination.code}`}
                      >
                        <Building2 className="w-3.5 h-3.5 text-amber-400" /> Book Hotel at {flight.destination.code}
                      </button>
                    </div>

                    <button
                      onClick={() => setSeatModalFlight(flight)}
                      className="btn-primary py-2 px-5 text-sm"
                    >
                      <ShieldCheck className="w-4 h-4" /> Book Seat & Ticket
                    </button>

                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel p-12 text-center space-y-4 rounded-2xl">
              <AlertCircle className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Flights Match Your Criteria</h3>
              <p className="text-sm text-slate-400">Try adjusting your price range or airline filters.</p>
              <button onClick={resetFlightFilter} className="btn-secondary">
                Reset All Filters
              </button>
            </div>
          )}

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="btn-secondary py-2 px-4 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <div className="flex items-center gap-1 font-mono text-xs text-slate-300">
                <span>Page</span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={currentPage}
                  onChange={e => setCurrentPage(Math.min(totalPages, Math.max(1, Number(e.target.value))))}
                  className="w-12 text-center bg-slate-900 border border-slate-700 rounded py-1 font-bold text-white"
                />
                <span>of {totalPages}</span>
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="btn-secondary py-2 px-4 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </main>

      </div>

      {/* Seat Selection Modal */}
      {seatModalFlight && (
        <SeatSelectionModal
          flight={seatModalFlight}
          onClose={() => setSeatModalFlight(null)}
        />
      )}

      {/* Real-time Radar & Telemetry Modal */}
      {radarFlight && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-xl p-6 rounded-2xl border border-emerald-500/30 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                    {radarFlight.flightNumber} Live Flight Telemetry
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  {radarFlight.airline} • {radarFlight.origin.code} ({radarFlight.origin.city}) → {radarFlight.destination.code} ({radarFlight.destination.city})
                </p>
              </div>

              <button
                onClick={() => setRadarFlight(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Flight Progress Visualizer */}
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
                <span>DEP: {radarFlight.origin.code}</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" />
                  {telemetry ? telemetry.status : 'LOCATING...'}
                </span>
                <span>ARR: {radarFlight.destination.code}</span>
              </div>

              <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-700"
                  style={{ width: `${telemetry ? telemetry.progressPercent : 0}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>Progress: {telemetry ? `${telemetry.progressPercent}%` : '0%'}</span>
                <span>Gate: {radarFlight.gate} ({radarFlight.terminal})</span>
              </div>
            </div>

            {/* Telemetry Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-blue-400" /> Altitude
                </div>
                <div className="text-lg font-bold font-mono text-white">
                  {telemetry ? `${telemetry.altitudeFt.toLocaleString()} ft` : '--'}
                </div>
              </div>

              <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" /> Airspeed
                </div>
                <div className="text-lg font-bold font-mono text-white">
                  {telemetry ? `${telemetry.speedKnots} kts` : '--'}
                </div>
              </div>

              <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-amber-400" /> Heading
                </div>
                <div className="text-lg font-bold font-mono text-white">
                  {telemetry ? `${telemetry.heading}°` : '--'}
                </div>
              </div>

              <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 text-cyan-400" /> GPS Lat / Lon
                </div>
                <div className="text-xs font-bold font-mono text-slate-200 truncate">
                  {telemetry ? `${telemetry.lat}, ${telemetry.lon}` : '--'}
                </div>
              </div>
            </div>

            {/* Live Ticker & Footer */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isFetchingTelemetry ? 'animate-spin' : ''}`} />
                <span>Last telemetry sync: <strong className="text-slate-200">{telemetry?.lastUpdated || 'Syncing...'}</strong></span>
              </div>
              <span className="badge badge-blue text-[10px]">
                {telemetry?.dataSource || 'SkyTrips Radar Physics'}
              </span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
