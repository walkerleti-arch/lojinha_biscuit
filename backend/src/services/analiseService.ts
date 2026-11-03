import { Amostra, ResumoEstatistico } from '../models/Amostra';
import { RegressaoLinear } from '../models/RegressaoLinear';
import { FaixaHistograma, gerarHistograma } from '../utils/histograma';
import * as repo from '../repositories/analiseRepository';

const arredondar = (valor: number, casas = 2): number => {
  const fator = 10 ** casas;
  return Math.round(valor * fator) / fator;
};

export interface PontoReta {
  x: number;
  y: number;
}

export interface ResultadoRegressao {
  inclinacao: number;
  intercepto: number;
  correlacao: number;
  r2: number;
  reta: PontoReta[];
}

export interface Analise {
  serieTemporal: repo.VendaMes[];
  porCategoria: repo.VendaCategoria[];
  produtosMaisVendidos: repo.VendaProduto[];
  valorPedido: { resumo: ResumoEstatistico | null; histograma: FaixaHistograma[] };
  precoVsVendas: { pontos: repo.PrecoUnidades[]; regressao: ResultadoRegressao | null };
}

export async function obterAnalise(): Promise<Analise> {
  const [serieTemporal, porCategoria, produtosMaisVendidos, totais, pontos] = await Promise.all([
    repo.vendasPorMes(),
    repo.vendasPorCategoria(),
    repo.produtosMaisVendidos(8),
    repo.totaisDosPedidos(),
    repo.precoVsUnidades(),
  ]);

  const amostra = totais.length > 0 ? new Amostra(totais) : null;

  // Regressão linear: unidades vendidas em função do preço
  const x = pontos.map((p) => p.preco);
  const y = pontos.map((p) => p.unidades);
  let regressao: ResultadoRegressao | null = null;

  if (pontos.length >= 2 && new Set(x).size > 1) {
    const modelo = new RegressaoLinear(x, y);
    const xMin = Math.min(...x);
    const xMax = Math.max(...x);
    regressao = {
      inclinacao: arredondar(modelo.inclinacao, 4),
      intercepto: arredondar(modelo.intercepto, 2),
      correlacao: arredondar(modelo.correlacao, 3),
      r2: arredondar(modelo.r2, 3),
      reta: [
        { x: xMin, y: arredondar(modelo.prever(xMin)) },
        { x: xMax, y: arredondar(modelo.prever(xMax)) },
      ],
    };
  }

  return {
    serieTemporal,
    porCategoria,
    produtosMaisVendidos,
    valorPedido: {
      resumo: amostra ? amostra.resumo() : null,
      histograma: amostra ? gerarHistograma(amostra.valores()) : [],
    },
    precoVsVendas: { pontos, regressao },
  };
}