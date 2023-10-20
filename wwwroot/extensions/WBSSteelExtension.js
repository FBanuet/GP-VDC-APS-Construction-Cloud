import { BaseExtension } from './BaseExtension.js';
import { WBSSteelPanel} from './WBSSteelPanel.js';

class WBSSteelExtension extends BaseExtension {
    constructor(viewer, options) {
        super(viewer, options);
        this._button = null;
        this._panel = null;
    }

    async load() {
        super.load();
        await Promise.all([
            this.loadScript('https://unpkg.com/tabulator-tables@4.9.3/dist/js/tabulator.min.js', 'Tabulator'),
            this.loadStylesheet('https://unpkg.com/tabulator-tables@4.9.3/dist/css/tabulator.min.css')
        ]);
        console.log('WBSSteelExtension loaded.');
        return true;
    }

    unload() {
        super.unload();
        if (this._button) {
            this.removeToolbarButton(this._button);
            this._button = null;
        }
        if (this._panel) {
            this._panel.setVisible(false);
            this._panel.uninitialize();
            this._panel = null;
        }
        console.log('WBSSteelExtension unloaded.');
        return true;
    }

    onToolbarCreated() {
        this._panel = new WBSSteelPanel(this, 'WBSSteelExtension-panel', 'GP VDC STEEL FABRICATION TAKEOFF', { x: 10, y: 10 });
        this._button = this.createToolbarButton('WBSSteelExtension-button', 'https://img.icons8.com/external-outline-black-m-oki-orlando/32/external-wbs-project-management-outline-black-m-oki-orlando.png', 'WBS Steel Takeoff');
        this._button.onClick = () => {
            this._panel.setVisible(!this._panel.isVisible());
            this._button.setState(this._panel.isVisible() ? Autodesk.Viewing.UI.Button.State.ACTIVE : Autodesk.Viewing.UI.Button.State.INACTIVE);
            if (this._panel.isVisible() && this.viewer.model) {
                this.update();
            }
        };
    }

    onModelLoaded(model) {
        super.onModelLoaded(model);
        if (this._panel && this._panel.isVisible()) {
            this.update();
        }
    }

    async update() {
        const dbids = await this.findLeafNodes(this.viewer.model);
        this._panel.update(this.viewer.model, dbids);
    }
}

Autodesk.Viewing.theExtensionManager.registerExtension('WBSSteelExtension', WBSSteelExtension);