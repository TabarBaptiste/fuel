import React from 'react'
import { Fuel } from 'lucide-react'

interface EmptyStateProps {
    message: string
}

export function EmptyState({ message }: EmptyStateProps) {
    return (
        <div className="card p-12 text-center">
            <Fuel className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{message}</p>
        </div>
    )
}
