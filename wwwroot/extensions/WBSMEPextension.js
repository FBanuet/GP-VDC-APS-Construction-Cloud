import { BaseExtension} from './BaseExtension.js';
import { WBSMEPpanel} from './WBSMEPpanel.js';


class WBSMEPextension extends BaseExtension{
    constructor(viewer,options){
        super(viewer,options);
        this._button = null;
        this._panel = null;
    }

    async load() {
        super.load();
        await Promise.all([
            this.loadScript('https://unpkg.com/tabulator-tables@4.9.3/dist/js/tabulator.min.js', 'Tabulator'),
            this.loadStylesheet('https://unpkg.com/tabulator-tables@4.9.3/dist/css/tabulator.min.css')
        ]);
        console.log('WBS MEP Takeoff Extension loaded.');
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
        console.log('WBS MEP TakeOff Extension unloaded.');
        return true;
    }

    createToolbarButton(buttonId, buttonIconUrl, buttonTooltip) {
        let group = this.viewer.toolbar.getControl('VDC-CONSTRUCTION');
        if (!group) {
            group = new Autodesk.Viewing.UI.ControlGroup('VDC-CONSTRUCTION');
            this.viewer.toolbar.addControl(group);
            //group.style.y.
        }
        const button = new Autodesk.Viewing.UI.Button(buttonId);
        button.setToolTip(buttonTooltip);
        group.addControl(button);
        const icon = button.container.querySelector('.adsk-button-icon');
        if (icon) {
            icon.style.backgroundImage = `url(${buttonIconUrl})`; 
            icon.style.backgroundSize = `24px`; 
            icon.style.backgroundRepeat = `no-repeat`; 
            icon.style.backgroundPosition = `center`; 
        }
        return button;
    }

    onToolbarCreated() {
        this._panel = new WBSMEPpanel(this, 'WBS MEP Takeoff-datagrid-panel', 'GP VDC WBS MEP TAKEOFF', { x: 10, y: 10 });
        this._button = this.createToolbarButton('WBS MEP Takeoff-datagrid-button', 'https://img.icons8.com/external-outline-black-m-oki-orlando/32/external-wbs-project-management-outline-black-m-oki-orlando.png', 'Basic WBS MEP Takeoff');
        
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

Autodesk.Viewing.theExtensionManager.registerExtension('WBSMEPextension', WBSMEPextension);