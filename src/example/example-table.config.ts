import { TableConfigModel } from '../../index'

export const exampleTableConfig: TableConfigModel = {
  // the following three properties create a "clickable row" look
  // and highlights the most recently clicked row in the table
  tableNgClass: 'table table-striped table-hover',
  rowNgStyle: {'cursor': 'pointer'},
  rowNgClassPredicate: (rowData, rowIndex, activeRow) => {
    return rowIndex === activeRow ? ['table-active'] : ''
  },

  // definition objects for each column
  columnDefs: [
    {
      field: 'userId',
      headerText: 'ID',
      headerNgClass: 'text-muted',
      sortDefault: 'asc',
      width: '100px'
    },
    {
      field: 'pet',
      headerText: 'Pet',
      cellItem: {
        // elementType can be either 'div' or 'button'
        elementType: 'div',
        cellItemNgClassPredicate: (rowData) => {
          return rowData.pet === 'unicorn' ? 'tag tag-warning' : 'tag tag-primary'
        }
      }
    },
    {
      field: 'userName',
      headerText: 'Name',
      filterEnabled: true,
      filterPlaceholder: 'Filter name',
      cellNgStyle: { 'font-weight': 'bold' }
    },
    {
      field: 'nickName',
      headerText: 'Nickname',
      filterEnabled: true,
      filterPlaceholder: 'Filter nickname',
      cellItem: {
        elementType: 'div',
        cellItemNgStyle: { 'width': '120px' },
        cellItemNgClass: 'btn btn-sm btn-info'
      }
    },
    {
      // field isn't required when having a cellItem
      headerText: 'Link',
      headerNgStyle: { 'color': 'red' },
      cellNgStyle: { 'color': 'lightblue' },
      // See the file scss/custom-styles.scss for this class
      cellNgClass: 'div-link',
      cellItem: {
        elementType: 'div',
        staticContent: 'div styled as a link'
      }
    },
    {
      headerText: 'Last column',
      cellItem: {
        elementType: 'div',
        staticContent: 'Placeholder'
      }
    }
  ]
}
