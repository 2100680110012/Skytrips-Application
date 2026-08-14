import React from 'react';
import { Plane, Car, Building2, Ticket, CheckCircle2 } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, cart, selectedFlight, allFlights, allCabs, allHotels } = useBooking();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 mb-6 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveTab('flights')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <Plane className="w-6 h-6 text-white transform -rotate-12 group-hover:rotate-0 transition-transform duration-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white font-['Outfit']">SkyTrips</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono font-semibold">
                  HUB 360
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <span>Integrated Flights, Cabs & Hotels</span>
              </p>
            </div>
          </div>

          {/* Connected Page Navigation Pushbuttons */}
          <nav className="hidden md:flex items-center gap-2 bg-slate-900/70 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('flights')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === 'flights'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Plane className="w-4 h-4" />
              <span>Flights</span>
              <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-slate-800 text-blue-300 font-mono">
                {allFlights.length ? `${(allFlights.length / 1000).toFixed(1)}k+` : '10k+'}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('cabs')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === 'cabs'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>Airport Cabs</span>
              <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-slate-800 text-cyan-300 font-mono">
                {allCabs.length ? `${(allCabs.length / 1000).toFixed(1)}k+` : '5k+'}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('hotels')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === 'hotels'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Nearby Hotels</span>
              <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-slate-800 text-amber-300 font-mono">
                {allHotels.length ? `${(allHotels.length / 1000).toFixed(1)}k+` : '5k+'}
              </span>
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Itinerary Cart Pushbutton */}
            <button
              onClick={() => setActiveTab('itinerary')}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                activeTab === 'itinerary'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-slate-800/80 text-slate-200 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <Ticket className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">My Trip</span>
              {cart.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center animate-pulse">
                  {cart.length}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* Selected Flight Recommendation Banner if active */}
        {selectedFlight && (
          <div className="py-2 px-4 mb-2 bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/30 rounded-xl flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                Selected Flight: <strong className="text-white">{selectedFlight.flightNumber}</strong> ({selectedFlight.origin.code} ➔ {selectedFlight.destination.code}) arriving in {selectedFlight.destination.city}.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('cabs')}
                className="btn-pushbutton text-xs py-1 px-3"
              >
                <Car className="w-3.5 h-3.5" /> Book Cab at {selectedFlight.destination.code}
              </button>
              <button
                onClick={() => setActiveTab('hotels')}
                className="btn-pushbutton text-xs py-1 px-3"
              >
                <Building2 className="w-3.5 h-3.5" /> Book Hotel near {selectedFlight.destination.code}
              </button>
            </div>
          </div>
        )}

      </div>
    </header>
  );
};
