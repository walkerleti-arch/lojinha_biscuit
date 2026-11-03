export class RegressaoLinear {
  readonly #inclinacao: number;
  readonly #intercepto: number;
  readonly #correlacao: number;

  constructor(x: number[], y: number[]) {
    if (x.length !== y.length) throw new Error('x e y precisam ter o mesmo tamanho');
    if (x.length < 2) throw new Error('A regressão precisa de pelo menos 2 pontos');

    const n = x.length;
    const mediaX = x.reduce((s, v) => s + v, 0) / n;
    const mediaY = y.reduce((s, v) => s + v, 0) / n;

    let sxx = 0;
    let syy = 0;
    let sxy = 0;
    for (let i = 0; i < n; i++) {
      const dx = x[i] - mediaX;
      const dy = y[i] - mediaY;
      sxx += dx * dx;
      syy += dy * dy;
      sxy += dx * dy;
    }

    if (sxx === 0) throw new Error('Todos os valores de x são iguais: não há reta possível');

    this.#inclinacao = sxy / sxx;
    this.#intercepto = mediaY - this.#inclinacao * mediaX;
    this.#correlacao = syy === 0 ? 0 : sxy / Math.sqrt(sxx * syy);
  }

  get inclinacao(): number {
    return this.#inclinacao;
  }

  get intercepto(): number {
    return this.#intercepto;
  }

  get correlacao(): number {
    return this.#correlacao;
  }

  get r2(): number {
    return this.#correlacao ** 2;
  }

  prever(x: number): number {
    return this.#intercepto + this.#inclinacao * x;
  }
}