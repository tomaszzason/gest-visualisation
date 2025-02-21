import datetime
from datetime import datetime
from urllib.error import HTTPError, URLError

import xarray as xr
import cartopy.crs as ccrs
import urllib.request
#import openpyxl
import xlsxwriter
from fastapi import FastAPI
from flask import jsonify
from contextlib import asynccontextmanager
from pymongo import MongoClient
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
import schedule # type: ignore
import time
import threading


# CFS model data https://nomads.ncep.noaa.gov/pub/data/nccf/com/cfs/prod/cfs.20250114/
# Degree days - https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/cdus/degree_days/
# DOC https://docs.opendata.aws/noaa-gefs-pds/readme.html
# EPS
# data source https://data.ecmwf.int/forecasts/
# DOC https://confluence.ecmwf.int/display/DAC/ECMWF+open+data%3A+real-time+forecasts+from+IFS+and+AIFS
# Python API https://github.com/ecmwf/ecmwf-opendata
# https://open-meteo.com/en/docs/ecmwf-api
# https://open.canada.ca/data/en/dataset/6d9dd2f8-202e-58cb-a110-e2168832aacb/resource/c08a20c3-e417-4a90-9d6d-748c436de020
# https://spire.com/tutorial/spire-weather-tutorial-intro-to-processing-grib2-data-with-python/
# https://github.com/NOAA-EMC/global-workflow/tree/develop/scripts

# https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-gefs-pds
# https://open-meteo.com/en/docs/ecmwf-api



NOAA_GEFS_API = "https://noaa-gefs-pds.s3.amazonaws.com/gefs.";
ATMOS = "/atmos/pgrb2ap5/"
CC_FORECAST_CYCLES = ["00", "06", "12", "18"]
DATABASE_NAME = "mydatabase"
COLLECTION_NAME_GEFS = "gefs"
COLLECTION_NAME_CITIES = "cities"

def parse_datetime_from_filename(usa_ds):
    time = usa_ds["t2m"].valid_time.data
    date_obj = datetime.strptime(str(time), "%Y-%m-%dT%H:%M:%S.%f000")
    # Format the datetime object into a desired string format
    formatted_date = date_obj.strftime("%Y-%m-%d %H:%M")
    return str(formatted_date)


def parse_forecast_from_filename(filename_var):
    """
    Example filename: `gec00.t12z.pgrb2a.0p50.f000`
    """
    parts = filename_var.split(".")
    # Parse the forecast date from the filename
    f = parts[1]
    return str(f)


def get_column_name(forcast):
    if forcast == "00":
        return "B"
    if forcast == "06":
        return "C"
    if forcast == "12":
        return "D"
    if forcast == "18":
        return "E"

# Convert longitude to 0-360 format
# Example input
# longitude_decimal = -74.006
# longitude_360 = longitude_to_360(longitude_decimal)
# print(longitude_360)  # Output: 285.994
def longitude_to_360(longitude):
    """Convert decimal longitude to 0-360 format."""
    return longitude % 360  # Ensures longitudes are within 0-360 range


# Open the GRIB file
#ds = xr.open_dataset("/Users/Zini/Downloads/gefs.wave.t00z.c00.global.0p25.f063.grib2", engine="cfgrib")
#ds = xr.open_dataset("/Users/Zini/Downloads/gec00.t00z.pgrb2a.0p50.f000", engine="cfgrib")

def load_gec_files_and_read_temp(tt, xx, worksheet_inner, row, mongo_data_record, report_date, city):

    url = NOAA_GEFS_API + report_date + "/" + tt + "/atmos/pgrb2ap5/"
    filename = "gec00.t" + tt + "z.pgrb2a.0p50.f" + xx
    folder = "/Users/Zini/Downloads/gefs/"
    directory = folder + report_date + "/" + tt
    full_path_to_download = directory + "/" + filename
    full_url = url + filename
    print("Download ", full_url)

    #create folders
    import pathlib
    pathlib.Path(directory).mkdir(parents=True, exist_ok=True) 

    import os.path
    if os.path.isfile(full_path_to_download) == 0:
        try:
            urllib.request.urlretrieve(full_url, full_path_to_download)
        except HTTPError:
            print("Oops!  Cannot access file .  Try again...", full_url)
            return

    #ds = xr.open_dataset(full_path_to_download, filter_by_keys={'typeOfLevel': 'heightAboveGround'}, engine="cfgrib")
    ds = xr.open_dataset(full_path_to_download, filter_by_keys={'paramId': 167}, decode_timedelta=False, engine="cfgrib")
    
  
    if not ds.data_vars:
        print("Empty data set!")
        return

    collection = app.database[COLLECTION_NAME_CITIES]
    city_record = collection.find_one({"name": city})
    longitude = longitude_to_360(city_record["coordinates"][0])
    latitude = city_record["coordinates"][1]
    
    diff = 1
    usa_ds = ds.sel(latitude=slice(latitude + diff, latitude - diff), longitude=slice(longitude - diff, longitude + diff))

    #print(usa_ds["t2m"])

    mean_temperature_kelvin = round(float(usa_ds["t2m"].mean(dim=["latitude", "longitude"])), 2)
    mean_temperature_celcius = mean_temperature_kelvin - 273.15
    #print(usa_ds["t2m"].valid_time.data)

    t = parse_datetime_from_filename(usa_ds)
    print("Temp in celcius for time: ", t, "lat ", latitude, " lon ", longitude, " is ", mean_temperature_celcius);

    column_for_forcast = get_column_name(tt)
    worksheet_inner.write(column_for_forcast + "1", tt)
    worksheet_inner.write('A' + str(row), t)
    worksheet_inner.write(column_for_forcast + str(row), mean_temperature_celcius)

    mongo_data_record['report_date'] = report_date
    mongo_data_record['time'] = t
    mongo_data_record['city'] = city
    mongo_data_record[tt] = mean_temperature_celcius

def saveToDatabase(record, tt):

    if len(record) == 0:
        print("Record is empty")
        return
    
    import pymongo

    # Connect to the MongoDB server
    client = pymongo.MongoClient("mongodb://admin:adminpassword@localhost:27017")

    # Select the database
    db = client[DATABASE_NAME]

    # Select the collection
    collection = db[COLLECTION_NAME_GEFS]

    searchCriteria = { "time": record["time"], "report_date": record["report_date"], "city": record["city"] }
    count = collection.count_documents(searchCriteria)

    if count == 0:
        # Insert the record
        print("Inserting record")
        collection.insert_one(record)   
    else:   
        collection.update_one(
        searchCriteria,  # Find the document by time and report_date
        {"$set": {tt: record[tt]}}  # Add the new attribute
        )


def serialize_doc(doc):
    doc["_id"] = str(doc["_id"])  # Convert ObjectId to string
    return doc



def process_gefs_data(report_date, city, save_to_mongo = True):

    path = '/Users/Zini/Downloads/gefs/gefs_ ' + report_date + '.xlsx'
    workbook = xlsxwriter.Workbook(path)
    worksheet = workbook.add_worksheet()
    worksheet.write('A1', 'TIME')

    for tt in CC_FORECAST_CYCLES:
        i = 1
        r = 2 + int(tt)/3

        url = NOAA_GEFS_API + report_date + "/" + tt + ATMOS
        filename = "gec00.t" + tt + "z.pgrb2a.0p50.f" + "000"
        url_with_file = url + filename
        try:
            urllib.request.urlopen(url_with_file)
        except HTTPError as e:
            print("Page does not exist", url_with_file)
            continue
        except URLError as e:
            print("Page does not exist", url_with_file)
            continue

        while i <= 114:
            ff = '{:0>3}'.format(i*3)
            mongo_data_record = {}
            load_gec_files_and_read_temp(tt, ff, worksheet, r, mongo_data_record, report_date, city)
            print("record ", mongo_data_record)
            if save_to_mongo:
                saveToDatabase(mongo_data_record, tt)
            r = r + 1
            i += 1
        print("Koniec przeliczania dla ", tt)

    workbook.close()

def getCities():
    collection = app.database[COLLECTION_NAME_CITIES]
    cities = collection.find().limit(10)
    data_list = [doc["name"] for doc in cities]  # Convert cursor to list with city names
    return data_list;


def job():

    formatted_date = datetime.now().strftime("%Y%m%d")
    cities = getCities()
    print("Uruchomiona joba ", formatted_date, cities)
    for city in cities:
        process_gefs_data(formatted_date, city)
    
    print("Koniec joba ", datetime.now(), city)

def run_scheduler():
    """ Function to continuously run the scheduler in a background thread. """
    while True:
        schedule.run_pending()
        time.sleep(60)  # Check every minute


def schedule_jobs():
    # Run the retry check every 5 minutes
    schedule.every(15).minutes.do(job)
    print("Scheduled job")
    # schedule.every().day.at("00:00").do(job)
    # schedule.every().day.at("06:00").do(job)
    # schedule.every().day.at("12:00").do(job)
    # schedule.every().day.at("18:00").do(job)


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("App is starting up...")
    app.mongodb_client = MongoClient("mongodb://admin:adminpassword@localhost:27017")
    app.database = app.mongodb_client[DATABASE_NAME]
    print("Connected to the MongoDB database!")
    schedule_jobs()
    thread = threading.Thread(target=run_scheduler, daemon=True)
    thread.start()

    yield
    print("App is shutting down...")


app = FastAPI(lifespan=lifespan)

# Allow all origins (for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


#Example http://localhost:50000/getGefs
@app.get("/getGefs")
async def getGefs(report_date: str, city: str):

    # Select database and collection
    db = app.mongodb_client[DATABASE_NAME]  # Replace with your database name
    collection = db[COLLECTION_NAME_GEFS]  # Replace with your collection name

    print("Get data from mongodb ", report_date, " ", city)
    results = collection.find({"report_date": report_date, "city": city})  # Find all documents with the given report_date and city
    data_list = [serialize_doc(doc) for doc in results]  # Convert cursor to list with serialized docs
    return JSONResponse(content=data_list)  # Return as FastAPI JSON response




#Example http://localhost:50000/process
@app.get("/process")
async def process(report_date: str, city: str):

    #report_date = "20250112"
    process_gefs_data(report_date, city)

    return "done"

#Example http://localhost:50000/cities
@app.get("/cities")
async def getCitiesAPI():
    data_list = getCities()

    return JSONResponse(content=data_list)  # Return as FastAPI JSON response


