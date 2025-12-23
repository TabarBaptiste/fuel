import React from 'react'

interface QuestionCardProps {
    icon: React.ReactNode
    iconBg: string
    question: string
    mainValue: string
    mainLabel: string
    subValue: string
}

export function QuestionCard({ icon, iconBg, question, mainValue, mainLabel, subValue }: QuestionCardProps) {
    return (
        <div className="card p-5 hover:scale-[1.02] transition-transform">
            <div className="flex items-center gap-3 mb-3">
                <div className={`bg-gradient-to-br ${iconBg} p-2.5 rounded-xl text-white shadow-lg`}>
                    {icon}
                </div>
                <h3 className="font-medium text-gray-600 text-sm">{question}</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{mainValue}</p>
            <p className="text-sm text-gray-500">{mainLabel}</p>
            <p className="text-xs text-gray-400 mt-2">{subValue}</p>
        </div>
    )
}
