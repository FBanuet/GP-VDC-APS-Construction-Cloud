import { BaseExtension } from './BaseExtension.js';
import { ShoopingPanel } from './ShoopingPanel.js';



class ShoopingExtension extends BaseExtension{
    constructor(viewer,options){
        super(viewer,options);
        this._barraButton = null;
        this._barraPanel = null;
    }

    async load() {
        super.load();
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.5.1/chart.min.js', 'Chart');
        Chart.defaults.plugins.legend.display = false;
        console.log('Shooping Extension loaded.');
        return true;
    }

    unload() {
        super.unload();
        if (this._barraButton) {
            this.removeToolbarButton(this._barraButton);
            this._barraButton = null;
        }
        if (this._barraPanel) {
            this._barraPanel.setVisible(false);
            this._barraPanel.uninitialize();
            this._barraPanel = null;
        }
        console.log('Shooping Extension unloaded.');
        return true;
    }
    onToolbarCreated() {
        this._barraPanel = new ShoopingPanel(this, 'dashboard-barchart-panel', 'Property Histogram', { x: 15, y: 15, chartType: 'bar' });
        //this.applyColors();
        this._barraButton = this.createToolbarButton('dashboard-barchart-button', 'https://img.icons8.com/ios-filled/50/ms-excel.png', 'Visualizador Compras');
        this._barraButton.onClick = () => {
            this._barraPanel.setVisible(!this._barraPanel.isVisible());
            this._barraButton.setState(this._barraPanel.isVisible() ? Autodesk.Viewing.UI.Button.State.ACTIVE : Autodesk.Viewing.UI.Button.State.INACTIVE);
            if (this._barraPanel.isVisible() && this.viewer.model) {
                this._barraPanel.setModel(this.viewer.model);
            }
        };
        
    }


    onModelLoaded(model) {
        super.onModelLoaded(model);
        if (this._barraPanel && this._barraPanel.isVisible()) {
            this._barraPanel.setModel(model);
        }
    }


    async findPropertyValueOccurrences(model, propertyName) {
        const dbids = await this.findLeafNodes(model);
        return new Promise(function (resolve, reject) {
            model.getBulkProperties(dbids, { propFilter: [propertyName] }, function (results) {
                let histogram = new Map();
                for (const result of results) {
                    if (result.properties.length > 0) {
                        const key = result.properties[0].displayValue;
                        if (histogram.has(key)) {
                            histogram.get(key).push(result.dbId);
                        } else {
                            histogram.set(key, [result.dbId]);
                        }
                    }
                }
                resolve(histogram);
            }, reject);
        });
    }



}
Autodesk.Viewing.theExtensionManager.registerExtension('ShoopingExtension', ShoopingExtension);