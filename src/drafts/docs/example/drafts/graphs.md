---
sidebar_position: 1
title: Graphs

---

# Getting Started with Graphs


To create a graph, simply use the `Graph` class.

``` javascript 
    let graph = new brainsatplay.Graph();
```

Then populate the graph with nodes.
``` javascript 
    // -------------------------------------------------------------------------
    let upstreamProps = {
      tag:'upstream',
      increment:1,
      multiplier:2,
      operator:(input,self)=>{
        let output =  self.multiplier*(input + self.increment);
       console.log(`Upstream: ${self.multiplier}*(${input} + ${self.increment}) = ${output}`)        
       return output;
      }
    }

    let upstream2 = graph.add(upstreamProps);
    let downstream2 = graph.create((input,self)=>{
      const output = input+1;
      console.log(`Downstream: ${input} + ${1} = ${output}`)        
      return output;
    }); //add a tag to make it easier to find

    //subscribe a node
    let sub = upstream2.subscribeNode(downstream2);
    //upstream2.unsubscribe(sub);
    
    //subscribe a function
    let sub2 = upstream2.subscribe((output)=>{console.log('upstream output: ', output);});
    //upstream2.unsubscribe(sub2);


    upstream2.increment = 3;
    upstream2.multiplier = 10;
    upstream2.run(5); //run with an input

    // -------------------------------------------------------------------------
    let json = upstream2.print()
    let json2 = downstream2.print()
    let reconstructed1 = graph.reconstruct(json);
    let reconstructed2 = graph.reconstruct(json2);
    reconstructed1.subscribe(reconstructed2);
    reconstructed1.run(5);


    // -------------------------------------------------------------------------
    upstreamProps.tag = 'upstream3';
    let upstream3 = new Process(upstreamProps,undefined,graph);
    upstream3.run(6)


    // -------------------------------------------------------------------------

    let flow = {
      tag:'upstream2',
      increment:1,
      multiplier:2,
      operator:(input,self)=>{
        let output =  self.multiplier*(input + self.increment);
       console.log(`Upstream: ${self.multiplier}*(${input} + ${self.increment}) = ${output}`)        
       return output;
      },
      forward:true,
      children:{
        tag:'downstream2',
        operator:(input,self)=>{
          const output = input+1;
          console.log(`Downstream: ${input} + ${1} = ${output}`)        
          return output;
        }
      }
    }

    let flowNode = new Process(flow,undefined,graph);
    let res = await flowNode.run(6);

    // -------------------------------------------------------------------------
    let res2 = await graph.run('upstream2',7);
    console.log(res,res2);
```