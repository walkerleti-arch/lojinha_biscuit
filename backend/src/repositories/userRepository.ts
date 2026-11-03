import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import pool from '../config/db';
import { User } from '../models/User';

export interface UsuarioExistente extends RowDataPacket {
  email: string;
  cpf: string;
}

export async function buscarPorEmailOuCpf(email: string, cpf: string): Promise<UsuarioExistente[]> {
  const [linhas] = await pool.execute<UsuarioExistente[]>(
    'SELECT email, cpf FROM usuarios WHERE email = ? OR cpf = ?',
    [email, cpf]
  );
  return linhas;
}

export async function inserir(user: User): Promise<number> {
  const { nome, email, cpf, senhaHash } = user.paraPersistencia();
  const [resultado] = await pool.execute<ResultSetHeader>(
    'INSERT INTO usuarios (nome, email, cpf, senha_hash) VALUES (?, ?, ?, ?)',
    [nome, email, cpf, senhaHash]
  );
  return resultado.insertId;
}