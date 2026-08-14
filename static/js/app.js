// SkyTrips Integrated Travel Hub Engine — Vanilla JS + Python Flask REST API

document.addEventListener('DOMContentLoaded', () => {
  
  // State Store
  const state = {
    activeTab: 'flights',
    airports: [],
    selectedFlight: null,
    cartCount: 0,
    flightFilter: {
      origin: '',
      destination: '',
      cabinClass: 'All',
      stops: 'all',
      maxPrice: 75000,
      sortBy: 'price_asc',
      page: 1
    },
    cabFilter: {
      airport: '',
      type: 'All',
      passengers: 1,
      maxFare: 3000,
      sortBy: 'price_asc',
      page: 1
    },
    hotelFilter: {
      airport: '',
      maxDistance: 20,
      minStars: 3,
      maxPrice: 20000,
      shuttleOnly: 0,
      sortBy: 'distance_asc',
      page: 1
    },
    activeModalItem: null,
    selectedSeat: '12A'
  };

  // DOM Cache
  const navBtns = document.querySelectorAll('.nav-btn, .btn-itinerary');
  const tabSections = document.querySelectorAll('.tab-section');

  const selectionBanner = document.getElementById('selection-banner');
  const bannerText = document.getElementById('banner-text');
  const btnBannerCab = document.getElementById('btn-banner-cab');
  const btnBannerHotel = document.getElementById('btn-banner-hotel');

  const cartBadge = document.getElementById('cart-badge-count');

  // Modals
  const modalSeat = document.getElementById('modal-seat');
  const modalCab = document.getElementById('modal-cab');
  const modalHotel = document.getElementById('modal-hotel');

  // ----------------------------------------------------
  // INITIALIZATION
  // ----------------------------------------------------
  async function initApp() {
    setupTabNavigation();
    await fetchAirports();
    setupFlightFilters();
    setupCabFilters();
    setupHotelFilters();
    setupModals();
    
    // Check initial URL path or hash to activate section directly
    const path = window.location.pathname.replace('/', '') || window.location.hash.replace('#', '');
    if (['flights', 'cabs', 'hotels', 'itinerary'].includes(path)) {
      switchTab(path);
    }

    // Initial fetch
    loadFlights();
    loadCabs();
    loadHotels();
    loadItinerary();
  }


  // ----------------------------------------------------
  // TAB NAVIGATION & CROSS-BOOKING PUSHBUTTONS
  // ----------------------------------------------------
  function setupTabNavigation() {
    navBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        switchTab(tab);
      });
    });

    document.getElementById('logo-btn').addEventListener('click', () => switchTab('flights'));

    btnBannerCab.addEventListener('click', () => {
      if (state.selectedFlight) {
        document.getElementById('cab-airport').value = state.selectedFlight.dest_code;
        state.cabFilter.airport = state.selectedFlight.dest_code;
        state.cabFilter.page = 1;
        loadCabs();
      }
      switchTab('cabs');
    });

    btnBannerHotel.addEventListener('click', () => {
      if (state.selectedFlight) {
        document.getElementById('hotel-airport').value = state.selectedFlight.dest_code;
        state.hotelFilter.airport = state.selectedFlight.dest_code;
        state.hotelFilter.page = 1;
        loadHotels();
      }
      switchTab('hotels');
    });
  }

  function switchTab(tabName) {
    state.activeTab = tabName;
    
    navBtns.forEach(btn => {
      if (btn.dataset.tab === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    tabSections.forEach(sec => {
      if (sec.id === `section-${tabName}`) {
        sec.classList.remove('hidden');
        sec.classList.add('active');
      } else {
        sec.classList.add('hidden');
        sec.classList.remove('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ----------------------------------------------------
  // AIRPORTS FETCH & POPULATION
  // ----------------------------------------------------
  async function fetchAirports() {
    try {
      const res = await fetch('/api/airports');
      const json = await res.json();
      if (json.status === 'success') {
        state.airports = json.data;
        initAirportAutocompletes();
      }
    } catch (err) {
      console.error('Error fetching airports:', err);
    }
  }

  function initAirportAutocompletes() {
    setupAutocomplete('flight-origin-text', 'flight-origin', 'flight-origin-results', () => {
      state.flightFilter.origin = document.getElementById('flight-origin').value;
      state.flightFilter.page = 1;
      loadFlights();
    });

    setupAutocomplete('flight-dest-text', 'flight-destination', 'flight-dest-results', () => {
      state.flightFilter.destination = document.getElementById('flight-destination').value;
      state.flightFilter.page = 1;
      loadFlights();
    });
  }

  function setupAutocomplete(textInputId, hiddenInputId, dropdownId, onSelect) {
    const input = document.getElementById(textInputId);
    const hidden = document.getElementById(hiddenInputId);
    const dropdown = document.getElementById(dropdownId);

    if (!input || !dropdown) return;

    input.addEventListener('input', (e) => {
      const val = e.target.value.trim().toLowerCase();
      if (!val) {
        hidden.value = '';
        dropdown.innerHTML = '';
        dropdown.classList.add('hidden');
        if (onSelect) onSelect();
        return;
      }

      // Filter all 163 Indian Airports by city, code, or airport name
      const matches = state.airports.filter(ap => 
        ap.city.toLowerCase().includes(val) || 
        ap.code.toLowerCase().includes(val) || 
        ap.name.toLowerCase().includes(val)
      ).slice(0, 15);

      if (matches.length === 0) {
        dropdown.innerHTML = '<div class="autocomplete-item" style="color:#94a3b8; font-size:0.8rem;">No matching Indian airports found</div>';
        dropdown.classList.remove('hidden');
        return;
      }

      dropdown.innerHTML = matches.map(ap => `
        <div class="autocomplete-item" data-code="${ap.code}" data-display="${ap.city} (${ap.code})">
          <div>
            <div class="city-name">${ap.city} 🇮🇳</div>
            <div class="airport-details">${ap.name}</div>
          </div>
          <span class="code-badge">${ap.code}</span>
        </div>
      `).join('');

      dropdown.classList.remove('hidden');

      dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
        item.addEventListener('click', () => {
          const code = item.dataset.code;
          const display = item.dataset.display;
          input.value = display;
          hidden.value = code;
          dropdown.classList.add('hidden');
          if (onSelect) onSelect();
        });
      });
    });

    // Close dropdown when user clicks away
    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    });
  }


  // ----------------------------------------------------
  // 1. FLIGHTS MODULE
  // ----------------------------------------------------
  function setupFlightFilters() {
    const origin = document.getElementById('flight-origin');
    const dest = document.getElementById('flight-destination');
    const flightDate = document.getElementById('flight-date');
    const roundTripChk = document.getElementById('flight-roundtrip');
    const returnDateGroup = document.getElementById('group-return-date');
    const returnDateInput = document.getElementById('flight-return-date');
    const tripTypeLabel = document.getElementById('trip-type-label');
    const cabin = document.getElementById('flight-cabin');
    const sort = document.getElementById('flight-sort');
    const maxPrice = document.getElementById('flight-max-price');
    const priceVal = document.getElementById('price-val');
    const stopBtns = document.querySelectorAll('.btn-stop');
    const resetBtn = document.getElementById('btn-reset-flights');

    state.isRoundTrip = false;

    if (roundTripChk) {
      roundTripChk.addEventListener('change', (e) => {
        state.isRoundTrip = e.target.checked;
        if (state.isRoundTrip) {
          returnDateGroup.classList.remove('hidden');
          tripTypeLabel.textContent = '🔄 Round Trip Mode Enabled (Two-Way Flight Package)';
          tripTypeLabel.style.color = '#60a5fa';
          if (returnDateInput && !returnDateInput.value) {
            const retDate = new Date();
            retDate.setDate(retDate.getDate() + 4);
            returnDateInput.value = retDate.toISOString().split('T')[0];
            state.returnDate = returnDateInput.value;
          }
        } else {
          returnDateGroup.classList.add('hidden');
          tripTypeLabel.textContent = 'One-Way Flight Selected';
          tripTypeLabel.style.color = '#94a3b8';
        }
        loadFlights();
      });
    }

    if (returnDateInput) {
      returnDateInput.addEventListener('change', (e) => {
        state.returnDate = e.target.value;
        loadFlights();
      });
    }

    if (flightDate) {
      const todayIso = new Date().toISOString().split('T')[0];
      flightDate.value = todayIso;
      state.flightFilter.date = todayIso;
      flightDate.addEventListener('change', (e) => {
        state.flightFilter.date = e.target.value;
        state.flightFilter.page = 1;
        loadFlights();
      });
    }

    origin.addEventListener('change', (e) => { state.flightFilter.origin = e.target.value; state.flightFilter.page = 1; loadFlights(); });
    dest.addEventListener('change', (e) => { state.flightFilter.destination = e.target.value; state.flightFilter.page = 1; loadFlights(); });
    cabin.addEventListener('change', (e) => { state.flightFilter.cabinClass = e.target.value; state.flightFilter.page = 1; loadFlights(); });
    sort.addEventListener('change', (e) => { state.flightFilter.sortBy = e.target.value; loadFlights(); });

    maxPrice.addEventListener('input', (e) => {
      priceVal.textContent = `₹${Number(e.target.value).toLocaleString()}`;
      state.flightFilter.maxPrice = e.target.value;
      state.flightFilter.page = 1;
      loadFlights();
    });

    stopBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        stopBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.flightFilter.stops = btn.dataset.stop;
        state.flightFilter.page = 1;
        loadFlights();
      });
    });

    resetBtn.addEventListener('click', () => {
      const origText = document.getElementById('flight-origin-text');
      const destText = document.getElementById('flight-dest-text');
      if (origText) origText.value = '';
      if (destText) destText.value = '';
      origin.value = '';
      dest.value = '';
      if (flightDate) flightDate.value = '';
      if (roundTripChk) { roundTripChk.checked = false; returnDateGroup.classList.add('hidden'); }
      cabin.value = 'All';
      sort.value = 'price_asc';
      maxPrice.value = 75000;
      priceVal.textContent = '₹75,000';
      state.isRoundTrip = false;
      state.flightFilter = { origin: '', destination: '', date: '', cabinClass: 'All', stops: 'all', maxPrice: 75000, sortBy: 'price_asc', page: 1 };
      loadFlights();
    });
  }


  async function loadFlights() {
    const grid = document.getElementById('flights-cards-grid');
    const metaCount = document.getElementById('flights-meta-count');
    const pageInfo = document.getElementById('flights-page-info');
    const pagination = document.getElementById('flights-pagination');

    grid.innerHTML = '<div class="glass-panel p-8 text-center">Loading domestic Indian flights from Python backend...</div>';

    const params = new URLSearchParams({
      origin: state.flightFilter.origin,
      destination: state.flightFilter.destination,
      date: state.flightFilter.date || '',
      cabinClass: state.flightFilter.cabinClass,
      stops: state.flightFilter.stops,
      maxPrice: state.flightFilter.maxPrice,
      sortBy: state.flightFilter.sortBy,
      page: state.flightFilter.page,
      limit: 15
    });

    try {
      const res = await fetch(`/api/flights?${params}`);
      const json = await res.json();

      if (json.status === 'success') {
        const flights = json.data;
        const pg = json.pagination;

        metaCount.textContent = `Showing ${flights.length} matching ${state.isRoundTrip ? 'two-way round trip' : 'one-way'} flights out of ${pg.totalCount.toLocaleString()} indexed.`;
        pageInfo.textContent = `Page ${pg.currentPage} of ${pg.totalPages}`;

        if (flights.length === 0) {
          grid.innerHTML = '<div class="glass-panel p-8 text-center">No flights match your filters. Try adjusting price or stops.</div>';
          pagination.innerHTML = '';
          return;
        }

        grid.innerHTML = flights.map(f => renderFlightCard(f)).join('');
        renderPagination(pagination, pg, (newPage) => {
          state.flightFilter.page = newPage;
          loadFlights();
        });

        // Attach Card Button Click Listeners
        grid.querySelectorAll('.btn-select-seat').forEach(btn => {
          btn.addEventListener('click', () => {
            const flightId = btn.dataset.id;
            const flight = flights.find(item => item.id == flightId);
            openSeatModal(flight);
          });
        });

        grid.querySelectorAll('.btn-cross-cab').forEach(btn => {
          btn.addEventListener('click', () => {
            const destCode = btn.dataset.dest;
            document.getElementById('cab-airport').value = destCode;
            state.cabFilter.airport = destCode;
            state.cabFilter.page = 1;
            loadCabs();
            switchTab('cabs');
          });
        });

        grid.querySelectorAll('.btn-cross-hotel').forEach(btn => {
          btn.addEventListener('click', () => {
            const destCode = btn.dataset.dest;
            document.getElementById('hotel-airport').value = destCode;
            state.hotelFilter.airport = destCode;
            state.hotelFilter.page = 1;
            loadHotels();
            switchTab('hotels');
          });
        });

      }
    } catch (err) {
      grid.innerHTML = '<div class="glass-panel p-8 text-center text-rose-400">Failed to load flights. Please ensure Python backend is running.</div>';
    }
  }

  function renderFlightCard(f) {
    const depTime = new Date(f.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const arrTime = new Date(f.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const hours = Math.floor(f.duration_minutes / 60);
    const mins = f.duration_minutes % 60;

    const isRound = state.isRoundTrip;
    const roundTotalPrice = isRound ? Math.round(f.price * 1.85) : f.price;

    let cabinBadge = '<span class="badge-tag" style="color:#94a3b8;">Economy Class</span>';
    if (f.cabin_class === 'Premium Economy') {
      cabinBadge = '<span class="badge-tag" style="color:#38bdf8; background:rgba(56,189,248,0.15); border-color:#38bdf8;">⭐ Premium Economy</span>';
    } else if (f.cabin_class === 'Business Class') {
      cabinBadge = '<span class="badge-tag" style="color:#a855f7; background:rgba(168,85,247,0.15); border-color:#a855f7;">💼 Business Class</span>';
    } else if (f.cabin_class === 'First Class') {
      cabinBadge = '<span class="badge-tag" style="color:#f43f5e; background:rgba(244,63,94,0.15); border-color:#f43f5e;">👑 First Class Suite</span>';
    }

    const stopBadge = f.stops === 0 
      ? '<span class="badge-tag" style="color:#34d399">Direct Non-Stop</span>' 
      : `<span class="badge-tag" style="color:#fbbf24">${f.stops} Stop (${f.stopover_code})</span>`;

    const roundTripBadge = isRound 
      ? '<span class="badge-tag" style="color:#a5b4fc; background:rgba(99,102,241,0.2); border-color:#6366f1;">🔄 Two-Way Round Trip Package</span>'
      : '';

    return `
      <div class="card-item" style="${isRound ? 'border-color:rgba(99,102,241,0.4);' : ''}">
        <div class="card-top">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <div class="airline-badge" style="background-color:${f.airline_color}">${f.airline_code}</div>
            <div>
              <strong style="color:white;">${f.airline}</strong> <span style="font-family:monospace; font-size:0.8rem; color:#94a3b8;">${f.flight_number}</span>
              ${cabinBadge} ${roundTripBadge}
              <div style="font-size:0.75rem; color:#64748b;">${f.aircraft} • ${f.terminal} (${f.gate})</div>
            </div>
          </div>

          <div style="text-align:right;">
            <div class="price-display">₹${roundTotalPrice.toLocaleString()}</div>
            <span style="font-size:0.75rem; color:#34d399;">${f.available_seats} seats left ${isRound ? '(Two-Way Total)' : ''}</span>
          </div>
        </div>

        <!-- Outbound Leg -->
        <div style="font-size:0.75rem; color:#60a5fa; font-weight:bold; margin-top:0.4rem;">🛫 Outbound Flight: ${f.origin_city} ➔ ${f.dest_city}</div>
        <div class="route-row">
          <div>
            <div class="time-val">${depTime}</div>
            <div class="city-val">${f.origin_city} (${f.origin_code})</div>
          </div>

          <div>
            <div style="font-size:0.75rem; color:#94a3b8;">🕒 ${hours}h ${mins}m</div>
            <div style="border-top:1px dashed #475569; margin:4px 0; position:relative;">✈</div>
            ${stopBadge}
          </div>

          <div>
            <div class="time-val">${arrTime}</div>
            <div class="city-val">${f.dest_city} (${f.dest_code})</div>
          </div>
        </div>

        ${isRound ? `
        <!-- Return Leg -->
        <div style="font-size:0.75rem; color:#34d399; font-weight:bold; margin-top:0.4rem;">🛬 Return Flight (Two-Way): ${f.dest_city} ➔ ${f.origin_city} (${state.returnDate || 'Return'})</div>
        <div class="route-row" style="background:rgba(16,185,129,0.05); border-color:rgba(16,185,129,0.2);">
          <div>
            <div class="time-val">${depTime}</div>
            <div class="city-val">${f.dest_city} (${f.dest_code})</div>
          </div>

          <div>
            <div style="font-size:0.75rem; color:#94a3b8;">🕒 ${hours}h ${mins}m</div>
            <div style="border-top:1px dashed #34d399; margin:4px 0; position:relative;">🛬</div>
            <span class="badge-tag" style="color:#34d399">Direct Return</span>
          </div>

          <div>
            <div class="time-val">${arrTime}</div>
            <div class="city-val">${f.origin_city} (${f.origin_code})</div>
          </div>
        </div>
        ` : ''}

        <div class="pushbuttons-row">
          <div style="display:flex; gap:0.4rem;">
            <button class="btn-pushbutton btn-cross-cab" data-dest="${f.dest_code}">🚖 Book Cab at ${f.dest_code}</button>
            <button class="btn-pushbutton btn-cross-hotel" data-dest="${f.dest_code}">🏨 Book Hotel at ${f.dest_code}</button>
          </div>
          <button class="btn-primary btn-select-seat" data-id="${f.id}">
            ${isRound ? 'Select Seat & Book Round Trip (2-Way)' : 'Select Seat & Book Flight'}
          </button>
        </div>
      </div>
    `;
  }


  // ----------------------------------------------------
  // 2. AIRPORT CABS MODULE
  // ----------------------------------------------------
  function setupCabFilters() {
    const airport = document.getElementById('cab-airport');
    const type = document.getElementById('cab-type');
    const passengers = document.getElementById('cab-passengers');
    const sort = document.getElementById('cab-sort');
    const maxFare = document.getElementById('cab-max-fare');
    const fareVal = document.getElementById('cab-fare-val');
    const resetBtn = document.getElementById('btn-reset-cabs');

    airport.addEventListener('change', (e) => { state.cabFilter.airport = e.target.value; state.cabFilter.page = 1; loadCabs(); });
    type.addEventListener('change', (e) => { state.cabFilter.type = e.target.value; state.cabFilter.page = 1; loadCabs(); });
    passengers.addEventListener('change', (e) => { state.cabFilter.passengers = Number(e.target.value); state.cabFilter.page = 1; loadCabs(); });
    sort.addEventListener('change', (e) => { state.cabFilter.sortBy = e.target.value; loadCabs(); });

    maxFare.addEventListener('input', (e) => {
      fareVal.textContent = `$${e.target.value}`;
      state.cabFilter.maxFare = e.target.value;
      state.cabFilter.page = 1;
      loadCabs();
    });

    resetBtn.addEventListener('click', () => {
      airport.value = '';
      type.value = 'All';
      passengers.value = 1;
      sort.value = 'price_asc';
      maxFare.value = 200;
      fareVal.textContent = '$200';
      state.cabFilter = { airport: '', type: 'All', passengers: 1, maxFare: 200, sortBy: 'price_asc', page: 1 };
      loadCabs();
    });
  }

  async function loadCabs() {
    const grid = document.getElementById('cabs-cards-grid');
    const metaCount = document.getElementById('cabs-meta-count');
    const pageInfo = document.getElementById('cabs-page-info');
    const pagination = document.getElementById('cabs-pagination');

    grid.innerHTML = '<div class="glass-panel p-8 text-center">Loading airport cabs...</div>';

    const params = new URLSearchParams({
      airport: state.cabFilter.airport,
      type: state.cabFilter.type,
      passengers: state.cabFilter.passengers,
      maxFare: state.cabFilter.maxFare,
      sortBy: state.cabFilter.sortBy,
      page: state.cabFilter.page,
      limit: 15
    });

    try {
      const res = await fetch(`/api/cabs?${params}`);
      const json = await res.json();

      if (json.status === 'success') {
        const cabs = json.data;
        const pg = json.pagination;

        metaCount.textContent = `Showing ${cabs.length} available cabs out of ${pg.totalCount.toLocaleString()} indexed.`;
        pageInfo.textContent = `Page ${pg.currentPage} of ${pg.totalPages}`;

        if (cabs.length === 0) {
          grid.innerHTML = '<div class="glass-panel p-8 text-center">No cabs match your filters.</div>';
          pagination.innerHTML = '';
          return;
        }

        grid.innerHTML = cabs.map(c => renderCabCard(c)).join('');
        renderPagination(pagination, pg, (newPage) => {
          state.cabFilter.page = newPage;
          loadCabs();
        });

        grid.querySelectorAll('.btn-book-cab').forEach(btn => {
          btn.addEventListener('click', () => {
            const cabId = btn.dataset.id;
            const cab = cabs.find(item => item.id == cabId);
            openCabModal(cab);
          });
        });

      }
    } catch (err) {
      grid.innerHTML = '<div class="glass-panel p-8 text-center text-rose-400">Failed to load cabs.</div>';
    }
  }

  function renderCabCard(c) {
    return `
      <div class="card-item">
        <div class="card-top">
          <div>
            <span class="badge-tag">${c.cab_type}</span>
            <h3 style="color:white; font-size:1.1rem; margin-top:0.25rem;">${c.vehicle_model}</h3>
            <div style="font-size:0.75rem; color:#94a3b8;">📍 Serving ${c.airport_code} Terminal (${c.city})</div>
          </div>
          <div style="text-align:right;">
            <div class="price-display">₹${c.base_fare.toLocaleString()}</div>
            <span style="font-size:0.75rem; color:#94a3b8;">+₹${c.price_per_km}/km</span>
          </div>
        </div>

        <div style="background:rgba(15, 23, 42, 0.8); padding:0.6rem; border-radius:8px; font-size:0.75rem; display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin-bottom:1rem;">
          <div>Driver: <strong style="color:white;">${c.driver_name}</strong></div>
          <div>Rating: <strong style="color:#fbbf24;">★ ${c.driver_rating}</strong> (${c.driver_trips} trips)</div>
          <div>ETA Wait: <strong style="color:#22d3ee;">~${c.estimated_wait_minutes} min</strong></div>
          <div>Capacity: <strong style="color:white;">${c.passenger_capacity} seats</strong></div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="color:#34d399; font-size:0.75rem; font-weight:bold;">✓ Fixed Airport Fare</span>
          <button class="btn-primary btn-book-cab" data-id="${c.id}">Reserve Cab</button>
        </div>
      </div>
    `;
  }

  // ----------------------------------------------------
  // 3. NEARBY HOTELS MODULE
  // ----------------------------------------------------
  function setupHotelFilters() {
    const airport = document.getElementById('hotel-airport');
    const distance = document.getElementById('hotel-distance');
    const stars = document.getElementById('hotel-stars');
    const sort = document.getElementById('hotel-sort');
    const maxPrice = document.getElementById('hotel-max-price');
    const priceVal = document.getElementById('hotel-price-val');
    const shuttleOnly = document.getElementById('hotel-shuttle-only');
    const resetBtn = document.getElementById('btn-reset-hotels');

    airport.addEventListener('change', (e) => { state.hotelFilter.airport = e.target.value; state.hotelFilter.page = 1; loadHotels(); });
    distance.addEventListener('change', (e) => { state.hotelFilter.maxDistance = Number(e.target.value); state.hotelFilter.page = 1; loadHotels(); });
    stars.addEventListener('change', (e) => { state.hotelFilter.minStars = Number(e.target.value); state.hotelFilter.page = 1; loadHotels(); });
    sort.addEventListener('change', (e) => { state.hotelFilter.sortBy = e.target.value; loadHotels(); });
    shuttleOnly.addEventListener('change', (e) => { state.hotelFilter.shuttleOnly = e.target.checked ? 1 : 0; state.hotelFilter.page = 1; loadHotels(); });

    maxPrice.addEventListener('input', (e) => {
      priceVal.textContent = `₹${Number(e.target.value).toLocaleString()}`;
      state.hotelFilter.maxPrice = e.target.value;
      state.hotelFilter.page = 1;
      loadHotels();
    });

    resetBtn.addEventListener('click', () => {
      airport.value = '';
      distance.value = 20;
      stars.value = 3;
      sort.value = 'distance_asc';
      maxPrice.value = 20000;
      priceVal.textContent = '₹20,000';
      shuttleOnly.checked = false;
      state.hotelFilter = { airport: '', maxDistance: 20, minStars: 3, maxPrice: 20000, shuttleOnly: 0, sortBy: 'distance_asc', page: 1 };
      loadHotels();
    });
  }

  async function loadHotels() {
    const grid = document.getElementById('hotels-cards-grid');
    const metaCount = document.getElementById('hotels-meta-count');
    const pageInfo = document.getElementById('hotels-page-info');
    const pagination = document.getElementById('hotels-pagination');

    grid.innerHTML = '<div class="glass-panel p-8 text-center">Loading airport hotels...</div>';

    const params = new URLSearchParams({
      airport: state.hotelFilter.airport,
      maxDistance: state.hotelFilter.maxDistance,
      minStars: state.hotelFilter.minStars,
      maxPrice: state.hotelFilter.maxPrice,
      freeShuttle: state.hotelFilter.shuttleOnly,
      sortBy: state.hotelFilter.sortBy,
      page: state.hotelFilter.page,
      limit: 15
    });

    try {
      const res = await fetch(`/api/hotels?${params}`);
      const json = await res.json();

      if (json.status === 'success') {
        const hotels = json.data;
        const pg = json.pagination;

        metaCount.textContent = `Showing ${hotels.length} airport hotels out of ${pg.totalCount.toLocaleString()} indexed.`;
        pageInfo.textContent = `Page ${pg.currentPage} of ${pg.totalPages}`;

        if (hotels.length === 0) {
          grid.innerHTML = '<div class="glass-panel p-8 text-center">No airport hotels match your criteria.</div>';
          pagination.innerHTML = '';
          return;
        }

        grid.innerHTML = hotels.map(h => renderHotelCard(h)).join('');
        renderPagination(pagination, pg, (newPage) => {
          state.hotelFilter.page = newPage;
          loadHotels();
        });

        grid.querySelectorAll('.btn-book-hotel').forEach(btn => {
          btn.addEventListener('click', () => {
            const hotelId = btn.dataset.id;
            const hotel = hotels.find(item => item.id == hotelId);
            openHotelModal(hotel);
          });
        });

      }
    } catch (err) {
      grid.innerHTML = '<div class="glass-panel p-8 text-center text-rose-400">Failed to load hotels.</div>';
    }
  }

  function renderHotelCard(h) {
    const stars = '★'.repeat(h.star_rating);
    const shuttleBadge = h.has_shuttle 
      ? '<span class="badge-tag" style="color:#fbbf24">🚌 Free 24/7 Terminal Shuttle</span>'
      : '';

    return `
      <div class="card-item">
        <div class="card-top">
          <div>
            <div style="color:#fbbf24; font-size:0.8rem;">${stars}</div>
            <h3 style="color:white; font-size:1.1rem; margin-top:0.2rem;">${h.name}</h3>
            <div style="font-size:0.75rem; color:#94a3b8;">📍 <strong>${h.distance_km} km</strong> from ${h.airport_code} Terminal</div>
          </div>
          <div style="text-align:right;">
            <div class="price-display">₹${h.price_per_night.toLocaleString()}</div>
            <span style="font-size:0.75rem; color:#94a3b8;">/ night</span>
          </div>
        </div>

        <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(15, 23, 42, 0.8); padding:0.6rem; border-radius:8px; margin-bottom:1rem;">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <div style="background:#f59e0b; color:#0f172a; font-weight:bold; padding:0.2rem 0.5rem; border-radius:6px; font-family:monospace;">${h.guest_score}</div>
            <span style="font-size:0.75rem; color:white;">Superb (${h.review_count} reviews)</span>
          </div>
          ${shuttleBadge}
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="color:#34d399; font-size:0.75rem; font-weight:bold;">✓ Free Cancellation</span>
          <button class="btn-primary btn-book-hotel" data-id="${h.id}">Book Room</button>
        </div>
      </div>
    `;
  }


  async function loadItinerary() {
    const container = document.getElementById('itinerary-content');
    const summaryBox = document.getElementById('itinerary-summary');
    const grandTotalEl = document.getElementById('itinerary-grand-total');

    try {
      const res = await fetch('/api/bookings');
      const json = await res.json();

      if (json.status === 'success') {
        const bookings = json.data;
        state.cartCount = bookings.length;

        if (bookings.length > 0) {
          cartBadge.textContent = bookings.length;
          cartBadge.classList.remove('hidden');
          summaryBox.classList.remove('hidden');

          const grandTotal = bookings.reduce((sum, b) => sum + b.total_price, 0);
          grandTotalEl.textContent = `₹${grandTotal.toLocaleString()}`;

          container.innerHTML = bookings.map(b => renderItineraryCard(b)).join('');

          // Attach Cancel / Delete Listeners
          container.querySelectorAll('.btn-delete-booking').forEach(btn => {
            btn.addEventListener('click', async () => {
              const bId = btn.dataset.id;
              if (confirm('Are you sure you want to cancel this booking?')) {
                await cancelBooking(bId);
              }
            });
          });

          // Attach Print E-Ticket Listeners
          container.querySelectorAll('.btn-print-ticket').forEach(btn => {
            btn.addEventListener('click', () => {
              const bId = btn.dataset.id;
              const booking = bookings.find(item => item.id == bId);
              printETicket(booking);
            });
          });

        } else {
          cartBadge.classList.add('hidden');
          summaryBox.classList.add('hidden');
          container.innerHTML = `
            <div class="glass-panel p-12 text-center">
              <h3>Your Travel Itinerary is Empty</h3>
              <p style="color:#94a3b8; font-size:0.85rem; margin-top:0.4rem;">Start by searching from our 10,000+ domestic flights, 5,000+ cabs, or 5,000+ airport hotels.</p>
            </div>
          `;
        }
      }
    } catch (err) {
      console.error('Error loading itinerary:', err);
    }
  }

  async function cancelBooking(id) {
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.status === 'success') {
        showToast('Booking Canceled Successfully');
        loadItinerary();
      }
    } catch (err) {
      alert('Failed to cancel booking');
    }
  }

  function printETicket(b) {
    const details = b.item_details_json;
    const passenger = b.passenger_json;
    const isFlight = b.booking_type === 'flight';
    const isCab = b.booking_type === 'cab';

    const printWin = window.open('', '_blank');
    printWin.document.write(`
      <html>
        <head>
          <title>E-Ticket Voucher — ${b.booking_ref}</title>
          <style>
            body { font-family: sans-serif; padding: 2rem; color: #1e293b; }
            .ticket-box { border: 2px solid #3b82f6; border-radius: 12px; padding: 2rem; max-width: 600px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 1rem; }
            .ref { font-family: monospace; font-size: 1.2rem; font-weight: bold; color: #2563eb; }
            .row { display: flex; justify-content: space-between; margin: 1rem 0; }
            .qr { text-align: center; margin-top: 1.5rem; padding: 1rem; background: #f8fafc; border-radius: 8px; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="ticket-box">
            <div class="header">
              <h2>SkyTrips Official E-Ticket</h2>
              <div class="ref">${b.booking_ref}</div>
            </div>
            <div class="row">
              <div><strong>Passenger:</strong> ${passenger.fullName || passenger.name}</div>
              <div><strong>Status:</strong> Confirmed</div>
            </div>
            <div class="row">
              <div><strong>Service:</strong> ${isFlight ? `Flight ${details.flight_number} (Seat ${details.seat || 'Assigned'})` : isCab ? `Cab Transfer (${details.vehicle_model})` : `Hotel (${details.hotel_name})`}</div>
              <div><strong>Total Fare:</strong> ₹${b.total_price.toLocaleString()}</div>
            </div>
            ${isFlight ? `<div class="row"><div><strong>Route:</strong> ${details.origin} ➔ ${details.dest}</div></div>` : ''}
            <div class="qr">
              [ OFFICIAL QR CODE VERIFICATION ]<br>
              ${b.booking_ref} • ${new Date(b.created_at).toLocaleDateString()}
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWin.document.close();
  }

  function renderItineraryCard(b) {
    const details = b.item_details_json;
    const passenger = b.passenger_json;
    const isFlight = b.booking_type === 'flight';
    const isCab = b.booking_type === 'cab';

    let title = isFlight ? `Flight ${details.flight_number} (${details.origin} ➔ ${details.dest})` : isCab ? `Cab Transfer (${details.vehicle_model})` : `Hotel Reservation (${details.hotel_name})`;
    let tag = isFlight ? '✈ FLIGHT PASS' : isCab ? '🚖 CAB VOUCHER' : '🏨 HOTEL VOUCHER';

    return `
      <div class="glass-panel p-5" style="border-left:4px solid ${isFlight ? '#3b82f6' : isCab ? '#06b6d4' : '#f59e0b'}; margin-bottom:1rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:0.6rem; margin-bottom:0.75rem;">
          <div>
            <span class="badge-tag">${tag}</span>
            <h3 style="color:white; font-size:1.1rem; display:inline-block; margin-left:0.5rem;">${title}</h3>
            <div style="font-size:0.75rem; color:#94a3b8;">Ref Code: <strong style="color:#60a5fa; font-family:monospace;">${b.booking_ref}</strong> ${isFlight ? `• Seat: <strong style="color:#34d399;">${details.seat || '12A'}</strong>` : ''}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-family:monospace; font-size:1.2rem; font-weight:bold; color:white;">₹${b.total_price.toLocaleString()}</div>
            <span style="color:#34d399; font-size:0.7rem;">✓ Confirmed</span>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.8rem; color:#cbd5e1;">
          <div>Passenger / Guest: <strong>${passenger.fullName || passenger.name}</strong></div>
          <div style="display:flex; gap:0.5rem;">
            <button class="btn-pushbutton btn-print-ticket" data-id="${b.id}">🖨 Print E-Ticket</button>
            <button class="btn-pushbutton btn-delete-booking" data-id="${b.id}" style="border-color:#f43f5e; color:#f43f5e;">🗑 Cancel Booking</button>
          </div>
        </div>
      </div>
    `;
  }


  // ----------------------------------------------------
  // PAGINATION HELPER
  // ----------------------------------------------------
  function renderPagination(container, pg, onPageChange) {
    if (pg.totalPages <= 1) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = `
      <button class="btn-stop ${pg.currentPage === 1 ? 'disabled' : ''}" id="pg-prev" ${pg.currentPage === 1 ? 'disabled' : ''}>← Previous</button>
      <span style="font-size:0.8rem; color:#94a3b8; font-family:monospace;">Page ${pg.currentPage} of ${pg.totalPages}</span>
      <button class="btn-stop ${pg.currentPage === pg.totalPages ? 'disabled' : ''}" id="pg-next" ${pg.currentPage === pg.totalPages ? 'disabled' : ''}>Next →</button>
    `;

    const prevBtn = container.querySelector('#pg-prev');
    const nextBtn = container.querySelector('#pg-next');

    if (prevBtn) prevBtn.addEventListener('click', () => onPageChange(pg.currentPage - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => onPageChange(pg.currentPage + 1));
  }

  // ----------------------------------------------------
  // MODALS HANDLERS
  // ----------------------------------------------------
  function setupModals() {
    document.getElementById('btn-close-seat-modal').addEventListener('click', () => modalSeat.classList.add('hidden'));
    document.getElementById('btn-close-cab-modal').addEventListener('click', () => modalCab.classList.add('hidden'));
    document.getElementById('btn-close-hotel-modal').addEventListener('click', () => modalHotel.classList.add('hidden'));

    // Flight Form Submission
    document.getElementById('form-book-flight').addEventListener('submit', async (e) => {
      e.preventDefault();
      const flight = state.activeModalItem;
      const isRound = state.isRoundTrip;
      const roundTotalPrice = isRound ? Math.round(flight.price * 1.85) : flight.price;

      const passenger = {
        fullName: document.getElementById('pass-name').value,
        email: document.getElementById('pass-email').value,
        phone: document.getElementById('pass-phone').value
      };

      try {
        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'flight',
            itemDetails: {
              flight_number: flight.flight_number,
              seat: state.selectedSeat,
              origin: flight.origin_code,
              dest: flight.dest_code,
              is_round_trip: isRound,
              return_date: isRound ? (state.returnDate || 'Two-Way') : null
            },
            passenger,
            totalPrice: roundTotalPrice
          })
        });

        const json = await res.json();
        if (json.status === 'success') {
          modalSeat.classList.add('hidden');
          showToast(isRound ? '🔄 Two-Way Round Trip Boarding Pass Issued!' : 'Flight Boarding Pass Issued!');
          
          // Set selected flight for banner & cross booking
          state.selectedFlight = flight;
          bannerText.textContent = `Flight Selected: ${flight.flight_number} (${flight.origin_code} ➔ ${flight.dest_code} ${isRound ? 'Two-Way' : ''})`;
          selectionBanner.classList.remove('hidden');

          loadItinerary();
        }
      } catch (err) {
        alert('Booking failed');
      }
    });

    // Cab Form Submission
    document.getElementById('form-book-cab').addEventListener('submit', async (e) => {
      e.preventDefault();
      const cab = state.activeModalItem;
      const passenger = { fullName: document.getElementById('cab-pass-name').value };

      try {
        const fare = cab.base_fare + cab.price_per_km * 25;
        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'cab',
            itemDetails: { vehicle_model: cab.vehicle_model, pickup: document.getElementById('cab-pickup-loc').value, dropoff: document.getElementById('cab-dropoff-loc').value },
            passenger,
            totalPrice: fare
          })
        });

        const json = await res.json();
        if (json.status === 'success') {
          modalCab.classList.add('hidden');
          showToast('Airport Cab Transfer Confirmed!');
          loadItinerary();
        }
      } catch (err) {
        alert('Cab booking failed');
      }
    });

    // Hotel Form Submission
    document.getElementById('form-book-hotel').addEventListener('submit', async (e) => {
      e.preventDefault();
      const hotel = state.activeModalItem;
      const roomType = document.getElementById('hotel-room-type').value;
      const passenger = { fullName: document.getElementById('hotel-pass-name').value };

      try {
        const fare = hotel.price_per_night * 2;
        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'hotel',
            itemDetails: { hotel_name: hotel.name, room: roomType },
            passenger,
            totalPrice: fare
          })
        });

        const json = await res.json();
        if (json.status === 'success') {
          modalHotel.classList.add('hidden');
          showToast('Airport Hotel Room Reserved!');
          loadItinerary();
        }
      } catch (err) {
        alert('Hotel booking failed');
      }
    });
  }

  function openSeatModal(flight) {
    state.activeModalItem = flight;
    const isRound = state.isRoundTrip;
    const roundTotalPrice = isRound ? Math.round(flight.price * 1.85) : flight.price;

    document.getElementById('modal-flight-title').textContent = isRound 
      ? `Select Seat for Round Trip Flight ${flight.flight_number}` 
      : `Select Seat for ${flight.flight_number}`;

    document.getElementById('modal-flight-sub').textContent = isRound
      ? `🔄 Two-Way: ${flight.origin_city} (${flight.origin_code}) ⇄ ${flight.dest_city} (${flight.dest_code}) • Return: ${state.returnDate || 'Scheduled'}`
      : `${flight.origin_city} (${flight.origin_code}) ➔ ${flight.dest_city} (${flight.dest_code}) • ${flight.cabin_class}`;

    document.getElementById('modal-flight-price').textContent = `₹${roundTotalPrice.toLocaleString()}`;

    // Render Seat Map Grid
    const seatGrid = document.getElementById('seat-grid');
    const rows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const cols = ['A', 'B', 'C', 'D', 'E', 'F'];
    const taken = new Set(['1A', '2C', '4B', '5E', '7F']);

    seatGrid.innerHTML = rows.map(r => 
      cols.map(c => {
        const seatCode = `${r}${c}`;
        const isTaken = taken.has(seatCode);
        const isSelected = state.selectedSeat === seatCode;
        return `<button type="button" class="seat-btn ${isSelected ? 'selected' : ''} ${isTaken ? 'taken' : ''}" data-seat="${seatCode}" ${isTaken ? 'disabled' : ''}>${seatCode}</button>`;
      }).join('')
    ).join('');

    seatGrid.querySelectorAll('.seat-btn:not(.taken)').forEach(btn => {
      btn.addEventListener('click', () => {
        seatGrid.querySelectorAll('.seat-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        state.selectedSeat = btn.dataset.seat;
      });
    });

    modalSeat.classList.remove('hidden');
  }


  function openCabModal(cab) {
    state.activeModalItem = cab;
    document.getElementById('modal-cab-title').textContent = `Reserve ${cab.vehicle_model}`;
    document.getElementById('modal-cab-sub').textContent = `${cab.cab_type} serving ${cab.airport_code} Terminal`;
    document.getElementById('cab-pickup-loc').value = `${cab.airport_code} Terminal Arrivals Gate`;
    document.getElementById('cab-dropoff-loc').value = `Grand Hotel, ${cab.city}`;
    document.getElementById('modal-cab-fare').textContent = `$${cab.base_fare + cab.price_per_km * 25}`;
    modalCab.classList.remove('hidden');
  }

  function openHotelModal(hotel) {
    state.activeModalItem = hotel;
    document.getElementById('modal-hotel-title').textContent = `Reserve ${hotel.name}`;
    document.getElementById('modal-hotel-sub').textContent = `${hotel.distance_km} km from ${hotel.airport_code} Terminal`;
    document.getElementById('modal-hotel-fare').textContent = `$${hotel.price_per_night * 2}`;
    
    const today = new Date().toISOString().split('T')[0];
    const next2Days = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
    document.getElementById('hotel-checkin').value = today;
    document.getElementById('hotel-checkout').value = next2Days;

    modalHotel.classList.remove('hidden');
  }

  function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-message').textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
  }

  // Initialize
  initApp();

});
