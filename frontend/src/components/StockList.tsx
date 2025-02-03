import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface StockListProps {
    stocks: string[];
    onSelectStock: (symbol: string) => void;
    selectedStock?: string;
    loading?: boolean;
    error?: string;
}

export function StockList({ stocks, onSelectStock, selectedStock, loading, error }: StockListProps) {
    if (loading) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Stocks</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="flex items-center space-x-4">
                                <Skeleton className="h-12 w-full" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Stocks</CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Stocks</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-2">
                        {stocks.map((symbol) => (
                            <Button
                                key={symbol}
                                variant={selectedStock === symbol ? "default" : "ghost"}
                                className="w-full justify-start transition-colors hover:bg-primary/10 data-[state=open]:bg-primary/20"
                                onClick={() => onSelectStock(symbol)}
                            >
                                <div className="flex items-center space-x-2">
                                    <span className="font-medium">{symbol}</span>
                                </div>
                            </Button>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
} 