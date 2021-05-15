//Templates for select menus. 

import { DOMFragment } from "../../../../libraries/js/src/ui/DOMFragment";

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
      <option value="beta">Beta (12Hz-30Hz)</option>
      <option value="lowgamma">Low Gamma (30Hz-45Hz)</option>
      <option value="highgamma">High Gamma (45Hz+)</option>
    </select>`;
  }


  //Lets you reassign EEG channelTags. Returns a DOMFragment instance and renders the template to the specified parentNode
  export function makeEEGChannelSelector(parentNode, atlas){
    let tags = this.atlas.data.eegshared?.eegChannelTags;
    if(tags) {
      let id = Math.floor(Math.random()*10000);
      let template = () => {

        let options = ``;

        this.atlas.data.eeg.forEach((row) => {
          options+= `<option value='`+row.tag+`'>`+row.tag+`</option>`
        })

        let tr = `<tr>`;

        tags.forEach((tag,i) => {
          tr += `<td>`+tag.ch+`:<select id='`+tag.ch+`select'>`+options+`</select></td>`
          if( i > 0 && i % 5 === 0) { tr += `</tr><tr>`}
        });

        tr += `</tr>`;

        return `
        <table id='`+id+`channelselector'>
        `+tr+`
        </table>
        `
      }

      let setup = () => {
        tags.forEach((tag) => {
          document.getElementById(tag.ch+'select').onchange = () => {
            tag.tag = document.getElementById(tag.ch+'select').value;
          }
        });
      }

      let frag = new DOMFragment(
        template,
        parentNode,
        undefined,
        setup
        );

      return frag;
    }
    else console.error('tags not found');
  }
