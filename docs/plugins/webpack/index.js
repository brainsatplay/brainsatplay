// eslint-disable-next-line
module.exports = function (context, options) {
    return {
      name: 'webpack-plugin',
      // eslint-disable-next-line
      configureWebpack(config, isServer, utils) {
        return {
          externals: {
           "node:buffer": "{}",
           "node:fs": "{}",
           "node:https": "{}",
           "node:http": "{}",
           "node:net": "{}",
           "node:path": "{}",
           "node:process": "{}",
           "node:stream/web": "{}",
           "node:stream": "{}",
           "node:url": "{}",
           "node:util": "{}",
           "node:zlib": "{}",

          },
          resolve: {
            fallback: {
              buffer: false,
              fs: false,
              http: false,
              https: false,
              os: false,
              util: false,
              path:false,
              crypto:false,
              stream: false,
              zlib:false,
              dns:false,
              tls:false,
              dgram:false,
              net:false,
              child_process:false,
            },
          },
        };
      },
    };
  };