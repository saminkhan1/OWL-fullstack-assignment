from datetime import datetime
from typing import List, Optional
from ..utils.csv_loader import StockDataLoader
from ..models.stock import StockPrice, StockPriceList, CumulativeReturnResponse

class StockService:
    def __init__(self, csv_path: str):
        self.data_loader = StockDataLoader(csv_path)

    def get_all_stocks(self) -> List[str]:
        """Get list of all unique stock names"""
        return self.data_loader.get_unique_stocks()

    def get_stock_prices(self, name: str, skip: int = 0, limit: int = 100) -> StockPriceList:
        """Get all price data for a specific stock with pagination"""
        df = self.data_loader.get_stock_data(name)
        total_records = len(df)
        
        # Apply pagination
        df = df.iloc[skip:skip + limit]
        
        prices = []
        for _, row in df.iterrows():
            prices.append(
                StockPrice(
                    **{
                        "#": row['#'],
                        "name": name,
                        "asof": row['asof'].date(),
                        "volume": row['volume'],
                        "close_usd": row['close_usd'],
                        "sector_level1": row['sector_level1'],
                        "sector_level2": row['sector_level2']
                    }
                )
            )
        return StockPriceList(data=prices, total=total_records)

    def get_price_at_date(self, name: str, date: datetime) -> Optional[StockPrice]:
        """Get stock price for a specific date"""
        df = self.data_loader.get_stock_price_at_date(name, date)
        if df.empty:
            return None
        row = df.iloc[0]
        return StockPrice(
            **{
                "#": row['#'],
                "name": name,
                "asof": row['asof'].date(),
                "volume": row['volume'],
                "close_usd": row['close_usd'],
                "sector_level1": row['sector_level1'],
                "sector_level2": row['sector_level2']
            }
        )

    def calculate_returns(self, name: str, start_date: datetime, end_date: datetime) -> CumulativeReturnResponse:
        """Calculate cumulative returns between two dates"""
        result = self.data_loader.calculate_cumulative_return(name, start_date, end_date)
        return CumulativeReturnResponse(
            name=result['name'],
            start_date=result['start_date'].date(),
            end_date=result['end_date'].date(),
            cumulative_return=result['cumulative_return'],
            start_price=result['start_price'],
            end_price=result['end_price']
        ) 