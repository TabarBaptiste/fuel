import React from 'react'

interface FormFieldProps {
    label: string
    children: React.ReactNode
    error?: string | null
}

export function FormField({ label, children, error }: FormFieldProps) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
            {children}
            {error && (
                <p className="text-xs text-red-600 mt-1">{error}</p>
            )}
        </div>
    )
}
