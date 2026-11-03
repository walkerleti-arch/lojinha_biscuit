export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

// Formato de erro que a API devolve: { erros: [{ campo, mensagem }] }
export interface ErroCampo {
  campo: string;
  mensagem: string;
}

export class ApiError extends Error {
  status: number;
  erros: ErroCampo[];

  constructor(status: number, erros: ErroCampo[]) {
    super('Erro retornado pela API');
    this.name = 'ApiError';
    this.status = status;
    this.erros = erros;
  }
}