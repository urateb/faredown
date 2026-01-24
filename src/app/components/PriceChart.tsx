'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FlightOffer } from './FlightResults';

interface PriceChartProps {
    results: FlightOffer[];
}

export default function PriceChart({ results }: PriceChartProps) {
    if (!results || results.length === 0) return null;

    // Process data: Extract airline and price
    const data = results.map(offer => {
        const airlineCode = offer.itineraries[0].segments[0].carrierCode;
        return {
            name: airlineCode,
            price: parseFloat(offer.price.total),
            currency: offer.price.currency
        };
    });

    // Sort by price for better visualization
    const sortedData = [...data].sort((a, b) => a.price - b.price);

    // Provide a simple tooltip component
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
                    <p className="font-bold text-gray-900">{label}</p>
                    <p className="text-blue-600 font-semibold">
                        {payload[0].payload.currency} {payload[0].value.toFixed(2)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-64 bg-white/50 backdrop-blur-sm rounded-2xl p-4 mb-8 shadow-sm border border-gray-100 animate-fade-in">
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wide mb-4">Price Overview</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sortedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 10 }}
                        tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
                    <Bar dataKey="price" radius={[4, 4, 0, 0]}>
                        {sortedData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#3b82f6'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
