//This is just compiled from the chrome WebGPU tutorial from 2019


import glslangModule from 'https://unpkg.com/@webgpu/glslang@0.0.8/dist/web-devel/glslang.js';


const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();



function computeExample () {  
      
      const computeShaderCode = `#version 450

        layout(std430, set = 0, binding = 0) readonly buffer FirstMatrix {
            vec2 size;
            float numbers[];
        } firstMatrix;

        layout(std430, set = 0, binding = 1) readonly buffer SecondMatrix {
            vec2 size;
            float numbers[];
        } secondMatrix;

        layout(std430, set = 0, binding = 2) buffer ResultMatrix {
            vec2 size;
            float numbers[];
        } resultMatrix;

        void main() {
            resultMatrix.size = vec2(firstMatrix.size.x, secondMatrix.size.y);

            ivec2 resultCell = ivec2(gl_GlobalInvocationID.x, gl_GlobalInvocationID.y);
            float result = 0.0;
            for (int i = 0; i < firstMatrix.size.y; i++) {
            int a = i + resultCell.x * int(firstMatrix.size.y);
            int b = resultCell.y + i * int(secondMatrix.size.y);
            result += firstMatrix.numbers[a] * secondMatrix.numbers[b];
            }

            int index = resultCell.y + resultCell.x * int(secondMatrix.size.y);
            resultMatrix.numbers[index] = result;
        }
        `;

        const glslang = await glslangModule();

        const computePipeline = device.createComputePipeline({
        computeStage: {
            module: device.createShaderModule({
            code: glslang.compileGLSL(computeShaderCode, "compute")
            }),
            entryPoint: "main"
        }
        });

        const bindGroup = device.createBindGroup({
            layout: computePipeline.getBindGroupLayout(0 /* index */),
            entries: [
              {
                binding: 0,
                resource: {
                  buffer: gpuBufferFirstMatrix
                }
              },
              {
                binding: 1,
                resource: {
                  buffer: gpuBufferSecondMatrix
                }
              },
              {
                binding: 2,
                resource: {
                  buffer: resultMatrixBuffer
                }
              }
            ]
          });
    


        const commandEncoder = device.createCommandEncoder();

        const passEncoder = commandEncoder.beginComputePass();
        passEncoder.setPipeline(computePipeline);
        passEncoder.setBindGroup(0, bindGroup);
        passEncoder.dispatch(firstMatrix[0] /* x */, secondMatrix[1] /* y */);
        passEncoder.endPass();

        // Get a GPU buffer for reading in an unmapped state.
        const gpuReadBuffer = device.createBuffer({
            size: resultMatrixBufferSize,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
        });
        
        // Encode commands for copying buffer to buffer.
        commandEncoder.copyBufferToBuffer(
            resultMatrixBuffer /* source buffer */,
            0 /* source offset */,
            gpuReadBuffer /* destination buffer */,
            0 /* destination offset */,
            resultMatrixBufferSize /* size */
        );
        
        // Submit GPU commands.
        const gpuCommands = commandEncoder.finish();
        device.defaultQueue.submit([gpuCommands]);


        // Read buffer.
        await gpuReadBuffer.mapAsync(GPUMapMode.READ);
        const arrayBuffer = gpuReadBuffer.getMappedRange();
        console.log(new Float32Array(arrayBuffer));


    }



    function simpleComputeExample() {
        // Get a GPU buffer in a mapped state and an arrayBuffer for writing.
        const gpuBuffer = device.createBuffer({
            mappedAtCreation: true,
            size: 4,
            usage: GPUBufferUsage.MAP_WRITE
        });
        const arrayBuffer = gpuBuffer.getMappedRange();
    
        // Write bytes to buffer.
        new Uint8Array(arrayBuffer).set([0, 1, 2, 3]);
    
        // Get a GPU buffer in a mapped state and an arrayBuffer for writing.
        const gpuWriteBuffer = device.createBuffer({
            mappedAtCreation: true,
            size: 4,
            usage: GPUBufferUsage.MAP_WRITE | GPUBufferUsage.COPY_SRC
        });
        const arrayBuffer = gpuWriteBuffer.getMappedRange();
    
        // Write bytes to buffer.
        new Uint8Array(arrayBuffer).set([0, 1, 2, 3]);
    
        // Unmap buffer so that it can be used later for copy.
        gpuWriteBuffer.unmap();
    
        // Get a GPU buffer for reading in an unmapped state.
        const gpuReadBuffer = device.createBuffer({
        size: 4,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
        });
    
        // Encode commands for copying buffer to buffer.
        const copyEncoder = device.createCommandEncoder();
        copyEncoder.copyBufferToBuffer(
        gpuWriteBuffer /* source buffer */,
        0 /* source offset */,
        gpuReadBuffer /* destination buffer */,
        0 /* destination offset */,
        4 /* size */
        );
    
        // Submit copy commands.
        const copyCommands = copyEncoder.finish();
        device.defaultQueue.submit([copyCommands]);
    
        // Read buffer.
        await gpuReadBuffer.mapAsync(GPUMapMode.READ);
        const copyArrayBuffer = gpuReadBuffer.getMappedRange();
        console.log(new Uint8Array(copyArrayBuffer));
    
    }