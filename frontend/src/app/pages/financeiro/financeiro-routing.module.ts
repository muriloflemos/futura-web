import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FinanceiroComponent } from './financeiro.component';

const routes: Routes = [
  {
    path: '',
    component: FinanceiroComponent,
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
      },
      {
        path: 'cobranca',
        loadChildren: () =>
          import('./cobranca/cobranca.module').then((m) => m.CobrancaModule),
      },
      {
        path: 'relatorios',
        loadChildren: () =>
          import('./relatorios/relatorios.module').then((m) => m.RelatoriosModule),
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FinanceiroRoutingModule {}
