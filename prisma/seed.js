const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.inconsistencia.deleteMany();
  await prisma.contaReceber.deleteMany();
  await prisma.contaPagar.deleteMany();
  await prisma.extratoBancario.deleteMany();
  await prisma.arquivo.deleteMany();
  await prisma.fechamento.deleteMany();

  await prisma.fechamento.create({
    data: {
      competencia: new Date("2026-01-01T00:00:00.000Z"),
      status: "FECHADO",
      observacoes: "Competência encerrada sem pendências críticas.",
      arquivos: {
        create: [
          {
            nome: "extrato-jan-2026.pdf",
            tipo: "PDF",
            caminho: "/uploads/2026-01/extrato-jan-2026.pdf"
          },
          {
            nome: "dre-jan-2026.xlsx",
            tipo: "XLSX",
            caminho: "/uploads/2026-01/dre-jan-2026.xlsx"
          }
        ]
      },
      extratos: {
        create: [
          {
            data: new Date("2026-01-05T00:00:00.000Z"),
            descricao: "Recebimento contrato Corporativo Atlas",
            valor: 18450.9,
            saldo: 65020.45,
            categoria: "RECEITA",
            conciliado: true
          },
          {
            data: new Date("2026-01-10T00:00:00.000Z"),
            descricao: "Pagamento fornecedor cloud",
            valor: -3890,
            saldo: 61130.45,
            categoria: "INFRAESTRUTURA",
            conciliado: true
          },
          {
            data: new Date("2026-01-18T00:00:00.000Z"),
            descricao: "Tarifa bancária mensal",
            valor: -189.5,
            saldo: 60940.95,
            categoria: "BANCARIO",
            conciliado: true
          }
        ]
      },
      contasPagar: {
        create: [
          {
            fornecedor: "AWS Brasil",
            vencimento: new Date("2026-01-12T00:00:00.000Z"),
            pagamento: new Date("2026-01-11T00:00:00.000Z"),
            valor: 3890,
            categoria: "Infraestrutura",
            situacao: "PAGO"
          },
          {
            fornecedor: "Contabilidade Prime",
            vencimento: new Date("2026-01-25T00:00:00.000Z"),
            pagamento: new Date("2026-01-24T00:00:00.000Z"),
            valor: 2200,
            categoria: "Serviços",
            situacao: "PAGO"
          }
        ]
      },
      contasReceber: {
        create: [
          {
            cliente: "Atlas Group",
            vencimento: new Date("2026-01-07T00:00:00.000Z"),
            recebimento: new Date("2026-01-05T00:00:00.000Z"),
            valor: 18450.9,
            categoria: "Assinatura",
            situacao: "RECEBIDO"
          },
          {
            cliente: "Mercato Hub",
            vencimento: new Date("2026-01-20T00:00:00.000Z"),
            recebimento: new Date("2026-01-20T00:00:00.000Z"),
            valor: 9560,
            categoria: "Projeto",
            situacao: "RECEBIDO"
          }
        ]
      },
      inconsistencias: {
        create: [
          {
            tipo: "LANCAMENTO_DUPLICADO",
            data: new Date("2026-01-18T00:00:00.000Z"),
            descricao: "Tarifa bancária registrada em duplicidade no ERP.",
            valor: 189.5,
            status: "RESOLVIDA",
            observacao: "Segunda linha removida no fechamento final."
          }
        ]
      }
    }
  });

  await prisma.fechamento.create({
    data: {
      competencia: new Date("2026-02-01T00:00:00.000Z"),
      status: "EM_REVISAO",
      observacoes: "Aguardando validação final de contas a receber.",
      arquivos: {
        create: [
          {
            nome: "extrato-fev-2026.csv",
            tipo: "CSV",
            caminho: "/uploads/2026-02/extrato-fev-2026.csv"
          }
        ]
      },
      extratos: {
        create: [
          {
            data: new Date("2026-02-06T00:00:00.000Z"),
            descricao: "Recebimento mensalidade cliente Nimbus",
            valor: 13200,
            saldo: 73140.95,
            categoria: "RECEITA",
            conciliado: true
          },
          {
            data: new Date("2026-02-15T00:00:00.000Z"),
            descricao: "Pagamento licença de analytics",
            valor: -1499,
            saldo: 71641.95,
            categoria: "SOFTWARE",
            conciliado: false
          },
          {
            data: new Date("2026-02-26T00:00:00.000Z"),
            descricao: "Pagamento folha parcial",
            valor: -9800,
            saldo: 61841.95,
            categoria: "PESSOAL",
            conciliado: true
          }
        ]
      },
      contasPagar: {
        create: [
          {
            fornecedor: "Analytics Pro",
            vencimento: new Date("2026-02-16T00:00:00.000Z"),
            pagamento: null,
            valor: 1499,
            categoria: "Software",
            situacao: "PENDENTE"
          },
          {
            fornecedor: "Folha Flex",
            vencimento: new Date("2026-02-28T00:00:00.000Z"),
            pagamento: new Date("2026-02-26T00:00:00.000Z"),
            valor: 9800,
            categoria: "Pessoal",
            situacao: "PAGO"
          }
        ]
      },
      contasReceber: {
        create: [
          {
            cliente: "Nimbus Co",
            vencimento: new Date("2026-02-08T00:00:00.000Z"),
            recebimento: new Date("2026-02-06T00:00:00.000Z"),
            valor: 13200,
            categoria: "Assinatura",
            situacao: "RECEBIDO"
          },
          {
            cliente: "Vértice Labs",
            vencimento: new Date("2026-02-22T00:00:00.000Z"),
            recebimento: null,
            valor: 11890,
            categoria: "Projeto",
            situacao: "PENDENTE"
          }
        ]
      },
      inconsistencias: {
        create: [
          {
            tipo: "CONCILIACAO_PENDENTE",
            data: new Date("2026-02-15T00:00:00.000Z"),
            descricao: "Saída bancária sem baixa no contas a pagar.",
            valor: 1499,
            status: "EM_ANALISE",
            observacao: "Equipe financeira validando com fornecedor."
          },
          {
            tipo: "RECEBIMENTO_ATRASADO",
            data: new Date("2026-02-22T00:00:00.000Z"),
            descricao: "Título vencido sem compensação no banco.",
            valor: 11890,
            status: "ABERTA",
            observacao: "Follow-up comercial iniciado."
          }
        ]
      }
    }
  });

  await prisma.fechamento.create({
    data: {
      competencia: new Date("2026-03-01T00:00:00.000Z"),
      status: "PROCESSANDO",
      observacoes: "Carga de extratos e classificação em andamento.",
      arquivos: {
        create: [
          {
            nome: "retorno-mar-2026.ofx",
            tipo: "OFX",
            caminho: "/uploads/2026-03/retorno-mar-2026.ofx"
          }
        ]
      },
      extratos: {
        create: [
          {
            data: new Date("2026-03-03T00:00:00.000Z"),
            descricao: "Recebimento boleto cliente Norte Digital",
            valor: 8600,
            saldo: 70441.95,
            categoria: "RECEITA",
            conciliado: true
          },
          {
            data: new Date("2026-03-09T00:00:00.000Z"),
            descricao: "Pagamento mídia performance",
            valor: -4200,
            saldo: 66241.95,
            categoria: "MARKETING",
            conciliado: false
          }
        ]
      },
      contasPagar: {
        create: [
          {
            fornecedor: "Ads Partner",
            vencimento: new Date("2026-03-10T00:00:00.000Z"),
            pagamento: null,
            valor: 4200,
            categoria: "Marketing",
            situacao: "PENDENTE"
          },
          {
            fornecedor: "Energia Office",
            vencimento: new Date("2026-03-20T00:00:00.000Z"),
            pagamento: null,
            valor: 740,
            categoria: "Operacional",
            situacao: "PENDENTE"
          }
        ]
      },
      contasReceber: {
        create: [
          {
            cliente: "Norte Digital",
            vencimento: new Date("2026-03-05T00:00:00.000Z"),
            recebimento: new Date("2026-03-03T00:00:00.000Z"),
            valor: 8600,
            categoria: "Projeto",
            situacao: "RECEBIDO"
          },
          {
            cliente: "Frame Retail",
            vencimento: new Date("2026-03-25T00:00:00.000Z"),
            recebimento: null,
            valor: 14200,
            categoria: "Assinatura",
            situacao: "PENDENTE"
          }
        ]
      },
      inconsistencias: {
        create: [
          {
            tipo: "CLASSIFICACAO_INDEVIDA",
            data: new Date("2026-03-09T00:00:00.000Z"),
            descricao: "Despesa de mídia sem categoria final definida.",
            valor: 4200,
            status: "ABERTA",
            observacao: "Aguardando aprovação do controller."
          }
        ]
      }
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
