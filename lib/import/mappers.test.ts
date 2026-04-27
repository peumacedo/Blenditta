import test from "node:test";
import assert from "node:assert/strict";

import { mapContasPagarRows, mapContasReceberRows, mapExtratoRows, parseDate, parseNumber } from "./mappers.ts";
import { detectDelimiter, normalizeHeader } from "./parsers.ts";

test("detectDelimiter escolhe ; quando CSV Omie usa ponto e vírgula", () => {
  const csv = 'Data;Cliente ou Fornecedor;Valor (R$)\n01/03/2026;Fornecedor A;1.234,56';
  assert.equal(detectDelimiter(csv), ";");
});

test("detectDelimiter ignora delimitador dentro de aspas", () => {
  const csv = 'Data;Observações;Valor (R$)\n01/03/2026;"Compra, insumos";100,00';
  assert.equal(detectDelimiter(csv), ";");
});

test("normalizeHeader cobre cabeçalhos reais do Omie", () => {
  assert.equal(normalizeHeader("Cliente ou Fornecedor"), "cliente_ou_fornecedor");
  assert.equal(normalizeHeader("Valor (R$)"), "valor_r$");
  assert.equal(normalizeHeader("Saldo (R$)"), "saldo_r$");
});

test("parseNumber faz parsing BR com R$ e milhares", () => {
  assert.equal(parseNumber("R$ 1.234,56"), 1234.56);
  assert.equal(parseNumber("(2.000,00)"), -2000);
});

test("parseDate aceita formatos BR e ISO", () => {
  assert.equal(parseDate("31/01/2026")?.toISOString(), "2026-01-31T00:00:00.000Z");
  assert.equal(parseDate("2026-02-01")?.toISOString(), "2026-02-01T00:00:00.000Z");
});

test("mapExtratoRows prioriza descricao real e filtra saldo inicial/anterior", () => {
  const headers = ["data", "cliente_ou_fornecedor", "observacoes", "documento", "tipo_de_documento", "valor_r$", "saldo_r$", "categoria"];
  const rows = [
    {
      data: "01/03/2026",
      cliente_ou_fornecedor: "Saldo Inicial",
      observacoes: "",
      documento: "",
      tipo_de_documento: "",
      "valor_r$": "0,00",
      "saldo_r$": "1000,00",
      categoria: ""
    },
    {
      data: "02/03/2026",
      cliente_ou_fornecedor: "",
      observacoes: "Pagamento fornecedor",
      documento: "NF-123",
      tipo_de_documento: "NFe",
      "valor_r$": "-350,00",
      "saldo_r$": "650,00",
      categoria: "Despesas"
    }
  ];

  const mapped = mapExtratoRows(rows, headers);
  assert.equal(mapped.data.length, 1);
  assert.equal(mapped.data[0]?.descricao, "Pagamento fornecedor");
  assert.ok(mapped.warnings.some((w) => w.includes("saldo inicial/anterior/totalização")));
});

test("mapContasPagarRows aplica aliases Omie e traduz situação", () => {
  const headers = [
    "fornecedor_nome_fantasia",
    "fornecedor_razao_social",
    "vencimento",
    "ultimo_pagamento",
    "previsao_de_pagamento",
    "valor_da_conta",
    "valor_a_pagar",
    "valor_liquido",
    "categoria",
    "situacao"
  ];

  const rows = [
    {
      fornecedor_nome_fantasia: "Fornecedor XPTO",
      fornecedor_razao_social: "Fornecedor XPTO LTDA",
      vencimento: "10/03/2026",
      ultimo_pagamento: "11/03/2026",
      previsao_de_pagamento: "10/03/2026",
      valor_da_conta: "1.000,00",
      valor_a_pagar: "900,00",
      valor_liquido: "850,00",
      categoria: "Serviços",
      situacao: "Cancelado"
    }
  ];

  const mapped = mapContasPagarRows(rows, headers);
  assert.equal(mapped.data[0]?.fornecedor, "Fornecedor XPTO");
  assert.equal(mapped.data[0]?.valor, 1000);
  assert.equal(mapped.data[0]?.situacao, "PENDENTE");
  assert.ok(mapped.warnings.some((w) => w.includes("Cancelado")));
});

test("mapContasReceberRows aplica aliases Omie e fallback de situação desconhecida", () => {
  const headers = [
    "cliente_nome_fantasia",
    "cliente_razao_social",
    "vencimento",
    "ultimo_recebimento",
    "previsao_de_recebimento",
    "valor_da_conta",
    "valor_a_receber",
    "valor_liquido",
    "categoria",
    "situacao"
  ];

  const rows = [
    {
      cliente_nome_fantasia: "Cliente ABC",
      cliente_razao_social: "Cliente ABC SA",
      vencimento: "15/03/2026",
      ultimo_recebimento: "",
      previsao_de_recebimento: "20/03/2026",
      valor_da_conta: "2.500,00",
      valor_a_receber: "2.100,00",
      valor_liquido: "2.000,00",
      categoria: "Receita",
      situacao: "Em análise"
    }
  ];

  const mapped = mapContasReceberRows(rows, headers);
  assert.equal(mapped.data[0]?.cliente, "Cliente ABC");
  assert.equal(mapped.data[0]?.valor, 2500);
  assert.equal(mapped.data[0]?.situacao, "PENDENTE");
  assert.ok(mapped.warnings.some((w) => w.includes("convertida para PENDENTE")));
});
