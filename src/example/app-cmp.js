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
var core_1 = require('angular2/core');
var co_list_view_table_cmp_1 = require('../co-list-view-table/co-list-view-table-cmp');
var example_data_1 = require('./example-data');
var AppCmp = (function () {
    function AppCmp() {
        this.myData = example_data_1.exampleData;
        this.myConfig = {
            columnDefs: [
                {
                    field: 'userId',
                    displayName: 'ID'
                },
                {
                    field: 'userName',
                    displayName: 'Name',
                    search: true
                },
                {
                    field: 'nickName',
                    displayName: 'Nickname',
                    search: true
                }
            ]
        };
        this.minimalConfig = {
            columnDefs: [
                {
                    field: 'userId'
                },
                {
                    field: 'userName'
                }
            ]
        };
    }
    AppCmp.prototype.selectedItem = function (item) {
        console.log('clicked item:', item);
    };
    AppCmp = __decorate([
        core_1.Component({
            selector: 'app',
            directives: [co_list_view_table_cmp_1.CoListViewTableCmp],
            template: "\n    <div style='height: 250px;'>\n      <co-list-view-table-cmp\n        [tableData]='myData'\n        [tableConfig]='myConfig'\n        (selected)='selectedItem($event)'>\n      </co-list-view-table-cmp>\n    </div>\n\n    <br><br>\n\n    <co-list-view-table-cmp\n      [tableData]='myData'\n      [tableConfig]='minimalConfig'\n      (selected)='selectedItem($event)'>\n    </co-list-view-table-cmp>\n  "
        }), 
        __metadata('design:paramtypes', [])
    ], AppCmp);
    return AppCmp;
}());
exports.AppCmp = AppCmp;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLWNtcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFwcC1jbXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLHFCQUF3QixlQUN4QixDQUFDLENBRHNDO0FBQ3ZDLHVDQUFpQyw4Q0FDakMsQ0FBQyxDQUQ4RTtBQUMvRSw2QkFBMEIsZ0JBRTFCLENBQUMsQ0FGeUM7QUF1QjFDO0lBQUE7UUFDUyxXQUFNLEdBQUcsMEJBQVcsQ0FBQztRQUNyQixhQUFRLEdBQUc7WUFDaEIsVUFBVSxFQUFFO2dCQUNWO29CQUNFLEtBQUssRUFBRSxRQUFRO29CQUNmLFdBQVcsRUFBRSxJQUFJO2lCQUNsQjtnQkFDRDtvQkFDRSxLQUFLLEVBQUUsVUFBVTtvQkFDakIsV0FBVyxFQUFFLE1BQU07b0JBQ25CLE1BQU0sRUFBRSxJQUFJO2lCQUNiO2dCQUNEO29CQUNFLEtBQUssRUFBRSxVQUFVO29CQUNqQixXQUFXLEVBQUUsVUFBVTtvQkFDdkIsTUFBTSxFQUFFLElBQUk7aUJBQ2I7YUFDRjtTQUNGLENBQUM7UUFFSyxrQkFBYSxHQUFHO1lBQ3JCLFVBQVUsRUFBRTtnQkFDVjtvQkFDRSxLQUFLLEVBQUUsUUFBUTtpQkFDaEI7Z0JBQ0Q7b0JBQ0UsS0FBSyxFQUFFLFVBQVU7aUJBQ2xCO2FBQ0Y7U0FDRixDQUFBO0lBSUgsQ0FBQztJQUhTLDZCQUFZLEdBQXBCLFVBQXNCLElBQUk7UUFDeEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFDcEMsQ0FBQztJQXRESDtRQUFDLGdCQUFTLENBQUM7WUFDVCxRQUFRLEVBQUUsS0FBSztZQUNmLFVBQVUsRUFBRSxDQUFDLDJDQUFrQixDQUFDO1lBQ2hDLFFBQVEsRUFBRSx5WkFnQlQ7U0FDRixDQUFDOztjQUFBO0lBbUNGLGFBQUM7QUFBRCxDQUFDLEFBbENELElBa0NDO0FBbENZLGNBQU0sU0FrQ2xCLENBQUEifQ==