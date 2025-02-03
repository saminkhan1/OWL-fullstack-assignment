import { StockPrice, StockPriceList, CumulativeReturnRequest, CumulativeReturnResponse } from './types';

// Use environment variable if available, fallback to default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/stocks';

const handleResponse = async <T>(response: Response, errorMessage: string): Promise<T> => {
    if (!response.ok) {
        console.error(`${errorMessage}:`, {
            status: response.status,
            statusText: response.statusText,
            url: response.url
        });
        throw new Error(`${errorMessage}: ${response.statusText}`);
    }
    return response.json();
};

export const api = {
    async getAllStocks(): Promise<string[]> {
        try {
            console.log('Fetching stocks from:', `${API_BASE_URL}/`);
            const response = await fetch(`${API_BASE_URL}/`, {
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                console.error('Failed to fetch stocks:', {
                    status: response.status,
                    statusText: response.statusText,
                    url: response.url
                });
                return [];
            }

            const data = await response.json();

            // Type safety check
            if (!Array.isArray(data)) {
                console.error('Invalid response format for stocks:', data);
                return [];
            }

            // Validate that we got strings
            if (data.some(item => typeof item !== 'string')) {
                console.error('Invalid stock data format:', data);
                return data.filter(item => typeof item === 'string');
            }

            return data;
        } catch (error) {
            console.error('Error fetching stocks:', {
                error,
                endpoint: `${API_BASE_URL}/`
            });
            return [];
        }
    },

    async getStockPrices(name: string, skip = 0, limit = 100): Promise<StockPriceList> {
        try {
            const response = await fetch(
                `${API_BASE_URL}/${name}/prices?skip=${skip}&limit=${limit}`,
                {
                    headers: {
                        'Accept': 'application/json',
                    },
                }
            );
            return handleResponse(response, `Failed to fetch prices for ${name}`);
        } catch (error) {
            console.error('Error fetching stock prices:', {
                error,
                stock: name,
                endpoint: `${API_BASE_URL}/${name}/prices`
            });
            throw error;
        }
    },

    async getPriceAtDate(name: string, date: Date): Promise<StockPrice> {
        const formattedDate = date.toISOString();
        const response = await fetch(
            `${API_BASE_URL}/${name}/prices/${formattedDate}`
        );
        if (!response.ok) throw new Error(`Failed to fetch price for ${name} at ${formattedDate}`);
        return response.json();
    },

    async calculateReturns(
        name: string,
        request: CumulativeReturnRequest
    ): Promise<CumulativeReturnResponse> {
        const response = await fetch(`${API_BASE_URL}/${name}/returns`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });
        if (!response.ok) throw new Error(`Failed to calculate returns for ${name}`);
        return response.json();
    },
}; 