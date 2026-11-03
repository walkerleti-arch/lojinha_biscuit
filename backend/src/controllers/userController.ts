import { NextFunction, Request, Response } from 'express';
import { User } from '../models/User';
import { ErroCampo, ValidationError } from '../errors/ValidationError';
import * as userRepository from '../repositories/userRepository';

export async function cadastrar(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await User.criar(req.body ?? {});

    const existentes = await userRepository.buscarPorEmailOuCpf(user.email, user.cpf);
    if (existentes.length) {
      const erros: ErroCampo[] = [];
      if (existentes.some((u) => u.email === user.email)) {
        erros.push({ campo: 'email', mensagem: 'Email já cadastrado' });
      }
      if (existentes.some((u) => u.cpf === user.cpf)) {
        erros.push({ campo: 'cpf', mensagem: 'CPF já cadastrado' });
      }
      throw new ValidationError(erros, 409);
    }

    const id = await userRepository.inserir(user);
    res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso',
      usuario: { id, nome: user.nome, email: user.email },
    });
  } catch (err) {
    next(err);
  }
}