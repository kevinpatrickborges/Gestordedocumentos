import { useEffect, useState } from 'react';
import { BarChart } from '@/components/ui/BarChart';
import { PieChart } from '@/components/ui/PieChart';
import { StatsCard } from '@/components/ui/StatsCard';
import { getCardData, getAtendimentosPorMes, getStatusDistribuicao, CardData } from '@/services/estatisticasService';
import { DollarSign, Users, BarChart as BarChartIcon, PieChart as PieChartIcon } from 'lucide-react';

// Tipos específicos para os dados dos gráficos
interface BarChartData {
  name: string;
  total: number;
}

interface PieChartData {
  name: string;
  value: number;
}

export function RelatoriosPage() {
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [atendimentosPorMes, setAtendimentosPorMes] = useState<BarChartData[]>([]);
  const [statusDistribuicao, setStatusDistribuicao] = useState<PieChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cards, atendimentos, status] = await Promise.all([
          getCardData(),
          getAtendimentosPorMes(),
          getStatusDistribuicao(),
        ]);

        setCardData(cards ?? null);
        // Garantir arrays válidos antes de mapear
        const atendArr = Array.isArray(atendimentos) ? atendimentos : [];
        const statusArr = Array.isArray(status) ? status : [];

        setAtendimentosPorMes(atendArr.map((a: any) => ({ name: a.name, total: Number(a.total) || 0 })));
        setStatusDistribuicao(statusArr.map((s: any) => ({ name: s.name, value: Number(s.value) || 0 })));
      } catch (err) {
        setError('Falha ao carregar os dados de estatísticas.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Atendimentos"
          value={cardData?.totalAtendimentos ?? 0}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Total de Desarquivamentos"
          value={cardData?.totalDesarquivamentos ?? 0}
          icon={<PieChartIcon className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Atendimentos Pendentes"
          value={cardData?.atendimentosPendentes ?? 0}
          icon={<BarChartIcon className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Atendimentos (Mês)"
          value={cardData?.atendimentosEsteMes ?? 0}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <BarChart data={atendimentosPorMes} title="Atendimentos por Mês (Último Ano)" />
        </div>
        <div className="col-span-3">
          <PieChart data={statusDistribuicao} title="Distribuição por Status" />
        </div>
      </div>
    </div>
  );
}
