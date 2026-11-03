import { API_URL, ApiError } from './api';

export interface DadosCadastro {
  nome: string;
  email: string;
  cpf: string;
  senha: string;
}

export interface RespostaCadastro {
  mensagem: string;
  usuario: { id: number; nome: string; email: string };
}

export async function cadastrarUsuario(dados: DadosCadastro): Promise<RespostaCadastro> {
  let resposta: Response;

  try {
    resposta = await fetch(`${API_URL}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
  } catch {
    // Servidor desligado, sem internet, CORS bloqueado...
    throw new ApiError(0, [
      { campo: 'geral', mensagem: 'Não foi possível conectar ao servidor. Tente novamente.' },
    ]);
  }

  const corpo = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    throw new ApiError(
      resposta.status,
      corpo?.erros ?? [{ campo: 'geral', mensagem: 'Erro inesperado. Tente novamente.' }]
    );
  }

  return corpo as RespostaCadastro;
}