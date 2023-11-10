import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { resolve } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { UsersModule } from './users/users.module';
import { InventarioModule } from './inventario/inventario.module';
import { ProdutoModule } from './produto/produto.module';
import { EmpresaModule } from './empresa/empresa.module';
import { CobrancaModule } from './cobranca/cobranca.module';
import { FormaPagamentoModule } from './forma-pagamento/forma-pagamento.module';
import { ModalidadeModule } from './modalidade/modalidade.module';
import { CarteiraModule } from './carteira/carteira.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PagamentoModule } from './pagamento/pagamento.module';
import { ProvisaoModule } from './provisao/provisao.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: resolve('frontend/dist/futura-estoque'),
      exclude: ['/api*'],
    }),
    AuthModule,
    UsersModule,
    InventarioModule,
    ProdutoModule,
    EmpresaModule,
    CobrancaModule,
    FormaPagamentoModule,
    ModalidadeModule,
    CarteiraModule,
    DashboardModule,
    PagamentoModule,
    ProvisaoModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
