
export const brainflow = (plugin, data) => {
    plugin.info.eegChannelTags.forEach((o,i) => {
        let coord = plugin.atlas.getEEGDataByChannel(o.ch);
        let currentData = data.raw[i]

        coord.raw.push(...currentData)
        coord.times.push(...data.times);

        if(plugin.info.useFilters === true) {                
            let latestFiltered = new Array(currentData.length).fill(0);
            if(plugin.filters[o.ch] !== undefined) {
                currentData.forEach((sample,k) => { 
                    latestFiltered[k] = plugin.filters[o.ch].apply(sample); 
                });
            }
            coord.filtered.push(...latestFiltered);
        }
    })
}