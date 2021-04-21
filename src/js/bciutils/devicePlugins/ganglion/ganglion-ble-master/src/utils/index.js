
export const renameDataProp = ({ channelData, ...sample }) => ({
    ...sample,
    data: channelData
});
