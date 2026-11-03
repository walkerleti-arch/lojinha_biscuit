-- =====================================================
-- Banco de dados: Loja de Biscuit
-- SGBD: MariaDB (executar pelo DBeaver)
-- =====================================================

CREATE DATABASE IF NOT EXISTS loja_biscuit
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE loja_biscuit;

-- Remove na ordem inversa das dependências (permite rodar o script de novo)
DROP VIEW IF EXISTS vw_vendas_por_categoria;
DROP VIEW IF EXISTS vw_vendas_por_mes;
DROP TABLE IF EXISTS itens_pedido;
DROP TABLE IF EXISTS pedidos;
DROP TABLE IF EXISTS produtos;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS usuarios;

-- =====================================================
-- TABELAS
-- =====================================================

-- Usuários (tela de cadastro). CPF guardado só com os 11 dígitos.
CREATE TABLE usuarios (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL,
  cpf         CHAR(11)     NOT NULL,
  senha_hash  VARCHAR(255) NOT NULL,
  criado_em   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_usuarios_email UNIQUE (email),
  CONSTRAINT uq_usuarios_cpf   UNIQUE (cpf)
) ENGINE=InnoDB;

CREATE TABLE categorias (
  id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome  VARCHAR(50) NOT NULL,
  CONSTRAINT uq_categorias_nome UNIQUE (nome)
) ENGINE=InnoDB;

CREATE TABLE produtos (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  categoria_id  INT UNSIGNED  NOT NULL,
  nome          VARCHAR(100)  NOT NULL,
  descricao     VARCHAR(255),
  preco         DECIMAL(10,2) NOT NULL CHECK (preco > 0),
  estoque       INT UNSIGNED  NOT NULL DEFAULT 0,
  ativo         BOOLEAN       NOT NULL DEFAULT TRUE,
  criado_em     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_produtos_categoria
    FOREIGN KEY (categoria_id) REFERENCES categorias (id),
  INDEX idx_produtos_categoria (categoria_id)
) ENGINE=InnoDB;

CREATE TABLE pedidos (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT UNSIGNED NOT NULL,
  status      ENUM('pendente','pago','enviado','entregue','cancelado')
              NOT NULL DEFAULT 'pendente',
  total       DECIMAL(10,2) NOT NULL DEFAULT 0,
  criado_em   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pedidos_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
  INDEX idx_pedidos_usuario (usuario_id),
  INDEX idx_pedidos_criado_em (criado_em)
) ENGINE=InnoDB;

CREATE TABLE itens_pedido (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pedido_id       INT UNSIGNED  NOT NULL,
  produto_id      INT UNSIGNED  NOT NULL,
  quantidade      INT UNSIGNED  NOT NULL CHECK (quantidade > 0),
  preco_unitario  DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_itens_pedido
    FOREIGN KEY (pedido_id)  REFERENCES pedidos (id) ON DELETE CASCADE,
  CONSTRAINT fk_itens_produto
    FOREIGN KEY (produto_id) REFERENCES produtos (id),
  INDEX idx_itens_pedido (pedido_id),
  INDEX idx_itens_produto (produto_id)
) ENGINE=InnoDB;

-- =====================================================
-- DADOS INICIAIS (SEEDS)
-- =====================================================

INSERT INTO categorias (nome) VALUES
  ('Bonequinhos'),   -- id 1
  ('Brincos'),       -- id 2
  ('Chaveiros'),     -- id 3
  ('Espelhos');      -- id 4

INSERT INTO produtos (categoria_id, nome, descricao, preco, estoque) VALUES
  -- Bonequinhos
  (1, 'Ursinho de Biscuit',        'Ursinho fofo modelado à mão',            45.00, 12),
  (1, 'Gatinho Sentado',           'Gatinho com lacinho, vários tons',       38.00, 15),
  (1, 'Unicórnio Mágico',          'Unicórnio com crina colorida',           52.00,  8),
  (1, 'Casal de Noivinhos',        'Topo de bolo ou lembrança de casamento', 89.90,  5),
  (1, 'Boneca Personalizada',      'Feita sob encomenda',                   120.00,  3),
  -- Brincos
  (2, 'Brinco Morango',            'Par de brincos de morango',              25.00, 30),
  (2, 'Brinco Margarida',          'Par de brincos de flor margarida',       22.00, 28),
  (2, 'Brinco Gotinha de Chuva',   'Par de brincos azul translúcido',        20.00, 25),
  (2, 'Brinco Coração',            'Par de brincos de coração',              24.00, 22),
  (2, 'Brinco Cerejinha',          'Par de brincos de cereja',               26.00, 20),
  -- Chaveiros
  (3, 'Chaveiro Gatinho',          'Chaveiro de gatinho com argola',         18.00, 40),
  (3, 'Chaveiro Cupcake',          'Chaveiro de cupcake colorido',           20.00, 35),
  (3, 'Chaveiro Letra Personalizada','Inicial do nome em biscuit',           15.00, 50),
  (3, 'Chaveiro Ursinho',          'Mini ursinho com argola',                19.00, 32),
  -- Espelhos
  (4, 'Espelho de Bolsa Flores',   'Espelho de bolsa decorado com flores',   28.00, 18),
  (4, 'Espelho Gatinho',           'Espelho de bolsa em formato de gato',    32.00, 14),
  (4, 'Espelho Coração Rosa',      'Espelho de bolsa em formato de coração', 30.00, 16),
  (4, 'Espelho Unicórnio',         'Espelho de bolsa com unicórnio',         35.00, 10);

-- Usuários de teste (senha_hash fictício: esses usuários NÃO fazem login).
-- Os CPFs abaixo são válidos matematicamente, mas de teste.
INSERT INTO usuarios (nome, email, cpf, senha_hash, criado_em) VALUES
  ('Ana Souza',      'ana@exemplo.com',    '52998224725', 'hash_ficticio', '2026-05-20 10:00:00'),
  ('Bruno Lima',     'bruno@exemplo.com',  '11144477735', 'hash_ficticio', '2026-06-01 09:30:00'),
  ('Carla Mendes',   'carla@exemplo.com',  '12345678909', 'hash_ficticio', '2026-06-25 14:15:00'),
  ('Diego Rocha',    'diego@exemplo.com',  '39053344705', 'hash_ficticio', '2026-07-10 16:45:00'),
  ('Elisa Martins',  'elisa@exemplo.com',  '16899535009', 'hash_ficticio', '2026-08-02 11:20:00');

INSERT INTO pedidos (usuario_id, status, criado_em) VALUES
  (1, 'entregue',  '2026-06-05 14:20:00'),  -- 1
  (2, 'entregue',  '2026-06-18 10:05:00'),  -- 2
  (3, 'entregue',  '2026-07-02 16:40:00'),  -- 3
  (1, 'entregue',  '2026-07-15 09:30:00'),  -- 4
  (4, 'entregue',  '2026-07-28 19:10:00'),  -- 5
  (5, 'entregue',  '2026-08-09 11:00:00'),  -- 6
  (2, 'entregue',  '2026-08-21 15:45:00'),  -- 7
  (3, 'entregue',  '2026-09-03 13:25:00'),  -- 8
  (4, 'entregue',  '2026-09-14 20:00:00'),  -- 9
  (1, 'enviado',   '2026-09-27 10:15:00'),  -- 10
  (5, 'enviado',   '2026-10-08 17:30:00'),  -- 11
  (2, 'pago',      '2026-10-19 12:50:00'),  -- 12
  (3, 'pendente',  '2026-10-25 18:20:00'),  -- 13
  (4, 'cancelado', '2026-10-27 09:40:00');  -- 14

-- O preço unitário é copiado do produto no momento da venda
INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario)
SELECT v.pedido_id, v.produto_id, v.quantidade, p.preco
FROM (
  SELECT 1 AS pedido_id,  1 AS produto_id, 1 AS quantidade UNION ALL
  SELECT 1,   6, 2 UNION ALL
  SELECT 2,  11, 3 UNION ALL
  SELECT 2,  15, 1 UNION ALL
  SELECT 3,   5, 1 UNION ALL
  SELECT 4,   7, 2 UNION ALL
  SELECT 4,  12, 1 UNION ALL
  SELECT 5,   3, 1 UNION ALL
  SELECT 5,  16, 1 UNION ALL
  SELECT 6,   9, 1 UNION ALL
  SELECT 6,  13, 2 UNION ALL
  SELECT 6,  17, 1 UNION ALL
  SELECT 7,   2, 2 UNION ALL
  SELECT 8,   4, 1 UNION ALL
  SELECT 8,  14, 2 UNION ALL
  SELECT 9,  10, 2 UNION ALL
  SELECT 9,  18, 1 UNION ALL
  SELECT 10,  1, 1 UNION ALL
  SELECT 10,  8, 1 UNION ALL
  SELECT 10, 11, 2 UNION ALL
  SELECT 11,  5, 1 UNION ALL
  SELECT 11,  6, 1 UNION ALL
  SELECT 12, 15, 2 UNION ALL
  SELECT 12, 12, 1 UNION ALL
  SELECT 13,  3, 1 UNION ALL
  SELECT 14, 13, 4
) AS v
JOIN produtos p ON p.id = v.produto_id;

-- Calcula o total de cada pedido a partir dos itens
UPDATE pedidos p
SET p.total = (
  SELECT COALESCE(SUM(i.quantidade * i.preco_unitario), 0)
  FROM itens_pedido i
  WHERE i.pedido_id = p.id
);

-- =====================================================
-- VIEWS ANALÍTICAS (base para os gráficos)
-- =====================================================

-- Série temporal: pedidos e faturamento por mês
CREATE VIEW vw_vendas_por_mes AS
SELECT
  DATE_FORMAT(criado_em, '%Y-%m') AS mes,
  COUNT(*)                        AS qtd_pedidos,
  SUM(total)                      AS faturamento
FROM pedidos
WHERE status <> 'cancelado'
GROUP BY DATE_FORMAT(criado_em, '%Y-%m');

-- Gráfico de barras: unidades e faturamento por categoria
CREATE VIEW vw_vendas_por_categoria AS
SELECT
  c.nome                                AS categoria,
  SUM(i.quantidade)                     AS unidades_vendidas,
  SUM(i.quantidade * i.preco_unitario)  AS faturamento
FROM itens_pedido i
JOIN pedidos    p  ON p.id  = i.pedido_id
JOIN produtos   pr ON pr.id = i.produto_id
JOIN categorias c  ON c.id  = pr.categoria_id
WHERE p.status <> 'cancelado'
GROUP BY c.id, c.nome;

-- Conferência rápida
SELECT * FROM vw_vendas_por_mes;
SELECT * FROM vw_vendas_por_categoria;

-- =====================================================
-- Dados adicionais para a Análise Descritiva (gráficos)
-- Rodar DEPOIS do schema.sql, no DBeaver, com Alt + X (executar script).
-- Gera pedidos fictícios de janeiro a outubro de 2026.
-- Pode ser executado de novo: ele apaga os pedidos 101 em diante antes de inserir.
-- =====================================================

USE loja_biscuit;

DELETE FROM itens_pedido WHERE pedido_id >= 101;
DELETE FROM pedidos WHERE id >= 101;

INSERT INTO pedidos (id, usuario_id, status, total, criado_em) VALUES
  (101, 4, 'entregue', 110.00, '2026-01-15 09:52:57'),
  (102, 2, 'entregue', 20.00, '2026-01-24 17:40:04'),
  (103, 4, 'entregue', 19.00, '2026-01-29 19:45:45'),
  (104, 4, 'entregue', 114.00, '2026-01-03 15:57:37'),
  (105, 1, 'entregue', 116.00, '2026-01-19 16:32:33'),
  (106, 5, 'entregue', 178.90, '2026-01-23 18:27:30'),
  (107, 2, 'entregue', 49.00, '2026-01-09 17:25:42'),
  (108, 4, 'entregue', 97.00, '2026-01-10 13:00:02'),
  (109, 1, 'entregue', 94.00, '2026-01-17 21:52:31'),
  (110, 4, 'entregue', 30.00, '2026-01-15 20:45:50'),
  (111, 4, 'entregue', 106.00, '2026-02-27 20:30:04'),
  (112, 3, 'entregue', 89.00, '2026-02-19 17:59:53'),
  (113, 2, 'entregue', 53.00, '2026-02-05 09:20:42'),
  (114, 5, 'entregue', 106.00, '2026-02-16 18:08:38'),
  (115, 1, 'entregue', 115.00, '2026-02-10 17:26:24'),
  (116, 4, 'entregue', 100.00, '2026-02-27 14:41:22'),
  (117, 1, 'entregue', 50.00, '2026-02-19 18:51:10'),
  (118, 1, 'entregue', 30.00, '2026-02-18 15:02:12'),
  (119, 2, 'entregue', 75.00, '2026-02-15 21:41:12'),
  (120, 3, 'entregue', 26.00, '2026-02-06 19:54:11'),
  (121, 1, 'entregue', 97.00, '2026-02-06 14:11:16'),
  (122, 3, 'entregue', 140.00, '2026-03-28 12:14:00'),
  (123, 2, 'entregue', 52.00, '2026-03-28 11:22:35'),
  (124, 4, 'entregue', 28.00, '2026-03-19 13:36:17'),
  (125, 1, 'entregue', 40.00, '2026-03-06 10:43:03'),
  (126, 3, 'entregue', 60.00, '2026-03-10 14:10:16'),
  (127, 3, 'entregue', 52.00, '2026-03-14 09:03:06'),
  (128, 4, 'entregue', 71.00, '2026-03-11 21:29:38'),
  (129, 4, 'entregue', 84.00, '2026-03-22 10:43:23'),
  (130, 5, 'entregue', 58.00, '2026-03-29 09:18:44'),
  (131, 1, 'entregue', 35.00, '2026-03-29 09:34:21'),
  (132, 4, 'entregue', 60.00, '2026-03-04 09:08:33'),
  (133, 5, 'entregue', 70.00, '2026-03-13 12:49:26'),
  (134, 3, 'entregue', 20.00, '2026-03-13 13:50:09'),
  (135, 5, 'entregue', 50.00, '2026-04-05 19:37:05'),
  (136, 2, 'entregue', 35.00, '2026-04-25 20:20:03'),
  (137, 2, 'entregue', 131.00, '2026-04-22 17:55:09'),
  (138, 1, 'entregue', 65.00, '2026-04-12 14:29:40'),
  (139, 1, 'entregue', 62.00, '2026-04-12 17:44:26'),
  (140, 5, 'entregue', 58.00, '2026-04-29 09:34:13'),
  (141, 5, 'entregue', 25.00, '2026-04-26 19:42:10'),
  (142, 4, 'entregue', 45.00, '2026-04-09 13:02:47'),
  (143, 5, 'entregue', 118.00, '2026-04-07 20:40:00'),
  (144, 1, 'entregue', 85.00, '2026-04-06 20:33:01'),
  (145, 1, 'entregue', 37.00, '2026-04-27 14:04:23'),
  (146, 4, 'entregue', 89.90, '2026-04-28 20:04:24'),
  (147, 1, 'entregue', 48.00, '2026-04-04 17:33:15'),
  (148, 4, 'entregue', 51.00, '2026-04-26 16:49:19'),
  (149, 3, 'entregue', 19.00, '2026-05-13 14:11:12'),
  (150, 4, 'entregue', 15.00, '2026-05-14 21:37:24'),
  (151, 1, 'entregue', 108.00, '2026-05-09 14:53:07'),
  (152, 4, 'entregue', 20.00, '2026-05-09 13:36:29'),
  (153, 3, 'entregue', 82.00, '2026-05-11 10:43:49'),
  (154, 4, 'cancelado', 46.00, '2026-05-02 15:46:11'),
  (155, 3, 'cancelado', 179.80, '2026-05-28 16:21:00'),
  (156, 1, 'entregue', 39.00, '2026-05-11 09:49:13'),
  (157, 1, 'entregue', 15.00, '2026-05-04 11:21:14'),
  (158, 5, 'entregue', 109.90, '2026-05-19 15:45:33'),
  (159, 3, 'entregue', 15.00, '2026-05-08 16:42:42'),
  (160, 4, 'entregue', 32.00, '2026-05-27 13:02:41'),
  (161, 4, 'entregue', 22.00, '2026-05-07 14:17:32'),
  (162, 5, 'entregue', 92.00, '2026-05-28 10:46:46'),
  (163, 2, 'entregue', 75.00, '2026-05-17 18:20:31'),
  (164, 2, 'entregue', 52.00, '2026-05-25 13:55:33'),
  (165, 3, 'entregue', 292.00, '2026-05-01 16:15:13'),
  (166, 2, 'entregue', 95.00, '2026-05-12 19:25:34'),
  (167, 3, 'entregue', 122.00, '2026-05-26 21:42:36'),
  (168, 2, 'entregue', 38.00, '2026-05-31 17:44:22'),
  (169, 5, 'entregue', 136.00, '2026-05-14 19:39:31'),
  (170, 2, 'entregue', 83.00, '2026-05-02 16:00:03'),
  (171, 4, 'entregue', 57.00, '2026-05-17 12:55:52'),
  (172, 2, 'entregue', 52.00, '2026-05-07 14:10:34'),
  (173, 1, 'entregue', 48.00, '2026-06-10 19:47:28'),
  (174, 4, 'entregue', 25.00, '2026-06-12 20:43:39'),
  (175, 4, 'entregue', 48.00, '2026-06-01 17:09:41'),
  (176, 3, 'entregue', 32.00, '2026-06-29 13:53:22'),
  (177, 5, 'entregue', 61.00, '2026-06-15 15:38:40'),
  (178, 4, 'entregue', 15.00, '2026-06-27 17:06:52'),
  (179, 2, 'entregue', 54.00, '2026-06-19 10:24:51'),
  (180, 3, 'entregue', 163.00, '2026-06-01 10:25:05'),
  (181, 3, 'entregue', 62.00, '2026-06-23 11:19:30'),
  (182, 5, 'entregue', 28.00, '2026-06-14 09:31:15'),
  (183, 2, 'entregue', 19.00, '2026-06-13 16:33:01'),
  (184, 2, 'entregue', 60.00, '2026-06-10 12:55:33'),
  (185, 4, 'entregue', 76.00, '2026-06-17 10:36:23'),
  (186, 1, 'entregue', 45.00, '2026-06-13 09:15:12'),
  (187, 4, 'entregue', 90.00, '2026-06-07 20:53:40'),
  (188, 1, 'cancelado', 72.00, '2026-07-27 17:40:59'),
  (189, 5, 'entregue', 30.00, '2026-07-09 12:00:18'),
  (190, 2, 'entregue', 32.00, '2026-07-06 17:40:33'),
  (191, 5, 'entregue', 24.00, '2026-07-18 15:29:05'),
  (192, 1, 'entregue', 44.00, '2026-07-06 11:15:10'),
  (193, 5, 'entregue', 124.00, '2026-07-01 14:04:47'),
  (194, 2, 'entregue', 77.00, '2026-07-04 11:00:52'),
  (195, 1, 'entregue', 50.00, '2026-07-04 15:56:15'),
  (196, 5, 'entregue', 119.00, '2026-07-01 14:58:47'),
  (197, 3, 'entregue', 20.00, '2026-07-30 19:30:07'),
  (198, 1, 'entregue', 15.00, '2026-07-01 16:38:18'),
  (199, 4, 'entregue', 24.00, '2026-07-04 12:53:20'),
  (200, 2, 'entregue', 20.00, '2026-07-24 13:16:28'),
  (201, 2, 'entregue', 147.00, '2026-07-04 18:35:01'),
  (202, 3, 'entregue', 80.00, '2026-08-20 14:41:34'),
  (203, 2, 'entregue', 15.00, '2026-08-28 16:15:11'),
  (204, 2, 'entregue', 120.00, '2026-08-28 15:42:37'),
  (205, 4, 'entregue', 146.00, '2026-08-23 19:56:34'),
  (206, 2, 'entregue', 30.00, '2026-08-17 12:00:26'),
  (207, 4, 'entregue', 117.00, '2026-08-18 18:24:22'),
  (208, 3, 'entregue', 183.90, '2026-08-17 12:23:01'),
  (209, 1, 'entregue', 25.00, '2026-08-29 09:06:56'),
  (210, 2, 'entregue', 56.00, '2026-08-21 10:52:52'),
  (211, 1, 'entregue', 83.00, '2026-08-05 16:29:54'),
  (212, 5, 'entregue', 61.00, '2026-08-15 16:03:28'),
  (213, 3, 'entregue', 32.00, '2026-08-17 12:27:06'),
  (214, 5, 'entregue', 52.00, '2026-08-09 21:51:27'),
  (215, 5, 'entregue', 52.00, '2026-08-25 18:16:20'),
  (216, 5, 'entregue', 68.00, '2026-08-14 13:02:35'),
  (217, 1, 'entregue', 132.00, '2026-08-15 11:22:52'),
  (218, 4, 'entregue', 128.00, '2026-08-22 14:25:41'),
  (219, 3, 'entregue', 45.00, '2026-08-25 19:28:37'),
  (220, 3, 'cancelado', 38.00, '2026-09-26 13:50:30'),
  (221, 3, 'entregue', 20.00, '2026-09-18 17:50:03'),
  (222, 5, 'entregue', 38.00, '2026-09-01 12:13:03'),
  (223, 1, 'entregue', 35.00, '2026-09-18 16:06:43'),
  (224, 4, 'entregue', 15.00, '2026-09-23 10:58:06'),
  (225, 3, 'entregue', 28.00, '2026-09-02 11:28:53'),
  (226, 1, 'entregue', 118.00, '2026-09-18 19:53:50'),
  (227, 3, 'entregue', 30.00, '2026-09-03 16:36:26'),
  (228, 5, 'entregue', 35.00, '2026-09-25 21:06:50'),
  (229, 4, 'entregue', 97.00, '2026-09-05 12:20:10'),
  (230, 1, 'entregue', 22.00, '2026-09-03 09:23:36'),
  (231, 2, 'entregue', 22.00, '2026-09-10 17:35:07'),
  (232, 3, 'entregue', 22.00, '2026-09-06 11:12:35'),
  (233, 5, 'entregue', 45.00, '2026-09-07 12:48:11'),
  (234, 4, 'entregue', 66.00, '2026-09-02 17:22:54'),
  (235, 1, 'entregue', 70.00, '2026-09-13 21:45:06'),
  (236, 2, 'entregue', 136.00, '2026-10-16 14:18:19'),
  (237, 3, 'pago', 15.00, '2026-10-30 17:00:01'),
  (238, 4, 'entregue', 68.00, '2026-10-16 17:53:26'),
  (239, 2, 'pago', 30.00, '2026-10-30 19:31:44'),
  (240, 1, 'entregue', 76.00, '2026-10-18 13:35:40'),
  (241, 3, 'entregue', 48.00, '2026-10-14 16:59:43'),
  (242, 2, 'pendente', 15.00, '2026-10-31 10:16:07'),
  (243, 4, 'cancelado', 108.00, '2026-10-15 19:00:07'),
  (244, 2, 'entregue', 52.00, '2026-10-10 15:52:27'),
  (245, 3, 'entregue', 82.00, '2026-10-20 17:47:38'),
  (246, 2, 'entregue', 18.00, '2026-10-18 10:54:12'),
  (247, 1, 'pago', 131.00, '2026-10-30 13:39:26'),
  (248, 4, 'entregue', 24.00, '2026-10-09 21:29:21'),
  (249, 3, 'pago', 39.00, '2026-10-24 14:26:05'),
  (250, 3, 'pago', 15.00, '2026-10-26 18:58:20'),
  (251, 1, 'pago', 145.00, '2026-10-30 11:36:59'),
  (252, 5, 'enviado', 75.00, '2026-10-25 17:08:17'),
  (253, 3, 'entregue', 83.00, '2026-10-12 15:48:35'),
  (254, 5, 'entregue', 119.90, '2026-10-21 11:01:01'),
  (255, 5, 'cancelado', 95.00, '2026-10-05 16:12:14'),
  (256, 2, 'enviado', 142.00, '2026-10-23 21:06:57'),
  (257, 3, 'pago', 50.00, '2026-10-31 09:03:54'),
  (258, 3, 'entregue', 26.00, '2026-10-06 15:12:48'),
  (259, 4, 'cancelado', 61.00, '2026-10-06 18:15:58');

INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES
  (101, 7, 5, 22.00),
  (102, 12, 1, 20.00),
  (103, 14, 1, 19.00),
  (104, 10, 2, 26.00),
  (104, 16, 1, 32.00),
  (104, 17, 1, 30.00),
  (105, 15, 3, 28.00),
  (105, 16, 1, 32.00),
  (106, 16, 1, 32.00),
  (106, 4, 1, 89.90),
  (106, 14, 3, 19.00),
  (107, 13, 2, 15.00),
  (107, 14, 1, 19.00),
  (108, 18, 1, 35.00),
  (108, 16, 1, 32.00),
  (108, 17, 1, 30.00),
  (109, 17, 1, 30.00),
  (109, 16, 2, 32.00),
  (110, 17, 1, 30.00),
  (111, 9, 1, 24.00),
  (111, 6, 2, 25.00),
  (111, 16, 1, 32.00),
  (112, 7, 2, 22.00),
  (112, 13, 3, 15.00),
  (113, 18, 1, 35.00),
  (113, 11, 1, 18.00),
  (114, 2, 2, 38.00),
  (114, 13, 2, 15.00),
  (115, 6, 1, 25.00),
  (115, 1, 2, 45.00),
  (116, 1, 1, 45.00),
  (116, 11, 2, 18.00),
  (116, 14, 1, 19.00),
  (117, 10, 1, 26.00),
  (117, 9, 1, 24.00),
  (118, 13, 2, 15.00),
  (119, 1, 1, 45.00),
  (119, 13, 2, 15.00),
  (120, 10, 1, 26.00),
  (121, 16, 1, 32.00),
  (121, 8, 1, 20.00),
  (121, 6, 1, 25.00),
  (121, 12, 1, 20.00),
  (122, 13, 2, 15.00),
  (122, 10, 1, 26.00),
  (122, 15, 3, 28.00),
  (123, 7, 1, 22.00),
  (123, 13, 2, 15.00),
  (124, 15, 1, 28.00),
  (125, 6, 1, 25.00),
  (125, 13, 1, 15.00),
  (126, 17, 2, 30.00),
  (127, 3, 1, 52.00),
  (128, 1, 1, 45.00),
  (128, 10, 1, 26.00),
  (129, 17, 2, 30.00),
  (129, 9, 1, 24.00),
  (130, 15, 1, 28.00),
  (130, 17, 1, 30.00),
  (131, 18, 1, 35.00),
  (132, 13, 1, 15.00),
  (132, 1, 1, 45.00),
  (133, 6, 1, 25.00),
  (133, 1, 1, 45.00),
  (134, 12, 1, 20.00),
  (135, 13, 1, 15.00),
  (135, 18, 1, 35.00),
  (136, 18, 1, 35.00),
  (137, 10, 1, 26.00),
  (137, 18, 3, 35.00),
  (138, 17, 1, 30.00),
  (138, 13, 1, 15.00),
  (138, 8, 1, 20.00),
  (139, 2, 1, 38.00),
  (139, 9, 1, 24.00),
  (140, 8, 1, 20.00),
  (140, 2, 1, 38.00),
  (141, 6, 1, 25.00),
  (142, 6, 1, 25.00),
  (142, 8, 1, 20.00),
  (143, 18, 2, 35.00),
  (143, 9, 2, 24.00),
  (144, 6, 1, 25.00),
  (144, 17, 2, 30.00),
  (145, 13, 1, 15.00),
  (145, 7, 1, 22.00),
  (146, 4, 1, 89.90),
  (147, 11, 1, 18.00),
  (147, 13, 2, 15.00),
  (148, 6, 1, 25.00),
  (148, 10, 1, 26.00),
  (149, 14, 1, 19.00),
  (150, 13, 1, 15.00),
  (151, 11, 1, 18.00),
  (151, 6, 3, 25.00),
  (151, 13, 1, 15.00),
  (152, 12, 1, 20.00),
  (153, 16, 1, 32.00),
  (153, 18, 1, 35.00),
  (153, 13, 1, 15.00),
  (154, 7, 1, 22.00),
  (154, 9, 1, 24.00),
  (155, 4, 2, 89.90),
  (156, 13, 1, 15.00),
  (156, 9, 1, 24.00),
  (157, 13, 1, 15.00),
  (158, 4, 1, 89.90),
  (158, 8, 1, 20.00),
  (159, 13, 1, 15.00),
  (160, 16, 1, 32.00),
  (161, 7, 1, 22.00),
  (162, 12, 3, 20.00),
  (162, 16, 1, 32.00),
  (163, 6, 3, 25.00),
  (164, 3, 1, 52.00),
  (165, 5, 2, 120.00),
  (165, 7, 1, 22.00),
  (165, 17, 1, 30.00),
  (166, 6, 3, 25.00),
  (166, 12, 1, 20.00),
  (167, 1, 2, 45.00),
  (167, 16, 1, 32.00),
  (168, 14, 2, 19.00),
  (169, 8, 1, 20.00),
  (169, 11, 1, 18.00),
  (169, 17, 2, 30.00),
  (169, 2, 1, 38.00),
  (170, 14, 1, 19.00),
  (170, 16, 2, 32.00),
  (171, 6, 1, 25.00),
  (171, 16, 1, 32.00),
  (172, 10, 2, 26.00),
  (173, 11, 1, 18.00),
  (173, 17, 1, 30.00),
  (174, 6, 1, 25.00),
  (175, 8, 1, 20.00),
  (175, 15, 1, 28.00),
  (176, 16, 1, 32.00),
  (177, 13, 1, 15.00),
  (177, 9, 1, 24.00),
  (177, 7, 1, 22.00),
  (178, 13, 1, 15.00),
  (179, 11, 3, 18.00),
  (180, 1, 2, 45.00),
  (180, 2, 1, 38.00),
  (180, 18, 1, 35.00),
  (181, 11, 1, 18.00),
  (181, 7, 2, 22.00),
  (182, 15, 1, 28.00),
  (183, 14, 1, 19.00),
  (184, 17, 1, 30.00),
  (184, 13, 2, 15.00),
  (185, 12, 2, 20.00),
  (185, 11, 2, 18.00),
  (186, 6, 1, 25.00),
  (186, 8, 1, 20.00),
  (187, 17, 1, 30.00),
  (187, 12, 3, 20.00),
  (188, 16, 1, 32.00),
  (188, 6, 1, 25.00),
  (188, 13, 1, 15.00),
  (189, 17, 1, 30.00),
  (190, 16, 1, 32.00),
  (191, 9, 1, 24.00),
  (192, 9, 1, 24.00),
  (192, 8, 1, 20.00),
  (193, 13, 2, 15.00),
  (193, 11, 1, 18.00),
  (193, 7, 2, 22.00),
  (193, 16, 1, 32.00),
  (194, 11, 2, 18.00),
  (194, 10, 1, 26.00),
  (194, 13, 1, 15.00),
  (195, 13, 1, 15.00),
  (195, 18, 1, 35.00),
  (196, 3, 2, 52.00),
  (196, 13, 1, 15.00),
  (197, 12, 1, 20.00),
  (198, 13, 1, 15.00),
  (199, 9, 1, 24.00),
  (200, 8, 1, 20.00),
  (201, 8, 1, 20.00),
  (201, 18, 3, 35.00),
  (201, 7, 1, 22.00),
  (202, 8, 3, 20.00),
  (202, 12, 1, 20.00),
  (203, 13, 1, 15.00),
  (204, 13, 3, 15.00),
  (204, 14, 1, 19.00),
  (204, 15, 2, 28.00),
  (205, 11, 1, 18.00),
  (205, 16, 4, 32.00),
  (206, 17, 1, 30.00),
  (207, 1, 1, 45.00),
  (207, 7, 1, 22.00),
  (207, 6, 2, 25.00),
  (208, 4, 1, 89.90),
  (208, 10, 2, 26.00),
  (208, 11, 1, 18.00),
  (208, 9, 1, 24.00),
  (209, 6, 1, 25.00),
  (210, 16, 1, 32.00),
  (210, 9, 1, 24.00),
  (211, 12, 1, 20.00),
  (211, 18, 1, 35.00),
  (211, 15, 1, 28.00),
  (212, 18, 1, 35.00),
  (212, 10, 1, 26.00),
  (213, 16, 1, 32.00),
  (214, 9, 1, 24.00),
  (214, 15, 1, 28.00),
  (215, 13, 2, 15.00),
  (215, 7, 1, 22.00),
  (216, 8, 2, 20.00),
  (216, 15, 1, 28.00),
  (217, 8, 1, 20.00),
  (217, 17, 3, 30.00),
  (217, 7, 1, 22.00),
  (218, 9, 1, 24.00),
  (218, 3, 2, 52.00),
  (219, 1, 1, 45.00),
  (220, 2, 1, 38.00),
  (221, 8, 1, 20.00),
  (222, 14, 2, 19.00),
  (223, 13, 1, 15.00),
  (223, 8, 1, 20.00),
  (224, 13, 1, 15.00),
  (225, 15, 1, 28.00),
  (226, 10, 3, 26.00),
  (226, 6, 1, 25.00),
  (226, 13, 1, 15.00),
  (227, 13, 2, 15.00),
  (228, 18, 1, 35.00),
  (229, 1, 1, 45.00),
  (229, 3, 1, 52.00),
  (230, 7, 1, 22.00),
  (231, 7, 1, 22.00),
  (232, 7, 1, 22.00),
  (233, 17, 1, 30.00),
  (233, 13, 1, 15.00),
  (234, 11, 2, 18.00),
  (234, 17, 1, 30.00),
  (235, 18, 2, 35.00),
  (236, 17, 2, 30.00),
  (236, 2, 2, 38.00),
  (237, 13, 1, 15.00),
  (238, 13, 2, 15.00),
  (238, 2, 1, 38.00),
  (239, 13, 2, 15.00),
  (240, 12, 1, 20.00),
  (240, 15, 2, 28.00),
  (241, 11, 1, 18.00),
  (241, 17, 1, 30.00),
  (242, 13, 1, 15.00),
  (243, 11, 1, 18.00),
  (243, 6, 1, 25.00),
  (243, 17, 1, 30.00),
  (243, 18, 1, 35.00),
  (244, 10, 2, 26.00),
  (245, 11, 3, 18.00),
  (245, 15, 1, 28.00),
  (246, 11, 1, 18.00),
  (247, 2, 2, 38.00),
  (247, 8, 1, 20.00),
  (247, 18, 1, 35.00),
  (248, 9, 1, 24.00),
  (249, 8, 1, 20.00),
  (249, 14, 1, 19.00),
  (250, 13, 1, 15.00),
  (251, 8, 2, 20.00),
  (251, 18, 3, 35.00),
  (252, 6, 3, 25.00),
  (253, 1, 1, 45.00),
  (253, 2, 1, 38.00),
  (254, 13, 2, 15.00),
  (254, 4, 1, 89.90),
  (255, 6, 3, 25.00),
  (255, 8, 1, 20.00),
  (256, 10, 2, 26.00),
  (256, 2, 1, 38.00),
  (256, 3, 1, 52.00),
  (257, 6, 2, 25.00),
  (258, 10, 1, 26.00),
  (259, 6, 1, 25.00),
  (259, 11, 2, 18.00);

-- Conferência rápida
SELECT COUNT(*) AS pedidos_novos FROM pedidos WHERE id >= 101;
SELECT COUNT(*) AS itens_novos FROM itens_pedido WHERE pedido_id >= 101;

USE loja_biscuit;
DELETE FROM itens_pedido WHERE pedido_id >= 101;
DELETE FROM pedidos WHERE id >= 101;