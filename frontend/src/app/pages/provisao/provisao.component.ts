import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  Validators,
} from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { Sort, SortDirection } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { endOfDay, parseISO, startOfDay, format } from 'date-fns';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { Empresa } from '../../interfaces/empresa';
import { LocalStorageService } from '../../services/local-storage.service';
import { EmpresaService } from '../../services/empresa.service';
import { AlertService } from '../../services/alert/alert.service';
import { ModalidadeService } from '../../services/modalidade.service';
import { ProvisaoService } from '../../services/provisao.service';
import { ProvisaoDTO, FindProvisaoDTO, SaveProvisaoDto } from '../../interfaces/provisao';
import { Modalidade } from '../../interfaces/modalidade';
import { ProvisaoFormComponent } from './provisao-form/provisao-form.component';

@Component({
  selector: 'app-provisao',
  templateUrl: './provisao.component.html',
  styleUrls: ['./provisao.component.css']
})
export class ProvisaoComponent implements OnInit {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.loadingSubject.asObservable();

  private onDestroy$ = new Subject();

  displayedColumns: string[] = [
    'unidade',
    'parceiro',
    'vencimento',
    'modalidade',
    'valor',
    'actions',
  ];
  active = false;

  empresas: Empresa[] = [];
  allEmpresas = false;

  private dataSubject = new BehaviorSubject<ProvisaoDTO[]>([]);
  dataSource$ = this.dataSubject.asObservable();

  form = this.formBuilder.group(
    {
      id_empresa: [[], Validators.required],
      data_inicio: ['', Validators.required],
      data_fim: ['', Validators.required],
      parceiro: [''],
      modalidade: [[]],
    },
  );

  sort = 'vencimento';
  sortDirection: SortDirection = 'asc';

  modalidades: Modalidade[] = [];
  allModalidades = false;

  valorTotal = 0;

  constructor(
    private formBuilder: FormBuilder,
    private readonly empresaService: EmpresaService,
    private readonly localStorageService: LocalStorageService,
    private readonly modalidadeService: ModalidadeService,
    private readonly provisaoService: ProvisaoService,
    private readonly alertService: AlertService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.empresaService
      .getAll()
      .pipe(take(1))
      .subscribe((result: Empresa[]) => (this.empresas = result));
    this.loadModalidades();

    this.form.get('id_empresa')?.valueChanges.subscribe((value) => {
      this.allEmpresas = value?.length == this.empresas.length;
    });

    this.form.get('modalidade')?.valueChanges.subscribe((value) => {
      this.allModalidades = value?.length == this.modalidades.length;
    });

    const filter = this.localStorageService.get('ProvisaoComponent.filter');
    if (filter) {
      const {
        id_empresa,
        data_inicio,
        data_fim,
        parceiro,
        modalidade,
      } = filter;
      if (id_empresa) this.form.controls['id_empresa'].setValue(id_empresa);
      if (data_inicio)
        this.form.controls['data_inicio'].setValue(parseISO(data_inicio));
      if (data_fim) this.form.controls['data_fim'].setValue(parseISO(data_fim));
      if (parceiro) this.form.controls['parceiro'].setValue(parceiro);
      if (modalidade) this.form.controls['modalidade'].setValue(modalidade);
    }
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  limpar(): void {
    this.form.reset();
    this.localStorageService.remove('ProvisaoComponent.filter');
  }

  filtrar(): void {
    this.sort = 'vencimento';
    this.sortDirection = 'asc';
    this.active = true;
    this.loadData();
  }

  sortChange(sortState: Sort): void {
    this.sort = sortState.active;
    this.sortDirection = sortState.direction;
    this.loadData();
  }

  toggleEmpresas(checked: boolean): void {
    if (checked) {
      this.form.patchValue({
        id_empresa: this.empresas.map((o) => o.id),
      });
    } else {
      this.form.patchValue({
        id_empresa: [],
      });
    }
  }

  toggleModalidades(checked: boolean): void {
    if (checked) {
      this.form.patchValue({
        modalidade: this.modalidades.map((o) => o.id),
      });
    } else {
      this.form.patchValue({
        modalidade: [],
      });
    }
  }

  private loadModalidades(): void {
    this.modalidadeService
      .findAllFutura()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((results) => {
        this.modalidades = results;
      });
  }

  private loadData(): void {
    if (!this.form.valid) return;

    this.dataSubject.next([]);
    this.loadingSubject.next(true);

    const {
      id_empresa,
      modalidade,
      parceiro,
    } = this.form.value;
    let {
      data_inicio,
      data_fim,
    } = this.form.value;

    if (data_inicio && data_fim) {
      data_inicio = startOfDay(data_inicio).toISOString();
      data_fim = endOfDay(data_fim).toISOString();
    }

    this.localStorageService.set('ProvisaoComponent.filter', this.form.value);

    let sort = this.sort;
    if (sort == 'unidade') {
      sort = 'id_empresa';
    } else if (sort == 'modalidade') {
      sort = 'id_modalidade';
    }

    const params: FindProvisaoDTO = {
      id_empresa,
      data_inicio,
      data_fim,
      parceiro,
      modalidade,
      sort,
      sortDirection: this.sortDirection,
    };
    this.provisaoService
      .findAll(params)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        (results: ProvisaoDTO[]) => {
          results = results.map((result: ProvisaoDTO) => {
            const empresa = this.empresas.find((empresa) => empresa.id == result.id_empresa);
            result.unidade = empresa?.nome ?? '';
            const modalidade = this.modalidades.find((modalidade) => modalidade.id == result.id_modalidade);
            result.modalidade = modalidade?.descricao ?? '';
            return result;
          });
          this.calcValorTotal(results);
          this.dataSubject.next(results);
          this.loadingSubject.next(false);
        },
        () => {
          this.calcValorTotal([]);
          this.dataSubject.next([]);
          this.loadingSubject.next(false);
        }
      );
  }

  calcValorTotal(results: ProvisaoDTO[]): void {
    this.valorTotal = 0;
    results.forEach((value: ProvisaoDTO) => {
      this.valorTotal += Number(value.valor);
    });
  }

  add(): void {
    const dialogRef = this.dialog.open(ProvisaoFormComponent, {
      data: {
        empresas: this.empresas,
        modalidades: this.modalidades,
      },
    });
    dialogRef.afterClosed().subscribe((result: SaveProvisaoDto) => {
      if (result) {
        this.saveProvisao(result);
      }
    });
  }

  saveProvisao(data: SaveProvisaoDto): void {
    const { id } = data;
    delete data.id;
    if (id) {
      this.updateProvisao(id, data);
    } else {
      this.createProvisao(data);
    }
  }

  private createProvisao(data: SaveProvisaoDto): void {
    this.provisaoService
      .create(data)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        (provisao: ProvisaoDTO) => {
          if (provisao && provisao.id > 0) {
            this.loadData();
          }
        },
        (err) => {
          this.alertService.showError(
            'Erro',
            'Não foi possível salvar os dados, tente novamente em alguns instantes ou entre em contato com o suporte!'
          );
        }
      );
  }

  private updateProvisao(id: number, data: SaveProvisaoDto): void {
    this.provisaoService
      .update(id, data)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        (provisao: ProvisaoDTO) => {
          if (provisao && provisao.id > 0) {
            this.loadData();
          }
        },
        (err) => {
          this.alertService.showError(
            'Erro',
            'Não foi possível salvar os dados, tente novamente em alguns instantes ou entre em contato com o suporte!'
          );
        }
      );
  }

  edit(provisao: ProvisaoDTO): void {
    const dialogRef = this.dialog.open(ProvisaoFormComponent, {
      data: {
        provisao,
        empresas: this.empresas,
        modalidades: this.modalidades,
      },
    });
    dialogRef.afterClosed().subscribe((result: SaveProvisaoDto) => {
      if (result) {
        this.saveProvisao(result);
      }
    });
  }

  delete(provisao: ProvisaoDTO): void {
    const title = 'Excluir provisão';
    const message = 'Deseja realmente excluir a provisão?'
    this.alertService
      .showYesNo(title, message)
      .then((result) => {
        if (result) {
          this.provisaoService
            .delete(provisao.id)
            .pipe(takeUntil(this.onDestroy$))
            .subscribe((provisao) => {
              console.log(provisao);
              this.loadData();
            });
        }
      });
  }

  export(): void {
    const datasource = this.dataSubject.value;

    if (!datasource || datasource.length == 0) {
      return;
    }

    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('Provisoes');

    worksheet.columns = [
      { header: 'Unidade', key: 'unidade', width: 20 },
      { header: 'Parceiro', key: 'parceiro', width: 60 },
      { header: 'Vencimento', key: 'vencimento', width: 20 },
      { header: 'Modalidade', key: 'modalidade', width: 40 },
      { header: 'Valor', key: 'valor', width: 20 },
    ];

    const columns = ['A', 'B', 'C', 'D', 'E'];
    columns.forEach((col) => {
      worksheet.getCell(`${col}1`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
          argb: '3f51b5',
        }
      };
      worksheet.getCell(`${col}1`).font = {
        color: { argb: 'FFFFFF' },
        bold: true,
        name: 'Arial',
        size: 12,
      }
    });

    datasource.forEach((item) => {
      let row = worksheet.addRow({
        unidade: item.unidade,
        parceiro: item.parceiro,
        vencimento: format(new Date(item.vencimento), 'dd/MM/yyyy'),
        modalidade: item.modalidade,
        valor: item.valor,
      }, 'n');
      row.font = { name: 'Arial', size: 12 };
    });

    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      fs.saveAs(blob, 'Provisões.xlsx');
    });
  }
}
