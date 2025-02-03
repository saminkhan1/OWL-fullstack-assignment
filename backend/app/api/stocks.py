from fastapi import APIRouter, HTTPException, Query, Response
from datetime import datetime, timedelta
from typing import List, Optional
from pathlib import Path
import traceback
import logging
from ..services.stock_service import StockService
from ..models.stock import StockPrice, StockPriceList, CumulativeReturnRequest, CumulativeReturnResponse

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

router = APIRouter()

# Default CSV path
DEFAULT_CSV_PATH = Path(__file__).parent.parent.parent.parent / "stock-data (1)[69].csv"
_stock_service: Optional[StockService] = None

def get_stock_service(csv_path: Optional[str] = None) -> StockService:
    """Get or create StockService instance"""
    global _stock_service
    if _stock_service is None:
        _stock_service = StockService(str(csv_path or DEFAULT_CSV_PATH))
    return _stock_service

def set_stock_service(service: Optional[StockService]) -> None:
    """Set StockService instance (for testing)"""
    global _stock_service
    _stock_service = service

@router.get("/", response_model=List[str])
async def get_stocks(response: Response):
    """Get list of all available stocks"""
    try:
        # Cache for 1 hour since stock list rarely changes
        response.headers["Cache-Control"] = "public, max-age=3600"
        return get_stock_service().get_all_stocks()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}\n{traceback.format_exc()}")

@router.get("/{name}/prices", response_model=StockPriceList)
async def get_stock_prices(
    response: Response,
    name: str,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000)
):
    """Get all price data for a specific stock with pagination"""
    try:
        # Cache for 5 minutes for historical data
        response.headers["Cache-Control"] = "public, max-age=300"
        logger.debug(f"Getting prices for stock: {name} with skip={skip}, limit={limit}")
        service = get_stock_service()
        logger.debug(f"Got service: {service}")
        result = service.get_stock_prices(name, skip=skip, limit=limit)
        logger.debug(f"Got result: {result}")
        return result
    except Exception as e:
        logger.error(f"Error getting stock prices: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}\n{traceback.format_exc()}")

@router.get("/{name}/prices/{date}", response_model=StockPrice)
async def get_price_at_date(name: str, date: datetime, response: Response):
    """Get stock price for a specific date"""
    try:
        # Cache historical data for longer (1 day)
        if date.date() < datetime.now().date():
            response.headers["Cache-Control"] = "public, max-age=86400"
        logger.debug(f"Getting price for stock {name} at date {date}")
        service = get_stock_service()
        logger.debug(f"Got service: {service}")
        price = service.get_price_at_date(name, date)
        logger.debug(f"Got price: {price}")
        if price is None:
            logger.debug(f"No price found for {name} at {date}")
            raise HTTPException(
                status_code=404,
                detail=f"Price not found for {name} at {date}"
            )
        return price
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting price at date: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}\n{traceback.format_exc()}")

@router.post("/{name}/returns", response_model=CumulativeReturnResponse)
async def calculate_returns(name: str, request: CumulativeReturnRequest):
    """Calculate cumulative returns between two dates"""
    try:
        start_datetime = datetime.combine(request.start_date, datetime.min.time())
        end_datetime = datetime.combine(request.end_date, datetime.min.time())
        return get_stock_service().calculate_returns(name, start_datetime, end_datetime)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}\n{traceback.format_exc()}") 