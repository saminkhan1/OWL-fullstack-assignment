export interface StockPrice {
    id: number;
    name: string;
    asof: string;
    volume: number;
    close_usd: number;
    sector_level1: string;
    sector_level2: string;
}

export interface StockPriceList {
    data: StockPrice[];
    total: number;
}

export interface CumulativeReturnRequest {
    start_date: string;
    end_date: string;
}

export interface CumulativeReturnResponse {
    name: string;
    start_date: string;
    end_date: string;
    cumulative_return: number;
    start_price: number;
    end_price: number;
} 