import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.usuario.upsert({
    where: { login: 'admin' },
    update: {},
    create: {
      nome: 'Admin',
      login: 'admin',
      senha: '123456',
      tipo: 'ADMINISTRADOR',
    },
  });
  const estoque = await prisma.usuario.upsert({
    where: { login: 'estoque' },
    update: {},
    create: {
      nome: 'Estoque',
      login: 'estoque',
      senha: '123456',
      tipo: 'ESTOQUISTA',
      Empresa: {
        create: {
          id_empresa: 1,
        },
      },
    },
  });
  const financeiro = await prisma.usuario.upsert({
    where: { login: 'financeiro' },
    update: {},
    create: {
      nome: 'Financeiro',
      login: 'financeiro',
      senha: '123456',
      tipo: 'ANALISTA_CREDITO',
      Empresa: {
        create: {
          id_empresa: 1,
        },
      },
    },
  });
  console.log({ admin, estoque, financeiro });

  const formasPagamento = [
    'Barter',
    'BD Agro',
    'Boleto',
    'Cheque',
    'Dinheiro',
    'TED',
    'Jurídico',
    'Campo de Semente',
  ];
  for (let i = 0; i < formasPagamento.length; i++) {
    const formaPagamento = await prisma.formaPagamento.upsert({
      where: { id: i + 1 },
      update: {},
      create: {
        nome: formasPagamento[i],
      },
    });
    console.log(formaPagamento);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
