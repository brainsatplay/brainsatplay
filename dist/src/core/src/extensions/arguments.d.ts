import { Graph } from "external/graphscript/Graph";
declare const ArgumentGraphExtension: {
    type: string;
    condition: (treeEntry: any) => boolean;
    transform: (treeEntry: any, app: any) => Graph;
};
export default ArgumentGraphExtension;
