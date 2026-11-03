import { RowDataPacket } from 'mysql2/promise';
import pool from '../config/db';

export interface VendaMes {
  mes: string; // "2026-05"
  pedidos: number;
  faturamento: number;
}

export interface VendaCategoria {
  categoria: string;
  unidades: number;
  faturamento: number;
}

export interface VendaProduto {
  produto: string;
  unidades: number;
  faturamento: number;
}

export interface PrecoUnidades {
  produto: string;
  preco: number;
  unidades: number;
}

interface LinhaMes extends RowDataPacket {
  mes: string;
  qtd_pedidos: string | number;
  faturamento: string;
}
interface LinhaCategoria extends RowDataPacket {
  categoria: string;
  unidades_vendidas: string;
  faturamento: string;
}
interface LinhaProduto extends RowDataPacket {
  produto: string;
  unidades: string;
  faturamento: string;
}
interface LinhaTotal extends RowDataPacket {
  total: string;
}
interface LinhaPrecoUnidades extends RowDataPacket {
  produto: string;
  preco: string;
  unidades: string;
}

export async function vendasPorMes(): Promise<VendaMes[]> {
  const [linhas] = await pool.query<LinhaMes[]>(
    'SELECT mes, qtd_pedidos, faturamento FROM vw_vendas_por_mes ORDER BY mes'
  );
  return linhas.map((l) => ({
    mes: l.mes,
    pedidos: Number(l.qtd_pedidos),
    faturamento: Number(l.faturamento),
  }));
}

export async function vendasPorCategoria(): Promise<VendaCategoria[]> {
  const [linhas] = await pool.query<LinhaCategoria[]>(
    'SELECT categoria, unidades_vendidas, faturamento FROM vw_vendas_por_categoria ORDER BY faturamento DESC'
  );
  return linhas.map((l) => ({
    categoria: l.categoria,
    unidades: Number(l.unidades_vendidas),
    faturamento: Number(l.faturamento),
  }));
}

export async function produtosMaisVendidos(limite: number): Promise<VendaProduto[]> {
  const [linhas] = await pool.query<LinhaProduto[]>(
    `SELECT pr.nome AS produto,
            SUM(i.quantidade) AS unidades,
            SUM(i.quantidade * i.preco_unitario) AS faturamento
       FROM itens_pedido i
       JOIN pedidos  p  ON p.id  = i.pedido_id
       JOIN produtos pr ON pr.id = i.produto_id
      WHERE p.status <> 'cancelado'
      GROUP BY pr.id, pr.nome
      ORDER BY unidades DESC, pr.nome
      LIMIT ?`,
    [limite]
  );
  return linhas.map((l) => ({
    produto: l.produto,
    unidades: Number(l.unidades),
    faturamento: Number(l.faturamento),
  }));
}

export async function totaisDosPedidos(): Promise<number[]> {
  const [linhas] = await pool.query<LinhaTotal[]>(
    "SELECT total FROM pedidos WHERE status <> 'cancelado'"
  );
  return linhas.map((l) => Number(l.total));
}

export async function precoVsUnidades(): Promise<PrecoUnidades[]> {
  const [linhas] = await pool.query<LinhaPrecoUnidades[]>(
    `SELECT pr.nome AS produto,
            pr.preco AS preco,
            COALESCE(SUM(CASE WHEN p.status <> 'cancelado' THEN i.quantidade END), 0) AS unidades
       FROM produtos pr
       LEFT JOIN itens_pedido i ON i.produto_id = pr.id
       LEFT JOIN pedidos      p ON p.id = i.pedido_id
      GROUP BY pr.id, pr.nome, pr.preco
      ORDER BY pr.preco`
  );
  return linhas.map((l) => ({
    produto: l.produto,
    preco: Number(l.preco),
    unidades: Number(l.unidades),
  }));
}