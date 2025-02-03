import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { CumulativeReturnResponse } from '@/lib/types';

interface CumulativeReturnsProps {
    selectedStock?: string;
}

export function CumulativeReturns({ selectedStock }: CumulativeReturnsProps) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<CumulativeReturnResponse | null>(null);

    const calculateReturns = async () => {
        if (!selectedStock) return;

        setLoading(true);
        setError(null);
        try {
            const response = await api.calculateReturns(selectedStock, {
                start_date: startDate,
                end_date: endDate
            });
            setResult(response);
        } catch (err) {
            setError('Failed to calculate returns');
            console.error('Error calculating returns:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!selectedStock) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Cumulative Returns</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-500">Select a stock to calculate returns</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Cumulative Returns for {selectedStock}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="start-date" className="text-sm font-medium">
                                Start Date
                            </label>
                            <Input
                                id="start-date"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="end-date" className="text-sm font-medium">
                                End Date
                            </label>
                            <Input
                                id="end-date"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <Button
                        onClick={calculateReturns}
                        disabled={!startDate || !endDate || loading}
                        className="w-full"
                    >
                        {loading ? 'Calculating...' : 'Calculate Returns'}
                    </Button>

                    {error && (
                        <div className="text-red-500 text-sm">{error}</div>
                    )}

                    {result && (
                        <div className="mt-4 space-y-2">
                            <div className="flex justify-between">
                                <span className="font-medium">Start Price:</span>
                                <span>${result.start_price.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">End Price:</span>
                                <span>${result.end_price.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold">
                                <span>Cumulative Return:</span>
                                <span className={result.cumulative_return >= 0 ? 'text-green-600' : 'text-red-600'}>
                                    {result.cumulative_return.toFixed(2)}%
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 