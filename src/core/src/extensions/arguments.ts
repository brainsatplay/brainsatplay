import { Graph } from "external/graphscript/Graph";


// This graphscript extension allows operators to be triggered with their first argument
// while maintaining a history of previous values for other arguments

const ArgumentGraphExtension = {
    type: 'tree',
    condition: (treeEntry) => {
        return !(treeEntry instanceof Graph) // run on all tree entries that aren't graphs
    },
    transform: (node, app) => {

      const args = node.arguments as Map<string, any>


      // Find and Remove Restricted Names
      let entries = Array.from(args.entries())
      const restrictedOne = ["self", "node"];
      const restrictedTwo = ["origin", "parent", "graph", "router"];
      const notRestrictedOne = entries.reduce((a,b) => a * (restrictedOne.includes(b[0]) ? 0 : 1), 1)
      const notRestrictedTwo = entries.reduce((a,b) => a * (restrictedTwo.includes(b[0]) ? 0 : 1), 1)

      if (!notRestrictedOne) restrictedOne.forEach(k => args.delete(k))
      if (!notRestrictedTwo) restrictedTwo.forEach(k => args.delete(k))

      // Create Instance Argument Tree
      const instanceTree = {};
      Array.from(args.entries()).forEach(([arg], i) => {
        instanceTree[arg] = {
          tag: arg,
          operator: (input) => {
            const o = args.get(arg)
            o.state = input
            if (i === 0) {
              const nodeToRun = app.router.routes[`${app.graph.name}.${node.tag}`];
              return nodeToRun.run();
            }
            return input;
          }
        };
      });
  
      // Create Proper Global Operator for the Instance
      const propsCopy = Object.assign({}, node);
      propsCopy.operator = (self, origin, ...argsArr) => {
  
        let updatedArgs = [];
        let i = 0;
        args.forEach((o, k) => {
          const argO = args.get(k)
          const currentArg = argO.spread ? argsArr.slice(i) : argsArr[i];
          let update = currentArg !== void 0 ? currentArg : o.state;
          argO.state = update
          if (!argO.spread)
            update = [update];
          updatedArgs.push(...update);
          i++;
        });


          if (!notRestrictedOne && !notRestrictedTwo) return propsCopy.default(self, origin, ...updatedArgs)
          else if (!notRestrictedOne) return propsCopy.default(self, ...updatedArgs)
          else if (!notRestrictedTwo) return propsCopy.default(origin, ...updatedArgs)
          else return propsCopy.default(...updatedArgs)
          }

          return new Graph(instanceTree, propsCopy.tag, propsCopy)
    }
}

export default ArgumentGraphExtension