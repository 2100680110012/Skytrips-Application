import React from 'react';
import { Ticket, Plane, Car, Building2, Trash2 } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';

export const ItineraryView: React.FC = () => {
  const { cart, cancelBooking, clearAllBookings, setActiveTab } = useBooking();

  const totalCost = cart.reduce((acc, item) => acc + item.totalPrice, 0);

  const flightBookings = cart.filter(item => item.type === 'flight');
  const cabBookings = cart.filter(item => item.type === 'cab');
  const hotelBookings = cart.filter(item => item.type === 'hotel');

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-indigo-950/40 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Ticket className="w-3.5 h-3.5" /> Unified Travel Itinerary
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-['Outfit']">
            My Confirmed Bookings & E-Tickets
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your synchronized Flight Boarding Passes, Airport Cab Vouchers, and Hotel Reservations.
          </p>
        </div>

        {cart.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="text-right mr-2">
              <div className="text-xs text-slate-400">Grand Total</div>
              <div className="text-2xl font-extrabold text-white font-mono">${totalCost}</div>
            </div>
            <button
              onClick={clearAllBookings}
              className="btn-secondary py-2 px-3 text-xs text-rose-400 hover:bg-rose-950/40 border-rose-500/30"
            >
              <Trash2 className="w-4 h-4" /> Clear All
            </button>
          </div>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="glass-panel p-16 text-center space-y-5 rounded-3xl border border-slate-800">
          <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <Ticket className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-['Outfit']">Your Travel Itinerary is Empty</h3>
            <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
              Start by searching from our 10,000+ flights dataset, 5,000+ airport cabs, or 5,000+ nearby hotels.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button onClick={() => setActiveTab('flights')} className="btn-primary">
              <Plane className="w-4 h-4" /> Search 10k+ Flights
            </button>
            <button onClick={() => setActiveTab('cabs')} className="btn-secondary">
              <Car className="w-4 h-4" /> Search 5k+ Cabs
            </button>
            <button onClick={() => setActiveTab('hotels')} className="btn-secondary">
              <Building2 className="w-4 h-4" /> Search 5k+ Hotels
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Flight Boarding Passes */}
          {flightBookings.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 font-['Outfit']">
                <Plane className="w-5 h-5 text-blue-400" /> Flight Boarding Passes ({flightBookings.length})
              </h2>

              <div className="space-y-4">
                {flightBookings.map(item => {
                  const fl = item.flightDetails?.flight;
                  if (!fl) return null;

                  return (
                    <div
                      key={item.id}
                      className="glass-panel p-6 rounded-2xl border-l-4 border-l-blue-500 space-y-4 relative overflow-hidden"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs font-mono"
                            style={{ backgroundColor: fl.airlineColor }}
                          >
                            {fl.airlineCode}
                          </div>
                          <div>
                            <div className="font-bold text-white text-base">{fl.airline} • {fl.flightNumber}</div>
                            <div className="text-xs text-slate-400">Ref: <strong className="font-mono text-blue-400">{item.bookingRef}</strong> • Seat: <strong className="font-mono text-emerald-400">{item.flightDetails?.selectedSeat}</strong></div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="badge badge-green">Confirmed</span>
                          <button
                            onClick={() => cancelBooking(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Route specs */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm py-2">
                        <div>
                          <div className="text-xs text-slate-400">Origin Departure</div>
                          <div className="font-bold text-white font-mono text-lg">
                            {new Date(fl.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="text-slate-300 font-semibold">{fl.origin.city} ({fl.origin.code})</div>
                        </div>

                        <div className="text-center">
                          <div className="text-xs text-slate-400">Aircraft & Terminal</div>
                          <div className="font-semibold text-slate-200">{fl.aircraft}</div>
                          <div className="text-xs text-blue-400">Terminal {fl.terminal} • Gate {fl.gate}</div>
                        </div>

                        <div className="text-left sm:text-right">
                          <div className="text-xs text-slate-400">Destination Arrival</div>
                          <div className="font-bold text-white font-mono text-lg">
                            {new Date(fl.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="text-slate-300 font-semibold">{fl.destination.city} ({fl.destination.code})</div>
                        </div>
                      </div>

                      {/* Passenger & Price */}
                      <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
                        <div>Passenger: <strong className="text-white">{item.passenger.fullName}</strong> ({item.passenger.email})</div>
                        <div className="font-extrabold text-white text-base font-mono">${item.totalPrice}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cab Vouchers */}
          {cabBookings.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 font-['Outfit']">
                <Car className="w-5 h-5 text-cyan-400" /> Airport Cab Vouchers ({cabBookings.length})
              </h2>

              <div className="space-y-4">
                {cabBookings.map(item => {
                  const cab = item.cabDetails?.cab;
                  if (!cab) return null;

                  return (
                    <div
                      key={item.id}
                      className="glass-panel p-6 rounded-2xl border-l-4 border-l-cyan-500 space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            <Car className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-white text-base">{cab.vehicleModel} ({cab.type})</div>
                            <div className="text-xs text-slate-400">Ref: <strong className="font-mono text-cyan-400">{item.bookingRef}</strong> • Driver: {cab.driverName}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="badge badge-cyan">Confirmed</span>
                          <button
                            onClick={() => cancelBooking(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
                        <div>
                          <div className="text-slate-400">Pickup Terminal</div>
                          <div className="font-semibold text-white">{item.cabDetails?.pickupLocation}</div>
                        </div>
                        <div>
                          <div className="text-slate-400">Dropoff Destination</div>
                          <div className="font-semibold text-white">{item.cabDetails?.dropoffLocation}</div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex justify-between text-xs">
                        <span className="text-slate-400">Rider: {item.passenger.fullName}</span>
                        <span className="font-extrabold text-white text-base font-mono">${item.totalPrice}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Hotel Reservations */}
          {hotelBookings.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 font-['Outfit']">
                <Building2 className="w-5 h-5 text-amber-400" /> Hotel Reservations ({hotelBookings.length})
              </h2>

              <div className="space-y-4">
                {hotelBookings.map(item => {
                  const hotel = item.hotelDetails?.hotel;
                  const room = item.hotelDetails?.selectedRoom;
                  if (!hotel) return null;

                  return (
                    <div
                      key={item.id}
                      className="glass-panel p-6 rounded-2xl border-l-4 border-l-amber-500 space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-white text-base">{hotel.name}</div>
                            <div className="text-xs text-slate-400">Ref: <strong className="font-mono text-amber-400">{item.bookingRef}</strong> • {room?.name}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="badge badge-gold">Confirmed</span>
                          <button
                            onClick={() => cancelBooking(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
                        <div>
                          <div className="text-slate-400">Dates</div>
                          <div className="font-semibold text-white">{item.hotelDetails?.checkInDate} to {item.hotelDetails?.checkOutDate} ({item.hotelDetails?.nights} nights)</div>
                        </div>
                        <div>
                          <div className="text-slate-400">Airport Proximity & Shuttle</div>
                          <div className="font-semibold text-white">{hotel.distanceKmToAirport} km from {hotel.airportCode} • 24/7 Shuttle Active</div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex justify-between text-xs">
                        <span className="text-slate-400">Primary Guest: {item.passenger.fullName}</span>
                        <span className="font-extrabold text-white text-base font-mono">${item.totalPrice}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
