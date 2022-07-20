import { getFnParamInfo, Graph } from "external/graphscript/Graph";


// This graphscript extension allows operators to be triggered with their first argument
// while maintaining a history of previous values for other arguments

const ArgumentGraphExtension = {
    type: 'tree',
    condition: (treeEntry) => {
        return !(treeEntry instanceof Graph) // run on all tree entries that aren't graphs
    },
    transform: (treeEntry, app) => {
        const operatorArgs = getFnParamInfo(treeEntry.operator)


        if (treeEntry.arguments) {
          for (let key in treeEntry.arguments) {
            operatorArgs.set(key, treeEntry.arguments[key]);
          }
        }

        // assign default argument name (to trigger updates)
        if (operatorArgs.size === 0) operatorArgs.set('trigger', undefined);


        // Create a Nested Graph Composed of Argument
        const instanceTree = {}

        Array.from(operatorArgs.entries()).forEach(([arg], i) => {
          instanceTree[arg] = {
            tag: arg,
            operator: (input) => {
              operatorArgs.set(arg, input)
              if (i === 0) {
                const nodeToRun = app.graph.nodes.get(treeEntry.tag) // TODO: Change this to pass the main graph from graphscript
                const res = nodeToRun.run() // run main graph with updated first arg
                return res
              }
              return input
            }
          }
        })

        const propsCopy = Object.assign({}, treeEntry)
        propsCopy.operator = (...args) => {
            let updatedArgs = [];
            let i = 0;
            operatorArgs.forEach((v, k) => {
              const isSpread = k.includes("...")
              const currentArg = isSpread ? args.slice(i) : args[i];
              let update = currentArg !== undefined ? currentArg : v;
              operatorArgs.set(k, update);
              if (!isSpread)  update = [update];
              updatedArgs.push(...update);
              i++;
            });

            const res = treeEntry.operator(...updatedArgs)
            return res
        }

        let graph = new Graph(instanceTree, treeEntry.tag, propsCopy)
        return graph
    }
}

export default ArgumentGraphExtension