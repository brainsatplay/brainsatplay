import { AssertType } from "./types";
export declare const join: (...paths: string[]) => string;
export declare const getBase: (path: any) => any;
export declare const dynamicImport: (url: string, type?: AssertType) => Promise<any>;
export declare const importFromOrigin: (url: any, scriptLocation: any, local?: boolean, type?: AssertType) => Promise<any>;
