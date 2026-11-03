import { API_URL, ApiError } from './api';
import type { Analise } from '../types/analise';

export async function obterAnalise(signal?: AbortSignal): Promise<Analise> {
  let resposta: Response;

  try {
    resposta = await fetch(`${API_URL}/analise`, { signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new ApiError(0, [
      { campo: 'geral', mensagem: 'Não foi possível conectar ao servidor. Verifique se a API está rodando.' },
    ]);
  }

  const corpo = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    throw new ApiError(
      resposta.status,
      corpo?.erros ?? [{ campo: 'geral', mensagem: 'Erro ao carregar a análise.' }]
    );
  }

  return corpo as Analise;
}