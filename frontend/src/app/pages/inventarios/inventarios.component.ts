import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { endOfDay, subDays, startOfDay } from 'date-fns';

import { Inventario } from '../../interfaces/inventario';
import { InventarioService } from '../../services/inventario.service';
import { AlertService } from '../../services/alert/alert.service';
import { InventarioStatus } from '../../enums/inventario-status.enum';
import { PesquisaInventarioComponent } from './pesquisa-inventario/pesquisa-inventario.component';

@Component({
  selector: 'app-inventarios',
  templateUrl: './inventarios.component.html',
  styleUrls: ['./inventarios.component.css'],
})
export class InventariosComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['data', 'empresa', 'status', 'usuario', 'acoes'];
  dataSource: Observable<Inventario[]>;
  isLoading: Observable<boolean>;

  status = [InventarioStatus.ABERTO, InventarioStatus.FINALIZADO];
  dataInicio = startOfDay(subDays(new Date(), 30));
  dataFim = endOfDay(new Date());

  constructor(
    private router: Router,
    private inventarioService: InventarioService,
    private alertService: AlertService,
    public dialog: MatDialog,
  ) {
    this.isLoading = this.inventarioService.isLoading$;
    this.dataSource = this.inventarioService.inventarios$;
  }

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.inventarioService.reset();
  }

  pesquisa(): void {
    const dialogRef = this.dialog.open(PesquisaInventarioComponent, {
      width: '500px',
      data: {
        status: this.status,
        dataInicio: this.dataInicio,
        dataFim: this.dataFim,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const { status, dataInicio, dataFim } = result;
        this.status = [...status];
        this.dataInicio = dataInicio;
        this.dataFim = endOfDay(dataFim);
        this.inventarioService.find(this.status, this.dataInicio, this.dataFim);
      }
    });
  }

  load(): void {
    this.inventarioService.find(this.status, this.dataInicio, this.dataFim);
  }

  abrirInventario(): void {
    this.router.navigate(['inventario']);
  }

  edit(inventario: Inventario): void {
    this.router.navigate(['inventario', inventario.id]);
  }

  delete(inventario: Inventario): void {
    this.alertService
      .showYesNo(
        'Confirma a exclusão do inventário?',
        ''
      )
      .then((result) => {
        if (result) {
          this.inventarioService.delete(inventario.id).subscribe(() => {
            this.load();
          });
        }
      });
  }
}
