import { PortName } from './port-name';

interface PortUpdateMessage {
    type: 'PORT_UPDATE';
    tabId: number | null;
}

export class PortManager {

    private _currentPort: chrome.runtime.Port | null;
    private _handleMessage: (msg: any) => void;
    private _portName: PortName;
    private _isBgPort: boolean;
    private _linkedManager: PortManager | null;
    private _currentTabId: number | null;

    constructor(portName: PortName, handleMessage: (msg: any) => void) {
        this._portName = portName;
        this._currentPort = null;
        this._isBgPort = portName === 'popup-background';
        this._handleMessage = handleMessage;
        this._linkedManager = null;
        this._currentTabId = null;

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

    public getLinkedManager(): PortManager | null {
        return this._linkedManager;
    }

    public linkManager(manager: PortManager): void {
        this._linkedManager = manager;
        // // If we already have a tab connection, inform the linked manager
        // if (this._currentTabId !== null) {
        //     this.notifyLinkedManager();
        // }
    }

    // private notifyLinkedManager(): void {
    //     if (this._linkedManager && !this._isBgPort) {
    //         // Let the background port manager know about the current tab
    //         const updateMsg: PortUpdateMessage = {
    //             type: 'PORT_UPDATE',
    //             tabId: this._currentTabId
    //         };
    //         this._linkedManager.handlePortUpdate(updateMsg);
    //     }
    // }

    // public handlePortUpdate(msg: PortUpdateMessage): void {
    //     if (this._isBgPort && msg.tabId !== null) {
    //         // Background port manager should connect to the same tab
    //         this.connectToNewTab(msg.tabId);
    //     }
    // }

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

        const pn = this._isBgPort ? 'popup-content' : this._portName;
        this._currentPort = chrome.tabs.connect(tabId, { name: pn });
        this._currentTabId = tabId;

        this._currentPort.onMessage.addListener((msg) => {
            this._handleMessage(msg);
        });

        this._currentPort.onDisconnect.addListener(() => {
            this._currentPort = null;
            this._currentTabId = null;
        });

        // // Notify linked manager about the new connection
        // if (!this._isBgPort) {
        //     this.notifyLinkedManager();
        // }
    }

    public sendMessage(msg: any): void {
        if (this._currentPort === null) { return; }

        this._currentPort.postMessage(msg);
    }
}