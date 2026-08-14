import React, { useState } from 'react';
import { X, Plane, Check, Car, Building2, User, ShieldCheck, Sparkles } from 'lucide-react';
import { Flight, PassengerInfo } from '../../types';
import { useBooking } from '../../context/BookingContext';

interface Props {
  flight: Flight;
  onClose: () => void;
}

export const SeatSelectionModal: React.FC<Props> = ({ flight, onClose }) => {
  const { bookFlight, crossBookFromFlight } = useBooking();
  
  const [selectedSeat, setSelectedSeat] = useState<string>('12A');
  const [passenger, setPassenger] = useState<PassengerInfo>({
    fullName: 'Gaurav Kumar',
    email: 'gaurav.traveler@example.com',
    phone: '+1 (555) 234-5678',
    passportNumber: 'A98765432'
  });
  
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Generate mock cabin seat grid layout
  const rows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18];
  const columns = ['A', 'B', 'C', '', 'D', 'E', 'F'];
  
  // Hardcoded occupied seats for realism
  const occupiedSeats = new Set(['1A', '2C', '3D', '5B', '6E', '8F', '10A', '11C', '14B', '15E']);

  const handleSeatClick = (seatCode: string) => {
    if (occupiedSeats.has(seatCode)) return;
    setSelectedSeat(seatCode);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeat) return;
    bookFlight(flight, selectedSeat, passenger);
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl glass-panel border border-slate-700 rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto my-auto shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Plane className="w-6 h-6 transform -rotate-45" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
                <span>Select Seats & Confirm Flight</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-mono">
                  {flight.flightNumber}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {flight.origin.city} ({flight.origin.code}) ➔ {flight.destination.city} ({flight.destination.code}) • {flight.cabinClass}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Col: Seat Selector Grid */}
            <div className="lg:col-span-7 bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80">
              <div className="flex items-center justify-between mb-4 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Cabin Layout ({flight.aircraft})</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-600"></span> Selected</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-700"></span> Available</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-800/50 opacity-40"></span> Taken</span>
                </div>
              </div>

              {/* Nose Indicator */}
              <div className="w-full text-center py-2 mb-4 bg-slate-800/40 rounded-xl border border-dashed border-slate-700 text-xs text-slate-400 font-mono">
                ▲ COCKPIT / FRONT OF AIRCRAFT ▲
              </div>

              {/* Seat Map */}
              <div className="space-y-2 max-h-64 overflow-y-auto p-2 border border-slate-800/50 rounded-xl bg-slate-950/40">
                {rows.map(row => (
                  <div key={row} className="flex items-center justify-center gap-2">
                    <span className="w-5 text-right font-mono text-xs text-slate-500 font-bold">{row}</span>
                    {columns.map((col, colIdx) => {
                      if (col === '') return <div key={`aisle-${colIdx}`} className="w-6 text-center text-xs text-slate-600">||</div>;

                      const seatCode = `${row}${col}`;
                      const isOccupied = occupiedSeats.has(seatCode);
                      const isSelected = selectedSeat === seatCode;

                      return (
                        <button
                          key={seatCode}
                          type="button"
                          disabled={isOccupied}
                          onClick={() => handleSeatClick(seatCode)}
                          className={`w-9 h-9 rounded-lg font-mono text-xs font-semibold flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white ring-2 ring-blue-400 shadow-lg shadow-blue-500/40 scale-105'
                              : isOccupied
                              ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed border border-slate-800'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                          }`}
                        >
                          {col}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 rounded-xl bg-blue-950/30 border border-blue-500/20 text-xs text-blue-300 flex items-center justify-between">
                <span>Selected Seat: <strong className="text-white text-sm font-mono">{selectedSeat}</strong></span>
                <span>Extra Legroom: Included</span>
              </div>
            </div>

            {/* Right Col: Passenger Details & Summary */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-400" /> Passenger Details
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      required
                      value={passenger.fullName}
                      onChange={e => setPassenger({ ...passenger, fullName: e.target.value })}
                      className="input-control"
                      placeholder="John Doe"
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
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
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
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Passport / ID No</label>
                      <input
                        type="text"
                        value={passenger.passportNumber}
                        onChange={e => setPassenger({ ...passenger, passportNumber: e.target.value })}
                        className="input-control"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing & Submit */}
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Total Ticket Fare</span>
                  <span className="text-2xl font-extrabold text-white font-mono">${flight.price}</span>
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary justify-center py-3 text.base"
                >
                  <ShieldCheck className="w-5 h-5" /> Confirm & Book Ticket
                </button>
              </div>

            </div>
          </form>
          ) : (
            /* Booking Confirmed view with Cross-booking pushbuttons */
            <div className="py-8 text-center space-y-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white font-['Outfit']">Flight Ticket Confirmed!</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Boarding Pass generated for seat <span className="text-emerald-400 font-bold font-mono">{selectedSeat}</span>. Added to your itinerary.
                </p>
              </div>

              {/* Pushbuttons to immediately book Cabs & Hotels */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 border border-indigo-500/30 text-left space-y-4">
                <div className="flex items-center gap-2 text-indigo-300 font-semibold text-sm">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Next Steps for Your Trip to {flight.destination.city} ({flight.destination.code}):</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      crossBookFromFlight(flight, 'cab');
                      onClose();
                    }}
                    className="btn-pushbutton justify-center py-3 px-4 text-sm"
                  >
                    <Car className="w-4 h-4 text-cyan-400" /> Book Airport Cab at {flight.destination.code}
                  </button>

                  <button
                    onClick={() => {
                      crossBookFromFlight(flight, 'hotel');
                      onClose();
                    }}
                    className="btn-pushbutton justify-center py-3 px-4 text-sm"
                  >
                    <Building2 className="w-4 h-4 text-amber-400" /> Book Nearby Hotel at {flight.destination.code}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={onClose}
                  className="btn-secondary"
                >
                  Done & Close
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
  );
};



