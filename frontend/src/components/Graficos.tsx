import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type {
  FaixaHistograma,
  PrecoUnidades,
  ResultadoRegressao,
  VendaCategoria,
  VendaMes,
  VendaProduto,
} from '../types/analise';
import { formatarMoeda, rotuloMes } from '../utils/formatar';

const COR = {
  rosa: '#e8668d',
  rosaEscuro: '#c94b73',
  rosaClaro: '#f6b8cb',
  roxo: '#7c5cc4',
  grade: '#ecd3db',
};

const MARGEM = { top: 10, right: 16, left: 4, bottom: 4 };

export function GraficoSerieTemporal({ dados }: { dados: VendaMes[] }) {
  const serie = dados.map((d) => ({ ...d, rotulo: rotuloMes(d.mes) }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={serie} margin={MARGEM}>
        <CartesianGrid strokeDasharray="3 3" stroke={COR.grade} />
        <XAxis dataKey="rotulo" />
        <YAxis yAxisId="faturamento" width={72} tickFormatter={(v: number) => `R$ ${v}`} />
        <YAxis yAxisId="pedidos" orientation="right" allowDecimals={false} width={40} />
        <Tooltip
          formatter={(valor, nome) =>
            nome === 'Faturamento' ? [formatarMoeda(Number(valor)), nome] : [String(valor), nome]
          }
        />
        <Legend />
        <Bar yAxisId="pedidos" dataKey="pedidos" name="Pedidos" fill={COR.rosaClaro} />
        <Line
          yAxisId="faturamento"
          type="monotone"
          dataKey="faturamento"
          name="Faturamento"
          stroke={COR.rosaEscuro}
          strokeWidth={3}
          dot={{ r: 4 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function GraficoCategorias({ dados }: { dados: VendaCategoria[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={dados} margin={MARGEM}>
        <CartesianGrid strokeDasharray="3 3" stroke={COR.grade} vertical={false} />
        <XAxis dataKey="categoria" />
        <YAxis width={72} tickFormatter={(v: number) => `R$ ${v}`} />
        <Tooltip formatter={(valor) => [formatarMoeda(Number(valor)), 'Faturamento']} />
        <Bar dataKey="faturamento" name="Faturamento" fill={COR.rosa} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function GraficoProdutos({ dados }: { dados: VendaProduto[] }) {
  return (
    <ResponsiveContainer width="100%" height={340}>
      <BarChart data={dados} layout="vertical" margin={{ ...MARGEM, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={COR.grade} horizontal={false} />
        <XAxis type="number" allowDecimals={false} />
        <YAxis type="category" dataKey="produto" width={190} />
        <Tooltip formatter={(valor) => [String(valor), 'Unidades vendidas']} />
        <Bar dataKey="unidades" name="Unidades vendidas" fill={COR.roxo} radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function GraficoHistograma({ dados }: { dados: FaixaHistograma[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={dados} margin={{ ...MARGEM, bottom: 24 }} barCategoryGap={0}>
        <CartesianGrid strokeDasharray="3 3" stroke={COR.grade} vertical={false} />
        <XAxis dataKey="faixa" interval={0} angle={-20} textAnchor="end" height={60} />
        <YAxis allowDecimals={false} width={40} />
        <Tooltip formatter={(valor) => [String(valor), 'Pedidos']} />
        <Bar dataKey="frequencia" name="Pedidos" fill={COR.rosa} stroke="#ffffff" />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface PontoDispersao {
  x: number;
  y: number;
  produto: string;
}

function TooltipDispersao({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: Partial<PontoDispersao> }>;
}) {
  const ponto = payload?.[0]?.payload;
  if (!active || !ponto?.produto) return null;
  return (
    <div className="tooltip-grafico">
      <strong>{ponto.produto}</strong>
      <div>Preço: {formatarMoeda(ponto.x ?? 0)}</div>
      <div>Unidades vendidas: {ponto.y}</div>
    </div>
  );
}

export function GraficoDispersao({
  pontos,
  regressao,
}: {
  pontos: PrecoUnidades[];
  regressao: ResultadoRegressao | null;
}) {
  const dados: PontoDispersao[] = pontos.map((p) => ({ x: p.preco, y: p.unidades, produto: p.produto }));

  return (
    <ResponsiveContainer width="100%" height={340}>
      <ComposedChart margin={{ ...MARGEM, left: 16, right: 32, bottom: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={COR.grade} />
        <XAxis
          type="number"
          dataKey="x"
          name="Preço"
          domain={['dataMin - 5', 'dataMax + 5']}
          tickFormatter={(v: number) => `R$ ${Math.round(v)}`}
          label={{ value: 'Preço do produto', position: 'insideBottom', offset: -12 }}
        />
        <YAxis
          type="number"
          dataKey="y"
          name="Unidades vendidas"
          width={64}
          domain={[0, 'auto']}
          allowDataOverflow
          label={{
            value: 'Unidades vendidas',
            angle: -90,
            position: 'insideLeft',
            offset: 4,
            style: { textAnchor: 'middle' },
          }}
        />
        <Tooltip content={<TooltipDispersao />} />
        <Legend verticalAlign="top" />
        <Scatter name="Produtos" data={dados} fill={COR.rosa} />
        {regressao && (
          <Line
            name="Reta de regressão"
            data={regressao.reta}
            dataKey="y"
            type="linear"
            dot={false}
            stroke={COR.roxo}
            strokeWidth={2}
            strokeDasharray="6 4"
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}