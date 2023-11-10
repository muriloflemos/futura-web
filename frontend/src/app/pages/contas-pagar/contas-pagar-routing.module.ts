import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ContasPagarComponent } from './contas-pagar.component';

const routes: Routes = [
  {
    path: '',
    component: ContasPagarComponent,
    children: [
      {
        path: 'pagamentos',
        loadChildren: () =>
          import('./pagamentos/pagamentos.module').then((m) => m.PagamentosModule),
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContasPagarRoutingModule {}
