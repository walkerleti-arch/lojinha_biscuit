import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  GraficoCategorias,
  GraficoDispersao,
  GraficoHistograma,
  GraficoProdutos,
  GraficoSerieTemporal,
} from '../components/Graficos';
import { ApiError } from '../services/api';
import { obterAnalise } from '../services/analiseService';
import type { Analise as DadosAnalise, ResultadoRegressao, ResumoEstatistico } from '../types/analise';
import { formatarMoeda, formatarNumero, rotuloMes } from '../utils/formatar';
import './Analise.css';

function Secao({
  titulo,
  objetivo,
  leitura,
  children,
}: {
  titulo: string;
  objetivo: string;
  leitura?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="secao">
      <h2>{titulo}</h2>
      <p className="objetivo">
        <strong>Objetivo de negócio:</strong> {objetivo}
      </p>
      {children}
      {leitura && <p className="leitura">{leitura}</p>}
    </section>
  );
}

function CartoesResumo({ resumo }: { resumo: ResumoEstatistico }) {
  const itens: { rotulo: string; valor: string }[] = [
    { rotulo: 'Pedidos analisados', valor: String(resumo.n) },
    { rotulo: 'Média', valor: formatarMoeda(resumo.media) },
    { rotulo: 'Mediana', valor: formatarMoeda(resumo.mediana) },
    { rotulo: 'Desvio padrão', valor: formatarMoeda(resumo.desvioPadrao) },
    { rotulo: 'Mínimo', valor: formatarMoeda(resumo.minimo) },
    { rotulo: '1º quartil (Q1)', valor: formatarMoeda(resumo.q1) },
    { rotulo: '3º quartil (Q3)', valor: formatarMoeda(resumo.q3) },
    { rotulo: 'Máximo', valor: formatarMoeda(resumo.maximo) },
    { rotulo: 'Coef. de variação', valor: `${formatarNumero(resumo.coeficienteVariacao, 1)}%` },
  ];

  return (
    <div className="cartoes">
      {itens.map((item) => (
        <div key={item.rotulo} className="cartao-estatistica">
          <span>{item.rotulo}</span>
          <strong>{item.valor}</strong>
        </div>
      ))}
    </div>
  );
}

function leituraHistograma(r: ResumoEstatistico): string {
  let forma = 'aproximadamente simétrica';
  if (r.media > r.mediana * 1.05) {
    forma = 'assimétrica à direita (poucos pedidos muito altos puxam a média para cima)';
  } else if (r.media < r.mediana * 0.95) {
    forma = 'assimétrica à esquerda';
  }
  return (
    `A média (${formatarMoeda(r.media)}) e a mediana (${formatarMoeda(r.mediana)}) mostram uma distribuição ${forma}. ` +
    `Metade dos pedidos fica entre ${formatarMoeda(r.q1)} e ${formatarMoeda(r.q3)}.`
  );
}

function leituraRegressao(r: ResultadoRegressao): string {
  const forca = Math.abs(r.correlacao) < 0.3 ? 'fraca' : Math.abs(r.correlacao) < 0.7 ? 'moderada' : 'forte';
  const sentido = r.correlacao < 0 ? 'negativa' : 'positiva';
  const efeito =
    r.inclinacao < 0
      ? `a cada R$ 1 a mais no preço, o produto vende em média ${formatarNumero(Math.abs(r.inclinacao), 2)} unidade(s) a menos`
      : `a cada R$ 1 a mais no preço, o produto vende em média ${formatarNumero(r.inclinacao, 2)} unidade(s) a mais`;
  return (
    `Correlação ${sentido} ${forca} (r = ${formatarNumero(r.correlacao, 2)}): ${efeito}. ` +
    `O preço explica cerca de ${formatarNumero(r.r2 * 100, 0)}% da variação nas vendas (R² = ${formatarNumero(r.r2, 2)}). ` +
    `Equação da reta: unidades ≈ ${formatarNumero(r.intercepto, 2)} ${r.inclinacao < 0 ? '−' : '+'} ${formatarNumero(Math.abs(r.inclinacao), 3)} × preço.`
  );
}

export default function Analise() {
  const [dados, setDados] = useState<DadosAnalise | null>(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const controlador = new AbortController();

    obterAnalise(controlador.signal)
      .then((resposta) => {
        setDados(resposta);
        setCarregando(false);
      })
      .catch((err) => {
        if (controlador.signal.aborted) return;
        setErro(
          err instanceof ApiError
            ? err.erros.map((e) => e.mensagem).join(' ')
            : 'Ocorreu um erro inesperado ao carregar a análise.'
        );
        setCarregando(false);
      });

    return () => controlador.abort();
  }, []);

  const melhorMes = dados?.serieTemporal.reduce(
    (melhor, atual) => (atual.faturamento > melhor.faturamento ? atual : melhor),
    dados.serieTemporal[0]
  );
  const faturamentoTotal = dados?.serieTemporal.reduce((soma, m) => soma + m.faturamento, 0) ?? 0;

  return (
    <main className="analise-pagina">
      <header className="analise-topo">
        <div>
          <h1>Análise descritiva das vendas</h1>
          <p>Loja de biscuit · dados fictícios de janeiro a outubro de 2026 (pedidos cancelados não entram)</p>
        </div>
        <nav>
          <Link to="/cadastro">Cadastro</Link>
          <Link to="/login">Login</Link>
        </nav>
      </header>

      {carregando && <p className="estado">Carregando gráficos...</p>}
      {erro && (
        <div className="alerta alerta-erro" role="alert">
          {erro}
        </div>
      )}

      {dados && (
        <>
          <Secao
            titulo="1. Evolução das vendas por mês"
            objetivo="acompanhar o crescimento e a sazonalidade para planejar produção e estoque antes das datas fortes."
            leitura={
              melhorMes &&
              `Faturamento total no período: ${formatarMoeda(faturamentoTotal)}. O melhor mês foi ${rotuloMes(melhorMes.mes)}, com ${formatarMoeda(melhorMes.faturamento)} em ${melhorMes.pedidos} pedidos.`
            }
          >
            <GraficoSerieTemporal dados={dados.serieTemporal} />
          </Secao>

          <Secao
            titulo="2. Faturamento por categoria"
            objetivo="descobrir qual linha de produtos (bonequinhos, brincos, chaveiros ou espelhos) gera mais receita."
            leitura={
              dados.porCategoria[0] &&
              `A categoria que mais faturou foi ${dados.porCategoria[0].categoria}, com ${formatarMoeda(dados.porCategoria[0].faturamento)}.`
            }
          >
            <GraficoCategorias dados={dados.porCategoria} />
          </Secao>

          <Secao
            titulo="3. Produtos mais vendidos"
            objetivo="identificar os campeões de venda para priorizar a produção e o estoque."
            leitura={
              dados.produtosMaisVendidos[0] &&
              `O produto mais vendido foi ${dados.produtosMaisVendidos[0].produto}, com ${dados.produtosMaisVendidos[0].unidades} unidades.`
            }
          >
            <GraficoProdutos dados={dados.produtosMaisVendidos} />
          </Secao>

          <Secao
            titulo="4. Distribuição do valor dos pedidos"
            objetivo="entender o perfil do ticket dos clientes para definir kits, combos e frete grátis."
            leitura={dados.valorPedido.resumo && leituraHistograma(dados.valorPedido.resumo)}
          >
            {dados.valorPedido.resumo ? (
              <>
                <CartoesResumo resumo={dados.valorPedido.resumo} />
                <GraficoHistograma dados={dados.valorPedido.histograma} />
              </>
            ) : (
              <p className="estado">Ainda não há pedidos suficientes.</p>
            )}
          </Secao>

          <Secao
            titulo="5. Preço x quantidade vendida (dispersão e regressão)"
            objetivo="verificar se o preço influencia a quantidade vendida, para apoiar a política de preços."
            leitura={dados.precoVsVendas.regressao && leituraRegressao(dados.precoVsVendas.regressao)}
          >
            <GraficoDispersao pontos={dados.precoVsVendas.pontos} regressao={dados.precoVsVendas.regressao} />
          </Secao>
        </>
      )}
    </main>
  );
}