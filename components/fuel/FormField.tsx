import React from 'react'

interface FormFieldProps {
    label: string
    children: React.ReactNode
}

export function FormField({ label, children }: FormFieldProps) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
            {children}
        </div>
    )
}
