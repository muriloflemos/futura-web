import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NavigationComponent } from './navigation.component';
import { AuthGuard } from '../auth.guard';
import { AdminGuard, FinanceiroGuard, EstoqueGuard, ContasPagarGuard } from '../guards';

const routes: Routes = [
  {
    path: '',
    component: NavigationComponent,
    children: [
      {
        path: '',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('../pages/home/home.module').then((m) => m.HomeModule),
      },
      {
        path: 'usuarios',
        canActivate: [AuthGuard, AdminGuard],
        loadChildren: () =>
          import('../pages/usuarios/usuarios.module').then((m) => m.UsuariosModule),
      },
      {
        path: 'usuario',
        canActivate: [AuthGuard, AdminGuard],
        loadChildren: () =>
          import('../pages/usuario/usuario.module').then((m) => m.UsuarioModule),
      },
      {
        path: 'usuario/:id',
        canActivate: [AuthGuard, AdminGuard],
        loadChildren: () =>
          import('../pages/usuario/usuario.module').then((m) => m.UsuarioModule),
      },
      {
        path: 'usuario/:id/reset-senha',
        canActivate: [AuthGuard, AdminGuard],
        loadChildren: () =>
          import('../pages/reset-senha/reset-senha.module').then((m) => m.ResetSenhaModule),
      },
      {
        path: 'inventarios',
        canActivate: [AuthGuard, EstoqueGuard],
        loadChildren: () =>
          import('../pages/inventarios/inventarios.module').then((m) => m.InventariosModule),
      },
      {
        path: 'inventario',
        canActivate: [AuthGuard, EstoqueGuard],
        loadChildren: () =>
          import('../pages/inventario/inventario.module').then((m) => m.InventarioModule),
      },
      {
        path: 'inventario/:id',
        canActivate: [AuthGuard, EstoqueGuard],
        loadChildren: () =>
          import('../pages/inventario/inventario.module').then((m) => m.InventarioModule),
      },
      {
        path: 'financeiro',
        canActivate: [AuthGuard, FinanceiroGuard],
        loadChildren: () =>
          import('../pages/financeiro/financeiro.module').then((m) => m.FinanceiroModule),
      },
      {
        path: 'contas-pagar',
        canActivate: [AuthGuard, ContasPagarGuard],
        loadChildren: () =>
          import('../pages/contas-pagar/contas-pagar.module').then((m) => m.ContasPagarModule),
      },
      {
        path: 'provisao',
        canActivate: [AuthGuard, ContasPagarGuard],
        loadChildren: () =>
          import('../pages/provisao/provisao.module').then((m) => m.ProvisaoModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NavigationRoutingModule {}
