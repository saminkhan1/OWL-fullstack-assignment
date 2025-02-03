import { useState } from 'react';
import { Card, Title, LineChart, Text, Subtitle, Flex, Badge } from "@tremor/react";
import { Input } from './ui/input';
import { Button } from './ui/button';
import { api } from '@/lib/api';
import { format } from 'date-fns';

interface StockData {
    date: string;
    price: number;
}

interface StockChartProps {
    data: StockData[];
    symbol: string;
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);

const formatDate = (dateStr: string) =>
    format(new Date(dateStr), 'MMM d, yyyy');

export function StockChart({ data, symbol }: StockChartProps) {
    const [selectedDate, setSelectedDate] = useState('');
    const [priceAtDate, setPriceAtDate] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const stats = !data.length ? null : {
        maxPrice: Math.max(...data.map(d => d.price)),
        minPrice: Math.min(...data.map(d => d.price)),
        priceChange: data[data.length - 1].price - data[0].price,
        percentChange: ((data[data.length - 1].price - data[0].price) / data[0].price) * 100
    };

    const getPriceAtDate = async () => {
        if (!selectedDate) return;

        setLoading(true);
        setError(null);
        try {
            const response = await api.getPriceAtDate(symbol, new Date(selectedDate));
            setPriceAtDate(response.close_usd);
        } catch (err) {
            setError('Failed to fetch price for selected date');
            console.error('Error fetching price:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!stats) return null;

    const chartColor = stats.percentChange >= 0 ? "emerald" : "amber";

    return (
        <Card className="mt-4">
            <Flex>
                <div>
                    <Title>{symbol} Stock Price</Title>
                    <Subtitle className="mt-2">
                        Historical price data from {formatDate(data[0].date)} to {formatDate(data[data.length - 1].date)}
                    </Subtitle>
                </div>
                <Badge color={stats.percentChange >= 0 ? "emerald" : "amber"} size="xl">
                    {stats.percentChange >= 0 ? "+" : ""}{stats.percentChange.toFixed(2)}%
                </Badge>
            </Flex>

            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Card decoration="top" decorationColor={chartColor}>
                    <Text>Current Price</Text>
                    <Text className="mt-2 font-medium">{formatCurrency(data[data.length - 1].price)}</Text>
                </Card>
                <Card decoration="top" decorationColor={chartColor}>
                    <Text>Price Change</Text>
                    <Text className="mt-2 font-medium">{formatCurrency(stats.priceChange)}</Text>
                </Card>
                <Card decoration="top" decorationColor="emerald">
                    <Text>Period High</Text>
                    <Text className="mt-2 font-medium">{formatCurrency(stats.maxPrice)}</Text>
                </Card>
                <Card decoration="top" decorationColor="amber">
                    <Text>Period Low</Text>
                    <Text className="mt-2 font-medium">{formatCurrency(stats.minPrice)}</Text>
                </Card>
            </div>

            <div className="mt-4 flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                    <label htmlFor="date-lookup" className="text-sm font-medium">
                        Look up price at date
                    </label>
                    <Input
                        id="date-lookup"
                        type="date"
                        value={selectedDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedDate(e.target.value)}
                    />
                </div>
                <Button
                    onClick={getPriceAtDate}
                    disabled={!selectedDate || loading}
                >
                    {loading ? 'Loading...' : 'Get Price'}
                </Button>
            </div>

            {error && (
                <div className="mt-2 text-red-500 text-sm">{error}</div>
            )}

            {priceAtDate !== null && (
                <div className="mt-2 text-sm">
                    <span className="font-medium">Price on {selectedDate}:</span>
                    <span className="ml-2">{formatCurrency(priceAtDate)}</span>
                </div>
            )}

            <LineChart
                className="mt-6 h-72"
                data={data}
                index="date"
                categories={["price"]}
                colors={[chartColor]}
                yAxisWidth={60}
                showLegend={false}
                showGridLines={true}
                curveType="monotone"
                showAnimation={true}
                valueFormatter={formatCurrency}
                enableLegendSlider={true}
                showXAxis={true}
                showYAxis={true}
                autoMinValue={false}
                minValue={Math.floor(stats.minPrice * 0.95)}
                maxValue={Math.ceil(stats.maxPrice * 1.05)}
                customTooltip={({ payload }) => {
                    if (!payload?.[0]) return null;
                    const data = payload[0].payload as StockData;
                    return (
                        <div className="p-2 bg-white shadow-lg rounded-lg border">
                            <div className="text-tremor-default font-medium">{formatDate(data.date)}</div>
                            <div className="text-tremor-default text-tremor-content">
                                Price: {formatCurrency(data.price)}
                            </div>
                        </div>
                    );
                }}
            />
        </Card>
    );
}
