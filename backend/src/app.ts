import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import analiseRoutes from './routes/analiseRoutes';
import { ValidationError } from './errors/ValidationError';

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/saude', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});
app.use('/usuarios', userRoutes);
app.use('/analise', analiseRoutes);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ValidationError) {
    res.status(err.status).json({ erros: err.erros });
    return;
  }

  const erroTecnico = err as { type?: string; code?: string };

  if (erroTecnico.type === 'entity.parse.failed') {
    res.status(400).json({ erros: [{ campo: 'geral', mensagem: 'JSON inválido' }] });
    return;
  }
  if (erroTecnico.code === 'ER_DUP_ENTRY') {
    res.status(409).json({ erros: [{ campo: 'geral', mensagem: 'Email ou CPF já cadastrado' }] });
    return;
  }

  console.error(err);
  res.status(500).json({ erros: [{ campo: 'geral', mensagem: 'Erro interno do servidor' }] });
});

export default app;