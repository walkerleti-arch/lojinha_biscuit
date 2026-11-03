export interface VendaMes {
  mes: string;
  pedidos: number;
  faturamento: number;
}

export interface VendaCategoria {
  categoria: string;
  unidades: number;
  faturamento: number;
}

export interface VendaProduto {
  produto: string;
  unidades: number;
  faturamento: number;
}

export interface ResumoEstatistico {
  n: number;
  media: number;
  mediana: number;
  desvioPadrao: number;
  minimo: number;
  maximo: number;
  q1: number;
  q3: number;
  coeficienteVariacao: number;
}

export interface FaixaHistograma {
  faixa: string;
  inicio: number;
  fim: number;
  frequencia: number;
}

export interface PrecoUnidades {
  produto: string;
  preco: number;
  unidades: number;
}

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
  serieTemporal: VendaMes[];
  porCategoria: VendaCategoria[];
  produtosMaisVendidos: VendaProduto[];
  valorPedido: { resumo: ResumoEstatistico | null; histograma: FaixaHistograma[] };
  precoVsVendas: { pontos: PrecoUnidades[]; regressao: ResultadoRegressao | null };
}