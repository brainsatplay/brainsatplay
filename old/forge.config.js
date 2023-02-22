module.exports = {
  packagerConfig: {
    protocols: [
      {
        name: "Brains@Play",
        schemes: ["brainsatplay"]
      }
    ]
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        "mimeType": ["x-scheme-handler/brainsatplay"]
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
};