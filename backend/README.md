# Stock Market Data API

A FastAPI-based REST API for serving stock market data. This service provides endpoints for retrieving stock prices, calculating returns, and analyzing historical stock data.

## Prerequisites

- Python 3.8 or higher
- Stock data CSV file (expected format detailed below)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd backend
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies using either pip or poetry:

Using pip:
```bash
pip install -r requirements.txt
```

## Configuration

1. Place your stock data CSV file in the project root with the following columns:
   - `#` (ID)
   - `name` (Stock symbol)
   - `asof` (Date)
   - `volume` (Trading volume)
   - `close_usd` (Closing price)
   - `sector_level1` (Primary sector)
   - `sector_level2` (Secondary sector)

2. The default CSV path is `../stock-data (1)[69].csv`. To use a different path, modify `DEFAULT_CSV_PATH` in `app/api/stocks.py`.

## Running the Server

1. Start the development server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

2. Access the API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

