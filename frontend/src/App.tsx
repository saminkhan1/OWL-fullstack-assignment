import { useState, useEffect } from 'react'
import { StockList } from './components/StockList'
import { StockChart } from './components/StockChart'
import { CumulativeReturns } from './components/CumulativeReturns'
import { api } from './lib/api'
import { StockPrice } from './lib/types'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import './App.css'

interface StockData {
  date: string;
  price: number;
}

function App() {
  const [stocks, setStocks] = useState<string[]>([])
  const [selectedStock, setSelectedStock] = useState<string | undefined>(undefined)
  const [stockData, setStockData] = useState<StockData[]>([])
  const [loading, setLoading] = useState(true)
  const [chartLoading, setChartLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chartError, setChartError] = useState<string | null>(null)

  // Fetch list of stocks using api service
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const data = await api.getAllStocks()
        setStocks(data)
      } catch (err) {
        setError('Failed to fetch stocks list')
        console.error('Error fetching stocks:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStocks()
  }, [])

  // Fetch data for selected stock using api service
  useEffect(() => {
    if (!selectedStock) return

    const fetchStockData = async () => {
      setChartLoading(true)
      setChartError(null)
      try {
        const data = await api.getStockPrices(selectedStock)
        if (data && Array.isArray(data.data)) {
          setStockData(data.data.map((item: StockPrice) => ({
            date: item.asof,
            price: item.close_usd
          })))
        } else {
          console.error('Invalid stock price data format:', data)
          setStockData([])
          setChartError('Invalid data format received')
        }
      } catch (err) {
        setChartError('Failed to fetch stock data')
        console.error('Error fetching stock data:', err)
        setStockData([])
      } finally {
        setChartLoading(false)
      }
    }

    fetchStockData()
  }, [selectedStock])

  const handleStockSelect = (symbol: string) => {
    setSelectedStock(symbol)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-gray-950 dark:[background:radial-gradient(#1f2937_1px,transparent_1px)]"></div>
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center space-x-4">
          <h1 className="text-4xl font-bold text-primary">Stock Market Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <StockList
              stocks={stocks}
              selectedStock={selectedStock}
              onSelectStock={handleStockSelect}
              loading={loading}
              error={error || undefined}
            />
          </div>

          <div className="md:col-span-2 space-y-6">
            {chartError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {chartError}
                </AlertDescription>
              </Alert>
            )}

            {chartLoading ? (
              <div className="flex justify-center items-center h-[600px] rounded-xl border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="text-sm text-muted-foreground">Loading chart data...</p>
                </div>
              </div>
            ) : selectedStock && stockData.length > 0 ? (
              <div className="space-y-6">
                <div className="rounded-xl border bg-card p-6">
                  <StockChart
                    data={stockData}
                    symbol={selectedStock}
                  />
                </div>
                <div className="rounded-xl border bg-card p-6">
                  <CumulativeReturns selectedStock={selectedStock} />
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-[600px] rounded-xl border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <p className="text-muted-foreground">Select a stock to view its price chart</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
