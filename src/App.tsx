import React from 'react';
import { BookingProvider, useBooking } from './context/BookingContext';
import { Navbar } from './components/Navbar';
import { FlightSearch } from './components/Flights/FlightSearch';
import { CabSearch } from './components/Cabs/CabSearch';
import { HotelSearch } from './components/Hotels/HotelSearch';
import { ItineraryView } from './components/Itinerary/ItineraryView';
import { Plane, Car, Building2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, isLoadingData, allFlights, allCabs, allHotels } = useBooking();

  if (isLoadingData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 text-white space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
          <Plane className="w-6 h-6 text-blue-400 absolute inset-0 m-auto" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold font-['Outfit']">Loading SkyTrips Hub Engine...</h2>
          <p className="text-xs text-slate-400 font-mono">
            Indexing 30,000+ global flights, 5,000+ cabs, and 5,000+ airport hotels
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {activeTab === 'flights' && <FlightSearch />}
          {activeTab === 'cabs' && <CabSearch />}
          {activeTab === 'hotels' && <HotelSearch />}
          {activeTab === 'itinerary' && <ItineraryView />}
        </main>
      </div>

      {/* Footer */}
      <footer className="glass-panel border-t border-slate-800/80 py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                  <Plane className="w-4 h-4 transform -rotate-45" />
                </div>
                <span className="font-bold text-lg text-white font-['Outfit']">SkyTrips Hub</span>
              </div>
              <p className="text-xs text-slate-400">
                Connected Travel Platform featuring massive live datasets for flights, airport cab transfers, and nearby hotels.
              </p>
            </div>

            {/* Quick Connected Pushbuttons */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 mb-3">Service Modules</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button onClick={() => setActiveTab('flights')} className="text-slate-400 hover:text-blue-400 flex items-center gap-2">
                    <Plane className="w-3.5 h-3.5" /> Flight Booking Page (30,000+ Flights)
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('cabs')} className="text-slate-400 hover:text-cyan-400 flex items-center gap-2">
                    <Car className="w-3.5 h-3.5" /> Airport Cab Booking Page (5,200+ Cabs)
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('hotels')} className="text-slate-400 hover:text-amber-400 flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5" /> Nearby Hotel Booking Page (5,200+ Hotels)
                  </button>
                </li>
              </ul>
            </div>

            {/* Platform Stats */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 mb-3">Live Dataset Index</h4>
              <div className="space-y-2 text-xs text-slate-300 font-mono">
                <div className="flex justify-between p-2 rounded bg-slate-900 border border-slate-800">
                  <span>Flights Indexed</span>
                  <span className="text-blue-400 font-bold">{allFlights.length.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-900 border border-slate-800">
                  <span>Cabs Ready</span>
                  <span className="text-cyan-400 font-bold">{allCabs.length.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-900 border border-slate-800">
                  <span>Hotels Near Airports</span>
                  <span className="text-amber-400 font-bold">{allHotels.length.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* System Info */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 mb-1">Architecture</h4>
              <p className="text-xs text-slate-400">
                Synchronized cross-module booking engine with instant filter indexing and localized itinerary persistence.
              </p>
              <div className="text-[11px] text-slate-500 font-mono">
                Status: Operational • Latency: &lt;5ms
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-500">
            <div>© 2026 SkyTrips Hub Platform. All rights reserved.</div>
            <div className="flex items-center gap-1">
              <span>Built with React, Vite & Modern Glassmorphism</span>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BookingProvider>
      <AppContent />
    </BookingProvider>
  );
};

export default App;
