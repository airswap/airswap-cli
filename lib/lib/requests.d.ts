export declare function indexerCall(wallet: any, signerToken: string, senderToken: string, callback: Function): void;
export declare function peerCall(locator: string, method: string, params: any, callback: Function): void;
export declare function multiPeerCall(wallet: any, method: string, params: any, callback: Function): void;
export declare function getRequest(wallet: any, metadata: any, kind: string): Promise<{
    side: any;
    signerToken: any;
    senderToken: any;
    method: string;
    params: {
        signerToken: any;
        senderToken: any;
    };
}>;
