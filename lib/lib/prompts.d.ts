export declare function promptSide(): Promise<any>;
export declare function promptToken(metadata: any, signerTokenLabel?: string): Promise<any>;
export declare function promptTokens(metadata: any, firstLabel?: string, secondLabel?: string): Promise<{
    first: any;
    second: any;
}>;
export declare function printOrder(ctx: any, side: string, signerToken: any, senderToken: any, locator: string, order: any): Promise<void>;
export declare function getData(metadata: any, params: any): string[][];
export declare function printObject(ctx: any, metadata: any, title: string, params: any): Promise<void>;
export declare function printTable(ctx: any, title: string, data: Array<any>, config: object): void;
export declare function confirmTransaction(ctx: any, metadata: any, name: String, params: any): Promise<boolean>;
