//Templates for select menus. 

export const addChannelOptions = (selectId, channelTags=[], taggedOnly=true, additionalOptions=[]) => {
    var select = document.getElementById(selectId);
    select.innerHTML = "";
    var opts = ``;
    channelTags.forEach((row,i) => {
    if(taggedOnly === true){
        if(row.tag !== null && row.tag !== 'other') {
            if(i === 0) {
                opts += `<option value='`+row.ch+`' selected='selected'>`+row.tag+`</option>`
              }
              else {
                opts += `<option value='`+row.ch+`'>`+row.tag+`</option>`
              }
        }
    }
    else{
        if(row.tag !== null && row.tag !== 'other') {
            if(i === 0) {
                opts += `<option value='`+row.ch+`' selected='selected'>`+row.tag+`</option>`
            }
            else {
                opts += `<option value='`+row.ch+`'>`+row.tag+`</option>`
            }
        }
        else {
            if(i === 0) {
                opts += `<option value='`+row.ch+`' selected='selected'>`+row.ch+`</option>`
            }
            else {
                opts += `<option value='`+row.ch+`'>`+row.ch+`</option>`
            }
        }
    }
    });
    if(additionalOptions.length > 0) {
        additionalOptions.forEach((option,i) => {
            opts+=`<option value='`+option+`'>`+option+`</option>`
        });
    }
    select.innerHTML = opts;
  }

export const addCoherenceOptions = (selectId, atlasCoherenceData=[], additionalOptions=[]) => {
    var select = document.getElementById(selectId);
    select.innerHTML = "";
    var opts = ``;
    atlasCoherenceData.forEach((row,i) => {
      if(i===0) {
        opts += `<option value='`+row.tag+`' selected="selected">`+row.tag+`</option>`;
      }
      else{
        opts += `<option value='`+row.tag+`'>`+row.tag+`</option>`;
      }
    });
    if(additionalOptions.length > 0) {
        additionalOptions.forEach((option,i) => {
            opts+=`<option value='`+option+`'>`+option+`</option>`
        });
    }
    select.innerHTML = opts;

  }

export function genBandviewSelect(id='bandviewselectid'){
    return `
    <select id='`+id+`'>
      <option value="scp">SCP (0.1Hz-1Hz)</option>
      <option value="delta">Delta (1Hz-4Hz)</option>
      <option value="theta">Theta (4Hz-8Hz)</option>
      <option value="alpha1" selected="selected">Alpha1 (8Hz-10Hz)</option>
      <option value="alpha2">Alpha2 (10Hz-12Hz)</option>
      <option value="beta">Beta (12Hz-35Hz)</option>
      <option value="lowgamma">Low Gamma (35Hz-48Hz)</option>
      <option value="highgamma">High Gamma (48Hz+)</option>
    </select>`;
  }