import { PortName } from './port-name';

export class ContentPortManager {
    private _handleMessage: (msg: any) => void;
    private _port: chrome.runtime.Port | null = null;
    private _portName: PortName;

    constructor(portName: PortName, handleMessage: (msg: any) => void) {
        this._port = null;
        this._portName = portName;
        this._handleMessage = handleMessage;

        this.setupPortListener();
    }

    private setupPortListener(): void {
        chrome.runtime.onConnect.addListener((port) => {

            if (port.name !== this._portName) { return; }

            this._port = port;

            port.onMessage.addListener((msg) => {
                this._handleMessage(msg);
            });

            port.onDisconnect.addListener(() => {
                this._port = null;
            });
        });
    }

    public postMessage(msg: any): void {
        if (this._port) {
            this._port.postMessage(msg);
        }
    }
}