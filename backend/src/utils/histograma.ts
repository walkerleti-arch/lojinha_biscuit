export interface FaixaHistograma {
  faixa: string;
  inicio: number;
  fim: number;
  frequencia: number;
}

const arredondar = (v: number): number => Math.round(v * 100) / 100;

function larguraAgradavel(bruta: number): number {
  const potencia = 10 ** Math.floor(Math.log10(bruta));
  for (const fator of [1, 2, 5, 10]) {
    if (fator * potencia >= bruta) return fator * potencia;
  }
  return 10 * potencia;
}

export function gerarHistograma(valores: number[]): FaixaHistograma[] {
  if (valores.length === 0) return [];

  const minimo = valores.reduce((m, v) => Math.min(m, v), Infinity);
  const maximo = valores.reduce((m, v) => Math.max(m, v), -Infinity);

  if (minimo === maximo) {
    return [{ faixa: `R$ ${minimo}`, inicio: minimo, fim: minimo, frequencia: valores.length }];
  }

  const k = Math.ceil(Math.log2(valores.length) + 1);
  const largura = larguraAgradavel((maximo - minimo) / k);
  const inicio = Math.floor(minimo / largura) * largura;
  const quantidade = Math.floor((maximo - inicio) / largura) + 1;

  const faixas: FaixaHistograma[] = Array.from({ length: quantidade }, (_, i) => {
    const ini = arredondar(inicio + i * largura);
    const fim = arredondar(ini + largura);
    return { faixa: `R$ ${ini} a ${fim}`, inicio: ini, fim, frequencia: 0 };
  });

  for (const valor of valores) {
    const indice = Math.min(Math.floor((valor - inicio) / largura), quantidade - 1);
    faixas[indice].frequencia++;
  }

  return faixas;
}