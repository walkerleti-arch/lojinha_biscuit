export interface ErroCampo {
  campo: string;
  mensagem: string;
}

export class ValidationError extends Error {
  public readonly status: number;
  public readonly erros: ErroCampo[];

  constructor(erros: ErroCampo[], status = 400) {
    super('Dados inválidos');
    this.name = 'ValidationError';
    this.status = status;
    this.erros = erros;
  }
}