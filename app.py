import sqlite3
import os
import json
from datetime import datetime
from flask import Flask, jsonify, request, send_from_directory

app = Flask(__name__, static_folder='static', static_url_path='')

DB_PATH = os.path.join(os.path.dirname(__file__), 'data', 'skytrips.db')

def get_db_connection():
    if not os.path.exists(DB_PATH):
        # Auto-build database if not present
        from generate_kaggle_data import build_database
        build_database()

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    return response


# ----------------------------------------------------
# STATIC FRONTEND ROUTES
# ----------------------------------------------------
@app.route('/')
@app.route('/flights')
@app.route('/cabs')
@app.route('/hotels')
@app.route('/itinerary')
@app.route('/<path:path>')
def serve_index(path=None):
    return send_from_directory('static', 'index.html')



# ----------------------------------------------------
# API ENDPOINTS
# ----------------------------------------------------
@app.route('/api/airports', methods=['GET'])
def get_airports():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM airports ORDER BY city ASC;")
        rows = cursor.fetchall()
        conn.close()

        airports = [dict(row) for row in rows]
        return jsonify({"status": "success", "data": airports})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/api/flights', methods=['GET'])
def get_flights():
    try:
        origin = request.args.get('origin', '')
        dest = request.args.get('destination', '')
        travel_date = request.args.get('date', '')
        cabin = request.args.get('cabinClass', 'All')
        stops = request.args.get('stops', 'all')
        max_price = request.args.get('maxPrice', type=int)
        sort_by = request.args.get('sortBy', 'price_asc')
        page = request.args.get('page', default=1, type=int)
        limit = request.args.get('limit', default=15, type=int)

        def build_and_exec_query(apply_date_filter=True):
            query = """
            SELECT f.*, 
                   ao.name as origin_name, ao.city as origin_city, ao.country as origin_country,
                   ad.name as dest_name, ad.city as dest_city, ad.country as dest_country
            FROM flights f
            JOIN airports ao ON f.origin_code = ao.code
            JOIN airports ad ON f.dest_code = ad.code
            WHERE 1=1
            """
            params = []

            if origin:
                query += " AND f.origin_code = ?"
                params.append(origin)

            if dest:
                query += " AND f.dest_code = ?"
                params.append(dest)

            if travel_date and apply_date_filter:
                query += " AND f.departure_time LIKE ?"
                params.append(f"{travel_date}%")

            if cabin and cabin != 'All':
                query += " AND f.cabin_class = ?"
                params.append(cabin)

            if stops != 'all':
                query += " AND f.stops = ?"
                params.append(int(stops))

            if max_price:
                query += " AND f.price <= ?"
                params.append(max_price)

            # Sorting
            if sort_by == 'price_asc':
                query += " ORDER BY f.price ASC"
            elif sort_by == 'price_desc':
                query += " ORDER BY f.price DESC"
            elif sort_by == 'duration_asc':
                query += " ORDER BY f.duration_minutes ASC"
            elif sort_by == 'departure_asc':
                query += " ORDER BY f.departure_time ASC"

            conn = get_db_connection()
            cursor = conn.cursor()

            count_query = f"SELECT COUNT(*) FROM ({query})"
            cursor.execute(count_query, params)
            total_cnt = cursor.fetchone()[0]

            offset = (page - 1) * limit
            paginated_query = query + " LIMIT ? OFFSET ?"
            exec_params = list(params)
            exec_params.extend([limit, offset])

            cursor.execute(paginated_query, exec_params)
            fetched_rows = cursor.fetchall()
            conn.close()
            return total_cnt, fetched_rows

        total_count, rows = build_and_exec_query(apply_date_filter=True)

        # Fallback: if exact date filter returned 0 results, retry without strict date filter
        if total_count == 0 and travel_date:
            total_count, rows = build_and_exec_query(apply_date_filter=False)

        formatted_flights = []
        for row in rows:
            r = dict(row)
            formatted_flights.append({
                "id": str(r["id"]),
                "flightNumber": r["flight_number"],
                "airline": r["airline"],
                "airlineCode": r["airline_code"],
                "airlineColor": r["airline_color"],
                "origin": {
                    "code": r["origin_code"],
                    "name": r["origin_name"],
                    "city": r["origin_city"],
                    "country": r["origin_country"]
                },
                "destination": {
                    "code": r["dest_code"],
                    "name": r["dest_name"],
                    "city": r["dest_city"],
                    "country": r["dest_country"]
                },
                "departureTime": r["departure_time"],
                "arrivalTime": r["arrival_time"],
                "durationMinutes": r["duration_minutes"],
                "stops": r["stops"],
                "stopoverAirport": r.get("stopover_code", ""),
                "price": r["price"],
                "cabinClass": r["cabin_class"],
                "availableSeats": r["available_seats"],
                "aircraft": r["aircraft"],
                "terminal": r["terminal"],
                "gate": r["gate"],
                "status": "Scheduled",
                "amenities": ["Free Wi-Fi", "In-seat Power", "Complimentary Meal"]
            })

        total_pages = (total_count + limit - 1) // limit if total_count > 0 else 1

        return jsonify({
            "status": "success",
            "data": formatted_flights,
            "pagination": {
                "totalCount": total_count,
                "currentPage": page,
                "totalPages": total_pages,
                "pageSize": limit
            }
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/api/flights/live', methods=['GET'])
def get_live_flight_status():
    try:
        from realtime_flight_service import get_realtime_flight_telemetry
        fn = request.args.get('flightNumber', request.args.get('flight_number', 'AI-204'))
        orig = request.args.get('origin', 'DEL')
        dest = request.args.get('destination', 'BOM')

        telemetry = get_realtime_flight_telemetry(fn, orig, dest)
        return jsonify({"status": "success", "data": telemetry})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/api/flights/radar', methods=['GET'])
def get_radar_flights():
    try:
        from realtime_flight_service import get_realtime_flight_telemetry
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT flight_number, origin_code, dest_code FROM flights LIMIT 25;")
        rows = cursor.fetchall()
        conn.close()

        active_radar = []
        for row in rows:
            t = get_realtime_flight_telemetry(row['flight_number'], row['origin_code'], row['dest_code'])
            if t['status'] in ['IN_AIR', 'BOARDING', 'DELAYED']:
                active_radar.append(t)

        return jsonify({"status": "success", "count": len(active_radar), "data": active_radar})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500



@app.route('/api/cabs', methods=['GET'])
def get_cabs():
    try:
        airport = request.args.get('airport', '')
        cab_type = request.args.get('type', 'All')
        passengers = request.args.get('passengers', default=1, type=int)
        max_fare = request.args.get('maxFare', type=float)
        sort_by = request.args.get('sortBy', 'price_asc')
        page = request.args.get('page', default=1, type=int)
        limit = request.args.get('limit', default=15, type=int)

        query = """
        SELECT c.*, a.name as airport_name, a.city as city
        FROM cabs c
        JOIN airports a ON c.airport_code = a.code
        WHERE 1=1
        """
        params = []

        if airport:
            query += " AND c.airport_code = ?"
            params.append(airport)

        if cab_type and cab_type != 'All':
            query += " AND c.cab_type = ?"
            params.append(cab_type)

        if passengers > 1:
            query += " AND c.passenger_capacity >= ?"
            params.append(passengers)

        if max_fare:
            query += " AND c.base_fare <= ?"
            params.append(max_fare)

        if sort_by == 'price_asc':
            query += " ORDER BY c.base_fare ASC"
        elif sort_by == 'rating_desc':
            query += " ORDER BY c.driver_rating DESC"
        elif sort_by == 'wait_asc':
            query += " ORDER BY c.estimated_wait_minutes ASC"

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(f"SELECT COUNT(*) FROM ({query})", params)
        total_count = cursor.fetchone()[0]

        offset = (page - 1) * limit
        query += " LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()

        cabs = [dict(row) for row in rows]
        total_pages = (total_count + limit - 1) // limit if total_count > 0 else 1

        return jsonify({
            "status": "success",
            "data": cabs,
            "pagination": {
                "totalCount": total_count,
                "currentPage": page,
                "totalPages": total_pages,
                "pageSize": limit
            }
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/api/hotels', methods=['GET'])
def get_hotels():
    try:
        airport = request.args.get('airport', '')
        max_dist = request.args.get('maxDistance', type=float)
        min_stars = request.args.get('minStars', type=int)
        max_price = request.args.get('maxPrice', type=int)
        shuttle_only = request.args.get('freeShuttle', type=int)
        sort_by = request.args.get('sortBy', 'distance_asc')
        page = request.args.get('page', default=1, type=int)
        limit = request.args.get('limit', default=15, type=int)

        query = """
        SELECT h.*, a.name as airport_name, a.city as city
        FROM hotels h
        JOIN airports a ON h.airport_code = a.code
        WHERE 1=1
        """
        params = []

        if airport:
            query += " AND h.airport_code = ?"
            params.append(airport)

        if max_dist:
            query += " AND h.distance_km <= ?"
            params.append(max_dist)

        if min_stars:
            query += " AND h.star_rating >= ?"
            params.append(min_stars)

        if max_price:
            query += " AND h.price_per_night <= ?"
            params.append(max_price)

        if shuttle_only == 1:
            query += " AND h.has_shuttle = 1"

        if sort_by == 'distance_asc':
            query += " ORDER BY h.distance_km ASC"
        elif sort_by == 'price_asc':
            query += " ORDER BY h.price_per_night ASC"
        elif sort_by == 'score_desc':
            query += " ORDER BY h.guest_score DESC"
        elif sort_by == 'rating_desc':
            query += " ORDER BY h.star_rating DESC"

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(f"SELECT COUNT(*) FROM ({query})", params)
        total_count = cursor.fetchone()[0]

        offset = (page - 1) * limit
        query += " LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()

        hotels = [dict(row) for row in rows]
        total_pages = (total_count + limit - 1) // limit if total_count > 0 else 1

        return jsonify({
            "status": "success",
            "data": hotels,
            "pagination": {
                "totalCount": total_count,
                "currentPage": page,
                "totalPages": total_pages,
                "pageSize": limit
            }
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/api/bookings', methods=['GET', 'POST'])
def handle_bookings():
    conn = get_db_connection()
    cursor = conn.cursor()

    if request.method == 'POST':
        try:
            data = request.json
            ref_prefix = "FL" if data.get('type') == 'flight' else "CB" if data.get('type') == 'cab' else "HT"
            ref_code = f"{ref_prefix}-{os.urandom(3).hex().upper()}"
            now_iso = datetime.now().isoformat()

            cursor.execute("""
            INSERT INTO bookings (booking_ref, booking_type, item_details_json, passenger_json, total_price, created_at)
            VALUES (?, ?, ?, ?, ?, ?);
            """, (
                ref_code,
                data.get('type'),
                json.dumps(data.get('itemDetails', {})),
                json.dumps(data.get('passenger', {})),
                data.get('totalPrice', 0),
                now_iso
            ))
            conn.commit()

            cursor.execute("SELECT * FROM bookings WHERE booking_ref = ?;", (ref_code,))
            row = cursor.fetchone()
            conn.close()

            res = dict(row)
            res['item_details_json'] = json.loads(res['item_details_json'])
            res['passenger_json'] = json.loads(res['passenger_json'])

            return jsonify({"status": "success", "booking": res})
        except Exception as e:
            conn.close()
            return jsonify({"status": "error", "message": str(e)}), 500

    else:
        try:
            cursor.execute("SELECT * FROM bookings ORDER BY id DESC;")
            rows = cursor.fetchall()
            conn.close()

            bookings = []
            for row in rows:
                item = dict(row)
                item['item_details_json'] = json.loads(item['item_details_json'])
                item['passenger_json'] = json.loads(item['passenger_json'])
                bookings.append(item)

            return jsonify({"status": "success", "data": bookings})
        except Exception as e:
            conn.close()
            return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/api/bookings/<int:booking_id>', methods=['DELETE'])
def delete_booking(booking_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM bookings WHERE id = ?;", (booking_id,))
        conn.commit()
        conn.close()
        return jsonify({"status": "success", "message": "Booking canceled successfully"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500



if __name__ == '__main__':
    import logging
    log = logging.getLogger('werkzeug')
    log.setLevel(logging.ERROR)

    print("=" * 60)
    print("SkyTrips Production WSGI Server Running!")
    print("Open Website: http://127.0.0.1:5000")
    print("=" * 60)

    
    try:
        from waitress import serve
        serve(app, host='127.0.0.1', port=5000, threads=8)
    except Exception as e:
        app.run(host='127.0.0.1', port=5000, debug=False)


