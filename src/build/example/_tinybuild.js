import { packager, defaultServer } from "../tinybuild.js";

// let config = {
//     bundler:{
//         entryPoints: ['app.js'],
//         outfile: 'dist/app',
//         bundleBrowser: true, //plain js format
//         bundleESM: false, //.esm format
//         bundleTypes: false, //entry point should be a ts or jsx (or other typescript) file
//         bundleHTML: true  //wrap the first entry point file as a plain js script in a boilerplate html file, frontend scripts can be run standalone like a .exe!
//       },
//     server:defaultServer
// }

// //bundle and serve
// packager(config);