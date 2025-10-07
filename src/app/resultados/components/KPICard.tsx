"use client";

import { memo } from 'react';
import { type LucideIcon } from 'lucide-react'; // Importação do tipo para o ícone
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Definindo as props de forma mais explícita
interface KPICardProps {
    title: string;
    value: string;
    subtitle: string;
    icon: LucideIcon; // Usando um tipo mais específico que 'any'
    trend?: 'positive' | 'negative' | 'neutral';
}

const KPICard = memo(({ title, value, subtitle, icon: Icon, trend }: KPICardProps) => {
    
    // Função para determinar a cor com base na tendência
    const getTrendColor = () => {
        switch (trend) {
            case 'positive':
                return 'text-green-600';
            case 'negative':
                return 'text-red-600';
            default:
                return 'text-gray-900'; // Cor padrão um pouco mais escura para destaque
        }
    };

    return (
        <Card className="transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
                <Icon className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${getTrendColor()}`}>{value}</div>
                <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            </CardContent>
        </Card>
    );
});

KPICard.displayName = 'KPICard';

export default KPICard;