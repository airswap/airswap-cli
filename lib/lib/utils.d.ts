import { ethers } from 'ethers';
export declare function displayDescription(ctx: any, title: string, network?: number): void;
export declare function getWallet(ctx: any, requireBalance?: boolean): Promise<ethers.Wallet>;
export declare function getMetadata(ctx: any, network: number): Promise<any>;
export declare function updateMetadata(ctx: any): Promise<unknown>;
export declare function handleTransaction(tx: any): void;
export declare function handleError(error: any): void;
