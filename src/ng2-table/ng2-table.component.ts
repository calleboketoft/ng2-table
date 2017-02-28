import { Component, Input, Output, EventEmitter, ViewChild, AfterViewChecked,
  OnChanges } from '@angular/core'
import { tableDataSort } from './sorter.service'
import { TableConfigModel } from './table-config.model'
import { getNgThing } from './style-and-class.service'

@Component({
  selector: 'ng2-table',
  styles: [`
    /**
     * Scrollable tbody
     * https://jsfiddle.net/tsayen/xuvsncr2/28/
     * http://stackoverflow.com/questions/17067294/html-table-with-100-width-with-vertical-scroll-inside-tbody
     */

    table {
      display: flex;
      flex-flow: column;
      height: 100%;
      width: 100%;
    }
    table thead {
      /* head takes the height it requires,
      and it's not scaled when table is resized */
      flex: 0 0 auto;
    }
    table thead.with-scrollbar {
      width: calc(100% - 0.9em);
    }
    table thead.without-scrollbar {
      width: 100%
    }
    table tbody {
      /* body takes all the remaining available space */
      flex: 1 1 auto;
      display: block;
      overflow: auto;
    }
    table tbody tr {
      width: 100%;
    }
    table thead, table tbody tr {
      display: table;
      table-layout: fixed;
    }

    /**
     * Appearance
     */

    th span:hover {
      cursor: pointer;
    }
    .table thead th {
      vertical-align: top;
      border-bottom: 1px solid #eceeef;
    }
    .filter-wrap {
      margin-top: 8px;
    }

    /**
     * Preserve newlines
     * http://stackoverflow.com/questions/10937218/how-to-show-multiline-text-in-a-table-cell
     *
     * And let word-wrap still work
     * http://stackoverflow.com/a/4413129
     */
    td > div > .cell-content {
      white-space: pre-wrap;
    }
  `],
  template: `
    <table
      [ngClass]="getNgThing('table', 'class', tableConfig)"
      [ngStyle]="getNgThing('table', 'style', tableConfig)">
      <thead #thead>
        <tr>
          <!-- rendering from tableConfigCopy makes the header re-render each
               time tableConfigCopy is updated -->
          <th *ngFor="let col of tableConfigCopy.columnDefs"
            [style.width]="col.width"
            [ngClass]="getNgThing('header', 'class', tableConfig, null, null, null, col)"
            [ngStyle]="getNgThing('header', 'style', tableConfig, null, null, null, col)">
            <span (click)="colHeaderSortClicked(col)">
              {{col.headerText || col.field}}
              <span *ngIf="col.sortAdvanced?.direction === -1" class="ng2-table-caret">
                &nbsp;&#9660;
              </span>
              <span *ngIf="col.sortAdvanced?.direction === 1" class="ng2-table-caret">
                &nbsp;&#9650;
              </span>
            </span>

            <div *ngIf="!isAnyFieldFilterable" class="filter-wrap">
            </div>

            <div *ngIf="isAnyFieldFilterable" class="filter-wrap">
              <filter-input-cmp
                *ngIf="col.filterEnabled"
                [filterValue]="col.filterValue"
                [field]="col.field"
                [placeholder]="col.filterPlaceholder"
                (filter)="filterUpdate($event)">
              </filter-input-cmp>
            </div>
          </th>
        </tr>
      </thead>
      <tbody #tbody>
        <tr
          *ngFor="let rowData of tableData | filter: tableConfigCopy; let rowIndex = index"
          [ngClass]="getNgThing('row', 'class', tableConfig, rowData, rowIndex, tableConfigCopy.activeRow)"
          [ngStyle]="getNgThing('row', 'style', tableConfig, rowData, rowIndex, tableConfigCopy.activeRow)"
          (click)="rowClickedFn($event, rowData, rowIndex)">
          <td *ngFor="let col of tableConfig.columnDefs" [style.width]="col.width">
            <div [ngSwitch]="col.cellItem?.elementType">

              <!-- BUTTON -->
              <div *ngSwitchCase="'button'">
                <div
                  [ngClass]="getNgThing('cell', 'class', tableConfig, rowData, rowIndex, tableConfigCopy.activeRow, col)"
                  [ngStyle]="getNgThing('cell', 'style', tableConfig, rowData, rowIndex, tableConfigCopy.activeRow, col)">
                  <button type="button"
                    [ngClass]="getNgThing('cellItemButton', 'class', tableConfig, rowData, rowIndex, tableConfigCopy.activeRow, col)"
                    [ngStyle]="getNgThing('cellItemButton', 'style', tableConfig, rowData, rowIndex, tableConfigCopy.activeRow, col)"
                    (click)="cellItemClickedFn($event, col, rowData)"
                    >{{col.cellItem?.staticContent || rowData[col.field]}}</button>
                </div>
              </div>

              <!-- DIV -->
              <div *ngSwitchCase="'div'">
                <div
                  [ngClass]="getNgThing('cell', 'class', tableConfig, rowData, rowIndex, tableConfigCopy.activeRow, col)"
                  [ngStyle]="getNgThing('cell', 'style', tableConfig, rowData, rowIndex, tableConfigCopy.activeRow, col)">
                  <div
                    [ngClass]="getNgThing('cellItemDiv', 'class', tableConfig, rowData, rowIndex, tableConfigCopy.activeRow, col)"
                    [ngStyle]="getNgThing('cellItemDiv', 'style', tableConfig, rowData, rowIndex, tableConfigCopy.activeRow, col)"
                    (click)="cellItemClickedFn($event, col, rowData, rowIndex)"
                    >{{col.cellItem?.staticContent || rowData[col.field]}}</div>
                </div>
              </div>

              <!-- NO ITEM -->
              <div *ngSwitchDefault class="cell-content"
                  [ngClass]="getNgThing('cell', 'class', tableConfig, rowData, rowIndex, tableConfigCopy.activeRow, col)"
                  [ngStyle]="getNgThing('cell', 'style', tableConfig, rowData, rowIndex, tableConfigCopy.activeRow, col)"
                >{{rowData[col.field]}}</div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  `
})
export class Ng2TableComponent implements OnChanges, AfterViewChecked {
  @Input() tableData: Array<any>
  @Input() tableConfig: TableConfigModel
  @Output() rowClicked = new EventEmitter()
  @Output() cellItemClicked = new EventEmitter()
  @Output() tableConfigUpdated = new EventEmitter()

  @ViewChild('tbody') tbody
  @ViewChild('thead') thead

  public tableConfigCopy
  public isAnyFieldFilterable
  public getNgThing = getNgThing

  // Deep copy the parts of the tableConfig that will be modified when
  // sorting and searching the columns
  public copyTableConfig (tableConfig) {
    // columnDefs need to be deep copied
    let columnDefsCopy = tableConfig.columnDefs.map(colDef => {

      // sortAdvanced needs to be deep copied
      let copiedSortAdvanced = colDef.sortAdvanced
        ? Object.assign({}, colDef.sortAdvanced) : null
      let copiedColDef = Object.assign({}, colDef)
      if (copiedSortAdvanced) {
        copiedColDef.sortAdvanced = copiedSortAdvanced
      }
      return copiedColDef
    })

    let tableConfigCopy = Object.assign({}, tableConfig, {
      columnDefs: columnDefsCopy
    })
    return tableConfigCopy
  }

  public ngAfterViewChecked () {
    // update header width based on view changes
    this.setTheadClass (this.tbody, this.thead)
  }

  public setTheadClass (tbody, thead) {
    if (tbody && thead) {
      if (tbody.nativeElement.scrollHeight > tbody.nativeElement.clientHeight) {
        thead.nativeElement.className = 'with-scrollbar'
      } else {
        thead.nativeElement.className = 'without-scrollbar'
      }
    }
  }

  public ngOnChanges (changes) {

    // if there's an incoming tableConfig, replace existing tableConfigCopy
    if (changes.tableConfig) {
      this.tableConfigCopy = this.copyTableConfig(this.tableConfig)
    }

    this.isAnyFieldFilterable = this.tableConfigCopy.columnDefs.some(colDef => {
      return !!colDef.filterEnabled
    })

    // re-apply sorting when updating tableData or tableConfig
    if ((changes.tableConfig || changes.tableData) && this.tableData.length > 0) {
      let sortAdvanced = this.tableConfigCopy.columnDefs.find(colDef => {
        return !!colDef.sortAdvanced
      })

      // sortAdvanced takes precedence over sortDefault in sorting
      if (sortAdvanced) {
        // there might be multiple columns with advanced sort
        this.sortColsAdvanced(this.tableConfigCopy.columnDefs)

      // no sortAdvanced is present, look for sortDefault
      } else {
        let sortDefaultColIndex = this.tableConfigCopy.columnDefs.findIndex(colDef => {
          return !!colDef.sortDefault
        })
        if (sortDefaultColIndex !== -1) {
          let colToSort = this.tableConfigCopy.columnDefs[sortDefaultColIndex]

          // convert sortDefault to sortAdvanced to be able to simplify further
          // column sorting
          colToSort.sortAdvanced = {
            count: 1,
            direction: colToSort.sortDefault.startsWith('asc') ? 1 : -1
          }
          this.tableData = tableDataSort(colToSort.field, this.tableData, colToSort.sortAdvanced.direction)
        }
      }
    }
  }

  public activateRow (options) {
    if (options.rowIndex) {
      this.tableConfigCopy.activeRow = options.rowIndex
    }
    // TODO find based on rowData if rowIndex isn't available

    this.tableConfigUpdated.emit(this.copyTableConfig(this.tableConfigCopy))
  }

  public rowClickedFn ($event, rowData, rowIndex) {
    if (this.tableConfigCopy.clickingRowActivatesRow !== false) {
      this.tableConfigCopy.activeRow = rowIndex
    }
    this.rowClicked.emit({
      $event,
      rowData,
      rowIndex
    })
  }

  public cellItemClickedFn ($event, colSpec, rowData, rowIndex) {
    $event.stopPropagation() // don't want to trigger "rowClickedFn" as well
    this.cellItemClicked.emit({
      $event,
      columnDef: colSpec,
      rowData,
      rowIndex
    })
  }

  public filterUpdate (originalCol) {
    // The incoming col is from the original tableConfig, which we don't want
    // to modify. Find the col from the tableConfigCopy and modify that one instead
    let foundColDef = this.tableConfigCopy.columnDefs.find(colDef => {
      return colDef.field === originalCol.field
    })
    // add search term to the colDef for the field being searched
    foundColDef.filterValue = originalCol.value

    // NOTE not 100% sure why I have to do this, foundColDef should've been
    // a reference to the tableConfigCopy item?
    let updatedTableConfigCopy = this.copyTableConfig(this.tableConfigCopy)
    this.tableConfigCopy = updatedTableConfigCopy
    this.tableConfigUpdated.emit(updatedTableConfigCopy)
  }

  public sortColsAdvanced (columnDefs) {
    // go through all columns and figure out sorting order based on
    // "sortAdvanced.count". Then call "tableDataSort" in the correct order
    let columnsToApplySorting = columnDefs.filter(colDef => {
      return !!colDef.sortAdvanced
    })

    // use the count property to figure out in which order the columns were sorted
    columnsToApplySorting.sort((a, b) => {
      if (a.sortAdvanced.count < b.sortAdvanced.count) {
        return -1
      }
      if (a.sortAdvanced.count > b.sortAdvanced.count) {
        return 1
      }
      return 0
    })

    // sort all the columns with sortAdvanced, in order
    this.tableData = columnsToApplySorting.reduce((mem, curr) => {
      mem = tableDataSort(curr.field, mem, curr.sortAdvanced.direction)
      return mem
    }, this.tableData)
  }

  public colHeaderSortClicked (originalCol) {

    // The incoming col is from the original tableConfig, which we don't want
    // to modify. Find the col from the tableConfigCopy and modify that one instead
    let colInCopy = this.tableConfigCopy.columnDefs.find(colDef => {
      return originalCol.field === colDef.field
    })

    // Find the current highest sort count. Every time a column header is clicked
    // for sorting, the counter gets incremented. This can be used to recreate an
    // exact sort order based on multiple columns being sorted.
    let maxSortCount = this.tableConfigCopy.columnDefs.reduce((mem, curr) => {
      if (curr.sortAdvanced && curr.sortAdvanced.count > mem) {
        mem = curr.sortAdvanced.count
      }
      return mem
    }, 0)

    colInCopy.sortAdvanced = colInCopy.sortAdvanced || { }
    // Set the sort count to max + 1, this is the most recently pressed sort
    colInCopy.sortAdvanced.count = maxSortCount + 1

    let newDirection
    if (colInCopy.sortAdvanced.direction === 1) {
      newDirection = -1
    } else if (colInCopy.sortAdvanced.direction === -1) {
      newDirection = 0
    } else {
      // if there was no previous sorting or 0
      newDirection = 1
    }
    colInCopy.sortAdvanced.direction = newDirection

    // Update columnDef for sorted item in the tableConfigCopy
    let colDefIndexToReplace = this.tableConfigCopy.columnDefs.findIndex((colDef) => {
      return colDef.field === colInCopy.field
    })
    this.tableConfigCopy.columnDefs[colDefIndexToReplace] = colInCopy

    // reapply sorting to tableData
    this.sortColsAdvanced(this.tableConfigCopy.columnDefs)

    this.tableConfigUpdated.emit(this.copyTableConfig(this.tableConfigCopy))
  }
}
