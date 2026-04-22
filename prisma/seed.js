const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.inconsistencia.deleteMany();
  await prisma.contaReceber.deleteMany();
  await prisma.contaPagar.deleteMany();
  await prisma.extratoBancario.deleteMany();
  await prisma.arquivo.deleteMany();
  await prisma.fechamento.deleteMany();

  const competencias = [
    {
      competencia: '2026-01',
      status: 'FECHADO',
      observacoes: 'Fechamento finalizado com validação da controladoria.',
    },
    {
      competencia: '2026-02',
      status: 'EM_REVISAO',
      observacoes: 'Pendências pequenas de categorização e notas fiscais.',
    },
    {
      competencia: '2026-03',
      status: 'PROCESSANDO',
      observacoes: 'Importações de extrato e conciliação em andamento.',
    },
  ];

  for (const [i, item] of competencias.entries()) {
    const fechamento = await prisma.fechamento.create({ data: item });

    await prisma.arquivo.createMany({
      data: [
        {
          fechamentoId: fechamento.id,
          nome: `extrato-itau-${item.competencia}.csv`,
          tipo: 'EXTRATO',
          caminho: `/uploads/${item.competencia}/extrato-itau.csv`,
        },
        {
          fechamentoId: fechamento.id,
          nome: `relatorio-contas-${item.competencia}.xlsx`,
          tipo: 'RELATORIO',
          caminho: `/uploads/${item.competencia}/relatorio-contas.xlsx`,
        },
      ],
    });

    const base = new Date(`2026-0${i + 1}-01T12:00:00Z`);

    await prisma.extratoBancario.createMany({
      data: [
        {
          fechamentoId: fechamento.id,
          data: new Date(base),
          descricao: 'Recebimento cliente Agência Aurora',
          valor: 18250.45,
          saldo: 89321.77,
          categoria: 'RECEITA_CLIENTE',
          conciliado: true,
        },
        {
          fechamentoId: fechamento.id,
          data: new Date(base.getTime() + 86400000),
          descricao: 'Pagamento fornecedor Mídia Programática',
          valor: -6340.9,
          saldo: 82980.87,
          categoria: 'FORNECEDOR',
          conciliado: i === 2 ? false : true,
        },
        {
          fechamentoId: fechamento.id,
          data: new Date(base.getTime() + 172800000),
          descricao: 'Tarifa bancária manutenção conta',
          valor: -89.9,
          saldo: 82890.97,
          categoria: 'TARIFA_BANCARIA',
          conciliado: false,
        },
      ],
    });

    await prisma.contaPagar.createMany({
      data: [
        {
          fechamentoId: fechamento.id,
          fornecedor: 'Meta Ads Brasil',
          vencimento: new Date(base.getTime() + 3 * 86400000),
          pagamento: i === 2 ? null : new Date(base.getTime() + 3 * 86400000),
          valor: 12450.0,
          categoria: 'MIDIA_PAGA',
          situacao: i === 2 ? 'PENDENTE' : 'PAGO',
        },
        {
          fechamentoId: fechamento.id,
          fornecedor: 'Google Cloud',
          vencimento: new Date(base.getTime() + 5 * 86400000),
          pagamento: i === 0 ? new Date(base.getTime() + 5 * 86400000) : null,
          valor: 1840.35,
          categoria: 'INFRAESTRUTURA',
          situacao: i === 0 ? 'PAGO' : 'PENDENTE',
        },
      ],
    });

    await prisma.contaReceber.createMany({
      data: [
        {
          fechamentoId: fechamento.id,
          cliente: 'Aurora Cosméticos',
          vencimento: new Date(base.getTime() + 2 * 86400000),
          recebimento: new Date(base.getTime() + 2 * 86400000),
          valor: 18250.45,
          categoria: 'RETENCAO_MENSAL',
          situacao: 'RECEBIDO',
        },
        {
          fechamentoId: fechamento.id,
          cliente: 'Lume Fashion',
          vencimento: new Date(base.getTime() + 8 * 86400000),
          recebimento: i === 0 ? new Date(base.getTime() + 9 * 86400000) : null,
          valor: 9340.0,
          categoria: 'PROJETO_PONTUAL',
          situacao: i === 0 ? 'RECEBIDO' : 'PENDENTE',
        },
      ],
    });

    await prisma.inconsistencia.createMany({
      data: [
        {
          fechamentoId: fechamento.id,
          tipo: 'LANCAMENTO_SEM_DOCUMENTO',
          data: new Date(base.getTime() + 172800000),
          descricao: 'Tarifa bancária sem documento de suporte no DRE.',
          valor: 89.9,
          status: i === 0 ? 'RESOLVIDA' : 'ABERTA',
          observacao:
            i === 0
              ? 'Classificada como despesa financeira e conciliada.'
              : 'Aguardando validação da equipe financeira.',
        },
        {
          fechamentoId: fechamento.id,
          tipo: 'DIVERGENCIA_VALOR',
          data: new Date(base.getTime() + 86400000),
          descricao: 'Diferença entre valor pago e nota fiscal do fornecedor.',
          valor: 120.5,
          status: i === 2 ? 'EM_ANALISE' : 'ABERTA',
          observacao: 'Revisar imposto retido e centro de custo.',
        },
      ],
    });
  }

  console.log('Seed concluído com sucesso.');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
