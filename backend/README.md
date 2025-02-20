## Backend

The backend is implemented using Python and FastAPI. It reads GEFS files from NOAA and stores the mean temperature for the selected city in MongoDB.

### API Endpoints

- **Get all cities**
  ```http
  GET /cities
  ```
  Loads all cities from the database along with their coordinates.

- **Process weather data**
  ```http
  GET /process
  ```
  **Params:**
  - `report_date`: Date of the report (YYYY-MM-DD)
  - `city`: City name
  
  Reads GEFS/GRIB2 files for the specified date and city.

- **Get GEFS data**
  ```http
  GET /getGefs
  ```
  **Params:**
  - `report_date`: Date of the report (YYYY-MM-DD)
  - `city`: City name
  
  Retrieves the mean temperature for the specified date and city.

### Installation

1. Run MongoDB using Docker:
   ```sh
   cd gefs-visualisation/backend/Docker
   docker-compose up -d
   ```
2. Create a Python virtual environment:
   ```sh
   python3 -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
3. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
4. Start the FastAPI server:
   ```sh
   python3 -m uvicorn gefs:app --reload --port 50000
   ```