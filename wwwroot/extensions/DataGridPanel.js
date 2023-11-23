const DATAGRID_CONFIG = {
    requiredProps: ['name','Category','VDC_M/PUL','VDC_PRECO','Comments','VDC_IMCA','VDC_AISC','VDC_LENGTH','VDC_WEIGHT','VDC_COST'], // Which properties should be requested for each object
    responsiveLayout:true,
    
    columns: [ // Definition of individual grid columns (see http://tabulator.info for more details)
        {title: 'ID', field: 'dbid',responsive:3 },
        {title: 'Comments', field: 'partida', width: 180,responsive:0 },
        {title: 'Name', field: 'name', width: 180,responsive:0 },
        {title: 'Category', field: 'category',responsive:0  },
        {title: 'VDC_M/PUL',field: 'MassDensity',responsive:2},
        {title: 'VDC_PRECO',field: 'preco',responsive:1},
        {title: 'VDC_IMCA',field:'imca',responsive:0},
        {title: 'VDC_AISC',field:'section',responsive:2},
        {title: 'VDC_LENGTH',field:'Length',responsive:0,topCalc:"sum", topCalcParams:{precision:1,}},
        {title: 'VDC_WEIGHT',field: 'weight',responsive:0 ,topCalc:"sum", topCalcParams:{precision:1,}},
        {title: 'VDC_COST',field: 'cost',responsive:0 ,topCalc:"sum", topCalcParams:{precision:1,}},

        
    ],
    groupBy: 'partida', // Optional column to group by

    createRow: (dbid, name, props) => { // Function generating grid rows based on recieved object properties
        const category = props.find(p => p.displayName === 'Category')?.displayValue;
        const MassDensity = props.find(p => p.displayName === 'VDC_M/PUL')?.displayValue;
        const preco = props.find(z => z.displayName === 'VDC_PRECO')?.displayValue.toString();
        const imca = props.find(z => z.displayName === 'VDC_IMCA')?.displayValue;
        const section = props.find(c => c.displayName === 'VDC_AISC')?.displayValue;
        const Length = props.find(a => a.displayName === 'VDC_LENGTH')?.displayValue;
        const weight = props.find(y => y.displayName === 'VDC_WEIGHT')?.displayValue;
        const partida = props.find(x => x.displayName === 'Comments')?.displayValue;
        const cost = props.find(x => x.displayName === 'VDC_COST')?.displayValue;
        return { dbid, name,MassDensity,preco,imca,section,Length,weight,category,partida,cost};
    },
    onRowClick: (row, viewer) => {
        viewer.isolate([row.dbid]);
        viewer.fitToView([row.dbid]);
        
    },
    
    
};

export class DataGridPanel extends Autodesk.Viewing.UI.DockingPanel {
    constructor(extension, id, title, options) {
        super(extension.viewer.container, id, title, options);
        this.extension = extension;
        this.container.style.left = (options.x || 0) + 'px';
        this.container.style.top = (options.y || 0) + 'px';
        this.container.style.width = (options.width || 500) + 'px';
        this.container.style.height = (options.height || 400) + 'px';
        this.container.style.resize = 'both';
        this.container.style.overflow = 'overlay';
    }

    initialize() {
        this.title = this.createTitleBar(this.titleLabel || this.container.id);
        this.initializeMoveHandlers(this.title);
        this.container.appendChild(this.title);
        this.content = document.createElement('div');
        this.content.style.height = '350px';
        this.content.style.backgroundColor = 'black';
        this.content.innerHTML = `<div class="datagrid-container" style="position: relative; height: 350px;"></div>`;
        this.container.appendChild(this.content);
        // See http://tabulator.info
        this.table = new Tabulator('.datagrid-container', {
            
            movableColumns : true,
            selectable:true,
            maxHeight: '100%',
            minHeight:300,
            layout: 'fitColumns',
            responsiveLayout:"collapse",
            pagination:true,
            paginationSize:3,
            paginationInitialPage:1,
            paginationButtonCount:3,
            paginationCounter:"rows",
            columns: DATAGRID_CONFIG.columns,
            groupBy: DATAGRID_CONFIG.groupBy,
            rowClick: (e, row) => DATAGRID_CONFIG.onRowClick(row.getData(), this.extension.viewer)
        });
        this.table.setFilter("preco","=",1);
        
        this.Selectallbutton = document.createElement('button');
        this.Selectallbutton.innerHTML = 'Select All';


        this.exportbutton = document.createElement('button');
        this.exportbutton.innerHTML = 'EXPORT XLSX';
        this.exportbutton.style.width = (this.options.buttonWidth || 100) + 'px';
        this.exportbutton.style.height = (this.options.buttonHeight || 24) + 'px';
        this.exportbutton.style.margin = (this.options.margin || 5) + 'px';
        this.exportbutton.style.verticalAlign = (this.options.verticalAlign || 'middle');
        this.exportbutton.style.backgroundColor = (this.options.backgroundColor || 'white');
        this.exportbutton.style.borderRadius = (this.options.borderRadius || 8) + 'px';
        this.exportbutton.style.borderStyle = (this.options.borderStyle || 'groove');
        this.exportbutton.style.color = "black";

        this.exportbutton.onclick = this.exportExcel.bind(this);
        this.container.appendChild(this.exportbutton);
        
    }
    

    exportExcel(){
        let data = this.table.download("xlsx","data.xlsx",{sheetName: "MyData"});
        console.log("data exported with success!");
    }

    update(model, dbids) {
        model.getBulkProperties(dbids, { propFilter: DATAGRID_CONFIG.requiredProps }, (results) => {
            this.table.replaceData(results.map((result) => DATAGRID_CONFIG.createRow(result.dbId, result.name, result.properties)));
        }, (err) => {
            console.error(err);
        });
    }

    
}