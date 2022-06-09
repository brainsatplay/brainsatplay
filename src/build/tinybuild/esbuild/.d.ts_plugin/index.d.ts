import { Plugin, LogLevel } from 'esbuild';

declare function getTSConfig(forcepath?: string, conf?: string, wd?: string): {
    loc: string;
    conf: any;
};
interface DTSPluginOpts {
    outDir?: string;
    tsconfig?: string;
}

declare const dtsPlugin: (opts?: DTSPluginOpts) => Plugin;

declare function getLogLevel(level?: LogLevel): LogLevel[];
declare function humanFileSize(size: number): string;

declare const util: {
    humanFileSize: typeof humanFileSize;
    getLogLevel: typeof getLogLevel;
    getTSConfig: typeof getTSConfig;
};

export { dtsPlugin, util };
