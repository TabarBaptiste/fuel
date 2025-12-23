import React from 'react'

interface ChartCardProps {
    title: string
    subtitle: string
    children: React.ReactNode
}

export function ChartCard({ title, subtitle, children }: ChartCardProps) {
    return (
        <div className="card p-5">
            <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
            <p className="text-sm text-gray-500 mb-4">{subtitle}</p>
            {children}
        </div>
    )
}
