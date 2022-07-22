import { getFnParamInfo, Graph } from "external/graphscript/Graph";


// This graphscript extension allows operators to be triggered with their first argument
// while maintaining a history of previous values for other arguments

const ArgumentGraphExtension = {
    type: 'tree',
    condition: (treeEntry) => {
        return !(treeEntry instanceof Graph) // run on all tree entries that aren't graphs
    },
    transform: (treeEntry, app) => {
      const operatorArgs = getFnParamInfo(treeEntry.operator);
      if (treeEntry.arguments) {
        for (let key in treeEntry.arguments) {
          operatorArgs.set(key, treeEntry.arguments[key]);
        }
      }
      if (operatorArgs.size === 0)
        operatorArgs.set("trigger", void 0);



      // Find and Remove Restricted Names
      let entries = Array.from(operatorArgs.entries())
      const restrictedOne = ["self", "node"];
      const restrictedTwo = ["origin", "parent", "graph", "router"];
      const notRestrictedOne = entries.reduce((a,b) => a * (restrictedOne.includes(b[0]) ? 0 : 1), 1)
      const notRestrictedTwo = entries.reduce((a,b) => a * (restrictedTwo.includes(b[0]) ? 0 : 1), 1)

      if (!notRestrictedOne) restrictedOne.forEach(k => operatorArgs.delete(k))
      if (!notRestrictedTwo) restrictedTwo.forEach(k => operatorArgs.delete(k))

      // Create Instance Argument Tree
      const instanceTree = {};
      Array.from(operatorArgs.entries()).forEach(([arg], i) => {
        instanceTree[arg] = {
          tag: arg,
          operator: (input) => {
            operatorArgs.set(arg, input);
            if (i === 0) {
              const nodeToRun = app.router.routes[`${app.name}.${treeEntry.tag}`];
              return nodeToRun.run();
            }
            return input;
          }
        };
      });
  
      // Create Proper Global Operator for the Instance
      const propsCopy = Object.assign({}, treeEntry);
      propsCopy.operator = (self, origin, ...args) => {
  
        let updatedArgs = [];
        let i = 0;
        operatorArgs.forEach((v, k) => {
          const isSpread = k.includes("...");
          const currentArg = isSpread ? args.slice(i) : args[i];
          let update = currentArg !== void 0 ? currentArg : v;
          operatorArgs.set(k, update);
          if (!isSpread)
            update = [update];
          updatedArgs.push(...update);
          i++;
        });

  
          if (!notRestrictedOne && !notRestrictedTwo) return treeEntry.operator(self, origin, ...updatedArgs)
          else if (!notRestrictedOne) return treeEntry.operator(self, ...updatedArgs)
          else if (!notRestrictedTwo) return treeEntry.operator(origin, ...updatedArgs)
          else return treeEntry.operator(...updatedArgs)
          }

          return new Graph(instanceTree, treeEntry.tag, propsCopy)
    }
}

export default ArgumentGraphExtension