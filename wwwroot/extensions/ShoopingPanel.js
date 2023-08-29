
export class ShoopingPanel extends Autodesk.Viewing.UI.DockingPanel{
    constructor(extension,id,title,options){
        super(extension.viewer.container, id, title, options);
        this.extension = extension;
        this.container.style.left = (options.x || 0) + 'px';
        this.container.style.top = (options.y || 0) + 'px';
        this.container.style.width = (options.width || 600) + 'px';
        this.container.style.height = (options.height || 600) + 'px';
        this.container.style.resize = 'both';
        this.container.style.overflow = 'overlay';
        this.container.style.backgroundColor = 'black';
        this.chartType = options.chartType || 'bar'; // See https://www.chartjs.org/docs/latest for all the supported types of charts
        this.chart = this.createChart();
    
    }

    initialize() {
        this.title = this.createTitleBar(this.titleLabel || this.container.id);
        this.title.style.overflow = 'auto';
        this.initializeMoveHandlers(this.title);
        this.container.appendChild(this.title);
        this.content = document.createElement('div');
        // button update EXCEL
        this.importbutton = document.createElement('button');
        //this.importbutton.type ='file';
        this.importbutton.innerHTML = 'IMPORT XLSX';
        this.importbutton.style.width = (this.options.buttonWidth || 100) + 'px';
        this.importbutton.style.height = (this.options.buttonHeight || 24) + 'px';
        this.importbutton.style.margin = (this.options.margin || 5) + 'px';
        this.importbutton.style.verticalAlign = (this.options.verticalAlign || 'middle');
        this.importbutton.style.backgroundColor = (this.options.backgroundColor || 'white');
        this.importbutton.style.borderRadius = (this.options.borderRadius || 8) + 'px';
        this.importbutton.style.borderStyle = (this.options.borderStyle || 'groove');
        this.importbutton.style.color = "black";
        this.importbutton.onclick = this.importXLSX.bind(this);
        this.container.appendChild(this.importbutton);



        this.content.style.height = '350px';
        this.content.style.backgroundColor = 'white';
        this.content.innerHTML = `
            <div class="props-container" style="position: relative; height: 25px; padding: 0.5em;">
                <select class="props"></select>
            </div>
            <div class="chart-container" style="position: relative; height: 325px; padding: 0.5em;">
                <canvas class="chart"></canvas>
            </div>
        `;
        this.select = this.content.querySelector('select.props');
        this.canvas = this.content.querySelector('canvas.chart');
        this.container.appendChild(this.content);
    }
    importXLSX() {
        let input = document.createElement('input');
        input.type = 'file';
        input.onchange = _this =>{
            let files = Array.from(input.files);
            console.log(files);
        }
        input.click();
    }
    
    createChart() {
        return new Chart(this.canvas.getContext('2d'), {
            type: this.chartType,
            data: {
                labels: [],
                datasets: [{ data: [], backgroundColor: [], borderColor: [], borderWidth: 1 }],
            },
            options: { maintainAspectRatio: false }
        });
    }

    async setModel(model) {
        const propertyNames = await this.extension.findPropertyNames(model);
        this.select.innerHTML = propertyNames.map(prop => `<option value="${prop}">${prop}</option>`).join('\n');
        this.select.onchange = () => this.updateChart(model, this.select.value);
        this.updateChart(model, this.select.value);
    }

    async updateChart(model, propName) {
        const histogram = await this.extension.findPropertyValueOccurrences(model, propName);
        const propertyValues = Array.from(histogram.keys());
        this.chart.data.labels = propertyValues;
        const dataset = this.chart.data.datasets[0];
        dataset.label = propName;
        dataset.data = propertyValues.map(val => histogram.get(val).length);
        if (dataset.data.length > 0) {
            const hslaColors = dataset.data.map((val, index) => `hsla(${Math.round(index * (360 / dataset.data.length))}, 100%, 50%, 0.2)`);
            dataset.backgroundColor = dataset.borderColor = hslaColors;
        }
        this.chart.update();
        this.chart.config.options.onClick = (ev, items) => {
            if (items.length === 1) {
                const index = items[0].index;
                const dbids = histogram.get(propertyValues[index]);
            
                this.extension.viewer.isolate(dbids);
                //this.extension.viewer.setThemingColor(dbids, new THREE.Vector4(color.r,color.g,color.b,0.5));
                this.extension.viewer.fitToView(dbids);
            }
        };
    }

}