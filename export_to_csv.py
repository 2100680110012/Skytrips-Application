import sqlite3
import csv
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'data', 'skytrips.db')
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')

def export_table_to_csv(table_name, csv_filename):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute(f"SELECT * FROM {table_name}")
    rows = cursor.fetchall()
    column_names = [description[0] for description in cursor.description]
    
    csv_path = os.path.join(DATA_DIR, csv_filename)
    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(column_names)
        writer.writerows(rows)
        
    conn.close()
    print(f"Successfully exported {len(rows)} rows from '{table_name}' to: {csv_path}")

if __name__ == '__main__':
    export_table_to_csv('flights', 'kaggle_flights_10k.csv')
    export_table_to_csv('cabs', 'kaggle_cabs_5k.csv')
    export_table_to_csv('hotels', 'kaggle_hotels_5k.csv')
