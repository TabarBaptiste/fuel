import React from 'react'

interface ChartCardProps {
    title?: string
    subtitle?: string
    children: React.ReactNode
    icon?: React.ReactNode
}

export function ChartCard({ title, subtitle, children, icon }: ChartCardProps) {
    return (
        <div className="card p-5">
            <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
                {icon}
                {title}
            </h3>
            <p className="text-sm text-gray-500 mb-4">{subtitle}</p>
            {children}
        </div>
    )
}
