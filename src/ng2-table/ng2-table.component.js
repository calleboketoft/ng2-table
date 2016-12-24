"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var sorter_service_1 = require("./sorter.service");
var Ng2TableComponent = (function () {
    function Ng2TableComponent() {
        this.rowClicked = new core_1.EventEmitter();
        this.cellItemClicked = new core_1.EventEmitter();
        this.tableConfigUpdated = new core_1.EventEmitter();
        this.rowClickStyles = false;
    }
    Ng2TableComponent.prototype.copyTableConfig = function (tableConfig) {
        // columnDefs need to be deep copied
        var columnDefsCopy = tableConfig.columnDefs.map(function (colDef) {
            // sortAdvanced needs to be deep copied
            var copiedSortAdvanced = colDef.sortAdvanced
                ? Object.assign({}, colDef.sortAdvanced) : null;
            var copiedColDef = Object.assign({}, colDef);
            if (copiedSortAdvanced) {
                copiedColDef.sortAdvanced = copiedSortAdvanced;
            }
            return copiedColDef;
        });
        var tableConfigCopy = Object.assign({}, tableConfig, {
            columnDefs: columnDefsCopy
        });
        return tableConfigCopy;
    };
    Ng2TableComponent.prototype.ngOnChanges = function (changes) {
        // add search terms etc to this one
        // the only problem would be if we want to send in a new tableConfig
        // via the @Input() since we're now working with a copy
        this.tableConfigCopy = this.copyTableConfig(this.tableConfig);
        this.isAnyFieldSearchable = this.tableConfigCopy.columnDefs.some(function (colDef) {
            return !!colDef.search;
        });
        // re-apply sorting when updating data in table
        if (changes.tableData.currentValue.length > 0) {
            var sortAdvanced = this.tableConfigCopy.columnDefs.find(function (colDef) {
                return !!colDef.sortAdvanced;
            });
            // sortAdvanced takes precedence in sorting
            if (sortAdvanced) {
                // there might be multiple columns with advanced sort
                this.sortColsAdvanced(this.tableConfigCopy.columnDefs);
            }
            else {
                var basicSortColIndex = this.tableConfigCopy.columnDefs.findIndex(function (colDef) {
                    return colDef.sortDefault || colDef.sortDefaultReverse;
                });
                if (basicSortColIndex !== -1) {
                    var colToSort = this.tableConfigCopy.columnDefs[basicSortColIndex];
                    colToSort.sortAdvanced = {
                        count: 1,
                        // convert the basic sort to the opposite sorting direction of the
                        // default sort since the colHeaderSortClicked reverses the direction by default
                        direction: colToSort.sortDefault ? 1 : -1
                    };
                    this.tableData = sorter_service_1.tableDataSort(colToSort.field, this.tableData, colToSort.sortAdvanced.direction);
                }
            }
        }
    };
    Ng2TableComponent.prototype.selectRow = function (dataRow, rowIndex) {
        this.activeRow = rowIndex;
        this.rowClicked.emit(dataRow);
    };
    // Custom button clicked
    Ng2TableComponent.prototype.buttonFn = function ($event, colSpec, row) {
        $event.stopPropagation(); // don't want to trigger "selectRow" as well
        this.cellItemClicked.emit({ colSpec: colSpec, row: row });
    };
    Ng2TableComponent.prototype.searchUpdate = function ($event) {
        var foundColDef = this.tableConfigCopy.columnDefs.find(function (colDef) {
            return colDef.field === $event.field;
        });
        // Add search term to the colDef for the field being searched
        foundColDef.searchTerm = $event.value;
        // NOTE not 100% sure why I have to do this
        var updatedTableConfigCopy = this.copyTableConfig(this.tableConfigCopy);
        this.tableConfigCopy = updatedTableConfigCopy;
        this.tableConfigUpdated.emit(updatedTableConfigCopy);
    };
    Ng2TableComponent.prototype.sortColsAdvanced = function (columnDefs) {
        // go through all columns and figure out sorting order based on
        // "sortAdvanced.count". Then call "tableDataSort" in the correct order
        var columnsToApplySorting = columnDefs.filter(function (colDef) {
            return !!colDef.sortAdvanced;
        });
        columnsToApplySorting.sort(function (a, b) {
            if (a.sortAdvanced.count < b.sortAdvanced.count) {
                return -1;
            }
            if (a.sortAdvanced.count > b.sortAdvanced.count) {
                return 1;
            }
            // a must be equal to b
            return 0;
        });
        // sort all the columns with sortAdvanced, in order
        this.tableData = columnsToApplySorting.reduce(function (mem, curr) {
            mem = sorter_service_1.tableDataSort(curr.field, mem, curr.sortAdvanced.direction);
            return mem;
        }, this.tableData);
    };
    Ng2TableComponent.prototype.colHeaderSortClicked = function (col) {
        // The incoming col is from the original tableConfig, which we don't want
        // to modify. Find the col from the tableConfigCopy and modify that one instead
        var colInCopy = this.tableConfigCopy.columnDefs.find(function (colDef) {
            return col.field === colDef.field;
        });
        // Find the current highest sort count. Every time a column header is clicked
        // for sorting, the counter gets increased. This can be used to create an
        // exact sort order based on multiple columns being sorted.
        var maxSortCount = this.tableConfigCopy.columnDefs.reduce(function (mem, curr) {
            if (curr.sortAdvanced && curr.sortAdvanced.count > mem) {
                mem = curr.sortAdvanced.count;
            }
            return mem;
        }, 0);
        colInCopy.sortAdvanced = colInCopy.sortAdvanced || {};
        // Set the sort count to max + 1, this is the most recently pressed sort
        colInCopy.sortAdvanced.count = maxSortCount + 1;
        // if the column sort has been pressed already, switch direction
        colInCopy.sortAdvanced.direction = colInCopy.sortAdvanced.direction ? -colInCopy.sortAdvanced.direction : 1;
        // Update columnDef for sorted item
        var colDefIndexToReplace = this.tableConfigCopy.columnDefs.findIndex(function (colDef) {
            return colDef.field === colInCopy.field;
        });
        this.tableConfigCopy.columnDefs[colDefIndexToReplace] = colInCopy;
        this.tableData = sorter_service_1.tableDataSort(colInCopy.field, this.tableData, colInCopy.sortAdvanced.direction);
        this.tableConfigUpdated.emit(this.copyTableConfig(this.tableConfigCopy));
    };
    Ng2TableComponent.prototype.getNgThing = function (thingType, classOrStyle, tableConfig, rowData, rowIndex, activeRow, col) {
        switch (thingType + '-' + classOrStyle) {
            case 'table-class':
                return tableConfig['tableNgClass'] || 'table table-striped';
            case 'table-style':
                return tableConfig['tableNgStyle'] || '';
            case 'row-class':
                if (tableConfig['rowNgClassPredicate']) {
                    return tableConfig['rowNgClassPredicate'](rowData, rowIndex, activeRow);
                }
                return tableConfig['rowNgClass'] || '';
            case 'row-style':
                if (tableConfig['rowNgStylePredicate']) {
                    return tableConfig['rowNgStylePredicate'](rowData, rowIndex, activeRow);
                }
                return tableConfig['rowNgStyle'] || '';
            case 'cell-class':
                if (col['cellNgClassPredicate']) {
                    return col['cellNgClassPredicate'](rowData, rowIndex, activeRow);
                }
                return col['cellNgClass'] || '';
            case 'cell-style':
                if (col['cellNgStylePredicate']) {
                    return col['cellNgStylePredicate'](rowData, rowIndex, activeRow);
                }
                return col['cellNgStyle'] || '';
            case 'cellItemButton-class':
                if (col['cellItem']['cellItemNgClassPredicate']) {
                    return col['cellItem']['cellItemNgClassPredicate'](rowData, rowIndex, activeRow);
                }
                return col['cellItem']['cellItemNgClass'] || '';
            case 'cellItemButton-style':
                if (col['cellItem']['cellItemNgStylePredicate']) {
                    return col['cellItem']['cellItemNgStylePredicate'](rowData, rowIndex, activeRow);
                }
                return col['cellItem']['cellItemNgStyle'] || '';
            case 'cellItemDiv-class':
                if (col['cellItem']['cellItemNgClassPredicate']) {
                    return col['cellItem']['cellItemNgClassPredicate'](rowData, rowIndex, activeRow);
                }
                return col['cellItem']['cellItemNgClass'] || '';
            case 'cellItemDiv-style':
                if (col['cellItem']['cellItemNgStylePredicate']) {
                    return col['cellItem']['cellItemNgStylePredicate'](rowData, rowIndex, activeRow);
                }
                return col['cellItem']['cellItemNgStyle'] || '';
            case 'header-class':
                return col['headerNgClass'] || '';
            case 'header-style':
                return col['headerNgStyle'] || '';
        }
    };
    return Ng2TableComponent;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", Array)
], Ng2TableComponent.prototype, "tableData", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], Ng2TableComponent.prototype, "tableConfig", void 0);
__decorate([
    core_1.Output(),
    __metadata("design:type", Object)
], Ng2TableComponent.prototype, "rowClicked", void 0);
__decorate([
    core_1.Output(),
    __metadata("design:type", Object)
], Ng2TableComponent.prototype, "cellItemClicked", void 0);
__decorate([
    core_1.Output(),
    __metadata("design:type", Object)
], Ng2TableComponent.prototype, "tableConfigUpdated", void 0);
Ng2TableComponent = __decorate([
    core_1.Component({
        selector: 'ng2-table',
        styles: ["\n    /**\n     * Scrollable tbody\n     * https://jsfiddle.net/tsayen/xuvsncr2/28/\n     * http://stackoverflow.com/questions/17067294/html-table-with-100-width-with-vertical-scroll-inside-tbody\n     */\n\n    table {\n      display: flex;\n      flex-flow: column;\n      height: 100%;\n      width: 100%;\n    }\n    table thead {\n      /* head takes the height it requires,\n      and it's not scaled when table is resized */\n      flex: 0 0 auto;\n      width: calc(100% - 0.9em);\n    }\n    table tbody {\n      /* body takes all the remaining available space */\n      flex: 1 1 auto;\n      display: block;\n      overflow: auto;\n    }\n    table tbody tr {\n      width: 100%;\n    }\n    table thead, table tbody tr {\n      display: table;\n      table-layout: fixed;\n    }\n\n    /**\n     * Appearance\n     */\n\n    th span:hover {\n      cursor: pointer;\n    }\n    .table thead th {\n      vertical-align: top;\n      border-bottom: 1px solid #eceeef;\n    }\n    .search-wrap {\n      margin-top: 8px;\n    }\n\n    /**\n     * Preserve newlines\n     * http://stackoverflow.com/questions/10937218/how-to-show-multiline-text-in-a-table-cell\n     *\n     * And let word-wrap still work\n     * http://stackoverflow.com/a/4413129\n     */\n    td > div > .cell-content {\n      white-space: pre-wrap;\n    }\n  "],
        template: "\n    <table\n      [ngClass]=\"getNgThing('table', 'class', tableConfig)\"\n      [ngStyle]=\"getNgThing('table', 'style', tableConfig)\">\n      <thead>\n        <tr>\n          <!-- must render from tableConfig so the table don't re-render all the\n               time when tableConfigCopy is updated -->\n          <th *ngFor=\"let col of tableConfig.columnDefs\"\n            [style.width]=\"col.width\"\n            [ngClass]=\"getNgThing('header', 'class', tableConfig, null, null, null, col)\"\n            [ngStyle]=\"getNgThing('header', 'style', tableConfig, null, null, null, col)\">\n            <span (click)=\"colHeaderSortClicked(col)\">\n              {{col.headerText || col.field}}\n            </span>\n            <div *ngIf=\"isAnyFieldSearchable\" class=\"search-wrap\">\n              <search-input-cmp\n                *ngIf=\"col.search\"\n                [field]=\"col.field\"\n                (search)=\"searchUpdate($event)\">\n              </search-input-cmp>\n            </div>\n          </th>\n        </tr>\n      </thead>\n      <tbody>\n        <tr\n          *ngFor=\"let rowData of tableData | search: tableConfigCopy; let rowIndex = index; let activeRowz = activeRow\"\n          [ngClass]=\"getNgThing('row', 'class', tableConfig, rowData, rowIndex, activeRow)\"\n          [ngStyle]=\"getNgThing('row', 'style', tableConfig, rowData, rowIndex, activeRow)\"\n          (click)=\"selectRow(rowData, rowIndex)\">\n          <td *ngFor=\"let col of tableConfig.columnDefs\" [style.width]=\"col.width\">\n            <div [ngSwitch]=\"col.cellItem?.elementType\">\n\n              <!-- BUTTON -->\n              <div *ngSwitchCase=\"'button'\">\n                <div\n                  [ngClass]=\"getNgThing('cell', 'class', tableConfig, rowData, rowIndex, activeRow, col)\"\n                  [ngStyle]=\"getNgThing('cell', 'style', tableConfig, rowData, rowIndex, activeRow, col)\">\n                  <button type=\"button\"\n                    [ngClass]=\"getNgThing('cellItemButton', 'class', tableConfig, rowData, rowIndex, activeRow, col)\"\n                    [ngStyle]=\"getNgThing('cellItemButton', 'style', tableConfig, rowData, rowIndex, activeRow, col)\"\n                    (click)=\"buttonFn($event, col, rowData)\"\n                    >{{col.cellItem?.staticContent || rowData[col.field]}}</button>\n                </div>\n              </div>\n\n              <!-- DIV -->\n              <div *ngSwitchCase=\"'div'\">\n                <div\n                  [ngClass]=\"getNgThing('cell', 'class', tableConfig, rowData, rowIndex, activeRow, col)\"\n                  [ngStyle]=\"getNgThing('cell', 'style', tableConfig, rowData, rowIndex, activeRow, col)\">\n                  <div\n                    [ngClass]=\"getNgThing('cellItemDiv', 'class', tableConfig, rowData, rowIndex, activeRow, col)\"\n                    [ngStyle]=\"getNgThing('cellItemDiv', 'style', tableConfig, rowData, rowIndex, activeRow, col)\"\n                    (click)=\"buttonFn($event, col, rowData)\"\n                    >{{col.cellItem?.staticContent || rowData[col.field]}}</div>\n                </div>\n              </div>\n\n              <!-- NO ITEM -->\n              <div *ngSwitchDefault class=\"cell-content\"\n                  [ngClass]=\"getNgThing('cell', 'class', tableConfig, rowData, rowIndex, activeRow, col)\"\n                  [ngStyle]=\"getNgThing('cell', 'style', tableConfig, rowData, rowIndex, activeRow, col)\"\n                >{{rowData[col.field]}}</div>\n            </div>\n          </td>\n        </tr>\n      </tbody>\n    </table>\n  "
    }),
    __metadata("design:paramtypes", [])
], Ng2TableComponent);
exports.Ng2TableComponent = Ng2TableComponent;
//# sourceMappingURL=ng2-table.component.js.map