
const MEPGRID_CONFIG = {
    requiredProps: ['name','Category',
    'VDC_WBS', 'VDC_WBS_NAME','VDC_EJES','VDC_PRECO', 'VDC_PRIMARY_UNITS','VDC_SECUNDARY_UNITS',
    'System Type',
    'VDC_LENGTH','VDC_SIZE'], 
    responsiveLayout:true,
    
    columns: [ // Definition of individual grid columns (see http://tabulator.info for more details)
        { title: 'ID', field: 'dbid',responsive:3 },
        { title: 'Name', field: 'name', width: 180,responsive:0 },
        { title: 'Category', field: 'category',responsive:0  },
        {title: 'VDC_WBS',field: 'WBS',responsive:2},
        {title: 'VDC_WBS_NAME',field: 'WBS_NAME',responsive:2},
        {title: 'VDC_EJES',field: 'EJES',responsive:2},
        {title: 'VDC_PRECO',field: 'preco',responsive:1},
        {title: 'VDC_PRIMARY_UNITS',field:'units',responsive:0},
        {title: 'VDC_SECUNDARY_UNITS',field:'s_units',responsive:0},
        {title: 'VDC_LENGTH',field:'length',responsive:1,topCalc:"sum", topCalcParams:{precision:1,}},
        {title: 'VDC_SIZE',field:'vdcsize',responsive:0,topCalc:"sum", topCalcParams:{precision:1,}},
        {title: 'System Type',field:'System-Classification',responsive:2},
        
    ],
    groupBy: 'EJES', // Optional column to group by
    createRow: (dbid, name, props) => { // Function generating grid rows based on recieved object properties

        const category = props.find(p => p.displayName === 'Category')?.displayValue;
        const WBS = props.find(p => p.displayName === 'VDC_WBS')?.displayValue;
        const WBS_NAME = props.find(p => p.displayName === 'VDC_WBS_NAME')?.displayValue;
        const EJES = props.find(p => p.displayName === 'VDC_EJES')?.displayValue;
        const units = props.find(z => z.displayName === 'VDC_PRIMARY_UNITS')?.displayValue;
        const s_units = props.find(z => z.displayName === 'VDC_SECUNDARY_UNITS')?.displayValue;
        const vdcsize = props.find(z => z.displayName === 'VDC_SIZE')?.displayValue;
        const length = props.find(z => z.displayName === 'VDC_LENGTH')?.displayValue;
        const preco = props.find(z => z.displayName === 'VDC_PRECO')?.displayValue.toString();
        const SystemType = props.find(z => z.displayName === 'System Type')?.displayValue;

        return { dbid, name,WBS,units,s_units,category,vdcsize,length,SystemType,preco,WBS_NAME, EJES};
    },
    onRowClick: (row, viewer) => {
        viewer.isolate([row.dbid]);
        viewer.fitToView([row.dbid]);
    },
    
    
};
export class MEPExtensionPanel extends Autodesk.Viewing.UI.DockingPanel{
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

    initialize(){
        this.title = this.createTitleBar(this.titleLabel || this.container.id);
        this.initializeMoveHandlers(this.title);
        this.container.appendChild(this.title);
        this.content = document.createElement('div');
        this.content.style.height = '350px';
        this.content.style.backgroundColor = 'black';
        this.content.innerHTML = `<div class="mep-container" style="position: relative; height: 350px;"></div>`;
        this.container.appendChild(this.content);
        // See http://tabulator.info
        this.table = new Tabulator('.mep-container', {
            height: '100%',
            layout: 'fitColumns',
            columns: MEPGRID_CONFIG.columns,
            groupBy: MEPGRID_CONFIG.groupBy,
            selectable:true,
            rowClick: (e, row) => MEPGRID_CONFIG.onRowClick(row.getData(), this.extension.viewer)
        });
        this.table.setFilter("preco","=",1);
        this.exportbutton = document.createElement('button');
        //this.importbutton.type ='file';
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
        console.log("data exported with success!" + data);
    }

    update(model, dbids) {
        model.getBulkProperties(dbids, { propFilter: MEPGRID_CONFIG.requiredProps }, (results) => {
            this.table.replaceData(results.map((result) => MEPGRID_CONFIG.createRow(result.dbId, result.name, result.properties)));
        }, (err) => {
            console.error(err);
        });
    
    }
}