import { PortName } from './port-name';

export class PortManager {

    private _currentPort: chrome.runtime.Port | null;
    private _handleMessage: (msg: any) => void;
    private _portName: PortName;
    private _isBgPort: boolean;

    constructor(portName: PortName, handleMessage: (msg: any) => void) {
        this._portName = portName;
        this._currentPort = null;
        this._isBgPort = portName === 'popup-background';
        this._handleMessage = handleMessage;

        if (this._isBgPort) {
            this.connectToBackground();
        }
        else {
            this.setupTabChangeListener();
        }
    }

    public currentPort(): chrome.runtime.Port | null {
        return this._currentPort;
    }

    private connectToBackground(): void {
        if (this._currentPort) {
            this._currentPort.disconnect();
        }

        this._currentPort = chrome.runtime.connect({ name: this._portName });

        this._currentPort.onMessage.addListener((msg) => {
            this._handleMessage(msg);
        });

        this._currentPort.onDisconnect.addListener(() => {
            this._currentPort = null;
            // Attempt to reconnect to background
            setTimeout(() => this.connectToBackground(), 1000);
        });
    }

    public setupTabChangeListener(): void {
        chrome.tabs.onActivated.addListener((activeInfo) => {
            this.connectToNewTab(activeInfo.tabId);
        });

        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete') {
                this.connectToNewTab(tabId);
            }
        });

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length) {
                this.connectToNewTab(tabs[0].id!);
            }
        });
    }

    public connectToNewTab(tabId: number): void {

        if (this._currentPort) {
            this._currentPort.disconnect();
        }

        this._currentPort = chrome.tabs.connect(tabId, { name: this._portName });

        this._currentPort.onMessage.addListener((msg) => {
            this._handleMessage(msg);
        });

        this._currentPort.onDisconnect.addListener(() => {
            this._currentPort = null;
        });
    }

    public sendMessage(msg: any): void {

        if (this._currentPort === null) { return; }

        this._currentPort.postMessage(msg);
    }
}