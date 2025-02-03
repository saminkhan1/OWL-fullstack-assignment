from pydantic import BaseModel, Field, field_validator
from datetime import date
from typing import List, Optional

class StockPrice(BaseModel):
    """Represents a single stock price entry"""
    id: int = Field(..., alias="#", ge=1)
    name: str = Field(..., min_length=1)
    asof: date
    volume: int = Field(..., ge=0)
    close_usd: float = Field(..., ge=0)
    sector_level1: str = Field(..., min_length=1)
    sector_level2: str = Field(..., min_length=1)

class StockPriceList(BaseModel):
    """List of stock prices with pagination"""
    data: List[StockPrice]
    total: int = Field(..., ge=0)

class CumulativeReturnRequest(BaseModel):
    """Request model for calculating returns"""
    start_date: date
    end_date: date

    @field_validator("end_date")
    @classmethod
    def validate_dates(cls, v: date, info):
        start_date = info.data.get("start_date")
        if start_date and v < start_date:
            raise ValueError("end_date must be after start_date")
        return v

class CumulativeReturnResponse(BaseModel):
    """Response model for cumulative returns"""
    name: str = Field(..., min_length=1)
    start_date: date
    end_date: date
    cumulative_return: float
    start_price: float = Field(..., ge=0)
    end_price: float = Field(..., ge=0)

    @field_validator("end_date")
    @classmethod
    def validate_dates(cls, v: date, info):
        start_date = info.data.get("start_date")
        if start_date and v < start_date:
            raise ValueError("end_date must be after start_date")
        return v 