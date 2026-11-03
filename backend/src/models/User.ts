import bcrypt from 'bcrypt';
import { ErroCampo, ValidationError } from '../errors/ValidationError';
import { validarNome } from '../validators/nome';
import { normalizarEmail, validarEmail } from '../validators/email';
import { limparCpf, validarCpf } from '../validators/cpf';
import { validarSenha } from '../validators/senha';
export type DadosCadastro = Partial<Record<'nome' | 'email' | 'cpf' | 'senha', unknown>>;

interface UserProps {
  id?: number | null;
  nome: string;
  email: string;
  cpf: string;
  senhaHash: string;
}

export interface UserPersistencia {
  nome: string;
  email: string;
  cpf: string;
  senhaHash: string;
}

const comCampo = (campo: string, mensagens: string[]): ErroCampo[] =>
  mensagens.map((mensagem) => ({ campo, mensagem }));

export class User {
  #id: number | null;
  #nome = '';
  #email = '';
  #cpf = '';
  readonly #senhaHash: string;

  constructor({ id = null, nome, email, cpf, senhaHash }: UserProps) {
    this.#id = id;
    this.nome = nome;
    this.email = email;
    this.cpf = cpf;
    this.#senhaHash = senhaHash;
  }

  get id(): number | null {
    return this.#id;
  }

  get nome(): string {
    return this.#nome;
  }
  set nome(valor: string) {
    const erros = validarNome(valor);
    if (erros.length) throw new ValidationError(comCampo('nome', erros));
    this.#nome = valor.trim();
  }

  get email(): string {
    return this.#email;
  }
  set email(valor: string) {
    const erros = validarEmail(valor);
    if (erros.length) throw new ValidationError(comCampo('email', erros));
    this.#email = normalizarEmail(valor); // transformação: minúsculas e sem espaços
  }

  get cpf(): string {
    return this.#cpf;
  }
  set cpf(valor: string) {
    const erros = validarCpf(valor);
    if (erros.length) throw new ValidationError(comCampo('cpf', erros));
    this.#cpf = limparCpf(valor); // transformação: guarda só os dígitos
  }

  paraPersistencia(): UserPersistencia {
    return {
      nome: this.#nome,
      email: this.#email,
      cpf: this.#cpf,
      senhaHash: this.#senhaHash,
    };
  }

  toJSON(): { id: number | null; nome: string; email: string } {
    return { id: this.#id, nome: this.#nome, email: this.#email };
  }

  static validarDados(dados: DadosCadastro = {}): ErroCampo[] {
    return [
      ...comCampo('nome', validarNome(dados.nome)),
      ...comCampo('email', validarEmail(dados.email)),
      ...comCampo('cpf', validarCpf(dados.cpf)),
      ...comCampo('senha', validarSenha(dados.senha)),
    ];
  }

  static async criar(dados: DadosCadastro): Promise<User> {
    const erros = User.validarDados(dados);
    if (erros.length) throw new ValidationError(erros);

    const { nome, email, cpf, senha } = dados as Record<'nome' | 'email' | 'cpf' | 'senha', string>;
    const senhaHash = await bcrypt.hash(senha, 10);
    return new User({ nome, email, cpf, senhaHash });
  }
}