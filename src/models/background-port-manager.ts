import { PortName } from "./port-name";

export class BackgroundPortManager {
    private _handleMessage: (msg: any) => void;
    private _port: chrome.runtime.Port | null = null;
    private _portName: PortName;
    private _isConnected: boolean = false;
    private _reconnectAttempts: number = 0;
    private readonly MAX_RECONNECT_ATTEMPTS = 3;

    constructor(portName: PortName, handleMessage: (msg: any) => void) {
        this._portName = portName;
        this._handleMessage = handleMessage;

        this.setupPortListener();
    }

    public postMessage(msg: any): void {
        if (!this._isConnected || !this._port) {
            console.warn('Port not connected. Message not sent:', msg);
            return;
        }

        try {
            this._port.postMessage(msg);
        } catch (error) {
            console.error('Failed to send message:', error);
            this.handleDisconnect();
        }
    }

    private handleDisconnect(): void {
        this._isConnected = false;
        this._port = null;

        if (this._reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
            this._reconnectAttempts++;
            setTimeout(() => {
                this.setupPortListener();
            }, 1000 * this._reconnectAttempts);
        }
    }

    private setupPortListener(): void {
        try {
            chrome.runtime.onConnect.addListener((port) => {
                if (port.name !== this._portName) { return; }

                this._port = port;
                this._isConnected = true;
                this._reconnectAttempts = 0;

                port.onMessage.addListener((msg) => {
                    try {
                        this._handleMessage(msg);
                    } catch (error) {
                        console.error('Error handling message:', error);
                    }
                });

                port.onDisconnect.addListener(() => {
                    this.handleDisconnect();
                });
            });
        } catch (error) {
            console.error('Error setting up port listener:', error);
            this.handleDisconnect();
        }
    }

    public isConnected(): boolean {
        return this._isConnected;
    }
}