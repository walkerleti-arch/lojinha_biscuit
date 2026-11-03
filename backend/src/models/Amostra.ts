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

const arredondar = (valor: number): number => Math.round(valor * 100) / 100;

export class Amostra {
  readonly #valores: number[];

  constructor(valores: number[]) {
    if (valores.length === 0) {
      throw new Error('A amostra precisa ter pelo menos um valor');
    }
    if (valores.some((v) => !Number.isFinite(v))) {
      throw new Error('A amostra só aceita números válidos');
    }

    this.#valores = [...valores].sort((a, b) => a - b);
  }

  get n(): number {
    return this.#valores.length;
  }

  get minimo(): number {
    return this.#valores[0];
  }

  get maximo(): number {
    return this.#valores[this.#valores.length - 1];
  }

  media(): number {
    return this.#valores.reduce((soma, v) => soma + v, 0) / this.n;
  }

  percentil(p: number): number {
    if (p < 0 || p > 1) throw new RangeError('O percentil deve estar entre 0 e 1');
    const posicao = (this.n - 1) * p;
    const base = Math.floor(posicao);
    const resto = posicao - base;
    const atual = this.#valores[base];
    const proximo = this.#valores[base + 1];
    return proximo === undefined ? atual : atual + resto * (proximo - atual);
  }

  mediana(): number {
    return this.percentil(0.5);
  }

  desvioPadrao(): number {
    if (this.n === 1) return 0;
    const media = this.media();
    const somaQuadrados = this.#valores.reduce((soma, v) => soma + (v - media) ** 2, 0);
    return Math.sqrt(somaQuadrados / (this.n - 1));
  }

  coeficienteVariacao(): number {
    const media = this.media();
    return media === 0 ? 0 : (this.desvioPadrao() / media) * 100;
  }

  valores(): number[] {
    return [...this.#valores];
  }

  resumo(): ResumoEstatistico {
    return {
      n: this.n,
      media: arredondar(this.media()),
      mediana: arredondar(this.mediana()),
      desvioPadrao: arredondar(this.desvioPadrao()),
      minimo: arredondar(this.minimo),
      maximo: arredondar(this.maximo),
      q1: arredondar(this.percentil(0.25)),
      q3: arredondar(this.percentil(0.75)),
      coeficienteVariacao: arredondar(this.coeficienteVariacao()),
    };
  }
}