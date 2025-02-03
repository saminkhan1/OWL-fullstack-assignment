import pandas as pd
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Optional, List
import logging
from functools import lru_cache

logger = logging.getLogger(__name__)

class DataValidationError(Exception):
    """Custom exception for data validation errors"""
    pass

class StockDataLoader:
    def __init__(self, csv_path: str):
        self.csv_path = csv_path
        self._data = None
        self._stock_data_cache: Dict[str, pd.DataFrame] = {}
        self._last_modified = None

    def validate_data(self, df: pd.DataFrame) -> None:
        """Validate the loaded data"""
        required_columns = ['#', 'name', 'asof', 'volume', 'close_usd', 'sector_level1', 'sector_level2']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise DataValidationError(f"Missing required columns: {missing_columns}")
        
        # Validate data types and constraints
        if df['volume'].lt(0).any():
            raise DataValidationError("Found negative volume values")
        if df['close_usd'].lt(0).any():
            raise DataValidationError("Found negative price values")
        if df['name'].isna().any():
            raise DataValidationError("Found missing stock names")

    def load_data(self) -> pd.DataFrame:
        """Load the CSV file into a pandas DataFrame with validation"""
        if self._data is None:
            try:
                if not Path(self.csv_path).exists():
                    raise FileNotFoundError(f"CSV file not found: {self.csv_path}")
                
                self._data = pd.read_csv(self.csv_path)
                
                # Validate data structure
                self.validate_data(self._data)
                
                # Convert and clean data
                self._data['asof'] = pd.to_datetime(self._data['asof']).dt.tz_localize(None)  # Ensure timezone-naive
                self._data['close_usd'] = pd.to_numeric(self._data['close_usd'], errors='coerce')
                self._data['volume'] = pd.to_numeric(self._data['volume'], errors='coerce')
                
                # Drop rows with invalid numerical values
                invalid_rows = self._data[self._data[['close_usd', 'volume']].isna().any(axis=1)]
                if not invalid_rows.empty:
                    logger.warning(f"Dropping {len(invalid_rows)} rows with invalid numerical values")
                    self._data = self._data.dropna(subset=['close_usd', 'volume'])
                
            except Exception as e:
                logger.error(f"Error loading CSV data: {str(e)}")
                raise
                
        return self._data

    def _check_file_modified(self) -> bool:
        """Check if CSV file has been modified"""
        current_mtime = Path(self.csv_path).stat().st_mtime
        if self._last_modified is None or current_mtime > self._last_modified:
            self._last_modified = current_mtime
            return True
        return False

    @lru_cache(maxsize=100)
    def get_unique_stocks(self) -> List[str]:
        """Get list of unique stock names with caching"""
        df = self.load_data()
        return df['name'].unique().tolist()

    def get_stock_data(self, name: str) -> pd.DataFrame:
        """Get all data for a specific stock with caching"""
        # Check if we need to reload data
        if self._check_file_modified():
            self._stock_data_cache.clear()
            self._data = None
        
        if name not in self._stock_data_cache:
            df = self.load_data()
            self._stock_data_cache[name] = df[df['name'] == name].copy()
        
        return self._stock_data_cache[name]

    def get_stock_price_at_date(self, name: str, date: datetime) -> pd.DataFrame:
        """Get stock data for a specific date with optimization"""
        df = self.get_stock_data(name)
        # Convert both to timezone-naive dates for comparison
        target_date = pd.Timestamp(date).tz_localize(None).normalize()
        return df[df['asof'].dt.normalize() == target_date]

    def calculate_cumulative_return(self, name: str, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Calculate cumulative return between two dates with optimization"""
        df = self.get_stock_data(name)
        # Convert dates to timezone-naive for comparison
        start_ts = pd.Timestamp(start_date).tz_localize(None)
        end_ts = pd.Timestamp(end_date).tz_localize(None)
        df = df[(df['asof'] >= start_ts) & (df['asof'] <= end_ts)]
        
        if len(df) < 2:
            raise ValueError("Insufficient data points for calculation")
            
        start_price = df.iloc[0]['close_usd']
        end_price = df.iloc[-1]['close_usd']
        cumulative_return = round(((end_price - start_price) / start_price * 100), 2)
        
        return {
            "name": name,
            "start_date": start_ts,
            "end_date": end_ts,
            "cumulative_return": cumulative_return,
            "start_price": start_price,
            "end_price": end_price
        } 