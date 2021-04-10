import{DOMFragment as d}from"../utils/DOMFragment.js";export const addChannelOptions=(l,s=[],o=!0,n=[])=>{var a=document.getElementById(l);a.innerHTML="";var t="";s.forEach((e,c)=>{o===!0?e.tag!==null&&e.tag!=="other"&&(c===0?t+="<option value='"+e.ch+"' selected='selected'>"+e.tag+"</option>":t+="<option value='"+e.ch+"'>"+e.tag+"</option>"):e.tag!==null&&e.tag!=="other"?c===0?t+="<option value='"+e.ch+"' selected='selected'>"+e.tag+"</option>":t+="<option value='"+e.ch+"'>"+e.tag+"</option>":c===0?t+="<option value='"+e.ch+"' selected='selected'>"+e.ch+"</option>":t+="<option value='"+e.ch+"'>"+e.ch+"</option>"}),n.length>0&&n.forEach((e,c)=>{t+="<option value='"+e+"'>"+e+"</option>"}),a.innerHTML=t},addCoherenceOptions=(l,s=[],o=[])=>{var n=document.getElementById(l);n.innerHTML="";var a="";s.forEach((t,e)=>{e===0?a+="<option value='"+t.tag+`' selected="selected">`+t.tag+"</option>":a+="<option value='"+t.tag+"'>"+t.tag+"</option>"}),o.length>0&&o.forEach((t,e)=>{a+="<option value='"+t+"'>"+t+"</option>"}),n.innerHTML=a};export function genBandviewSelect(l="bandviewselectid"){return`
    <select id='`+l+`'>
      <option value="scp">SCP (0.1Hz-1Hz)</option>
      <option value="delta">Delta (1Hz-4Hz)</option>
      <option value="theta">Theta (4Hz-8Hz)</option>
      <option value="alpha1" selected="selected">Alpha1 (8Hz-10Hz)</option>
      <option value="alpha2">Alpha2 (10Hz-12Hz)</option>
      <option value="beta">Beta (12Hz-35Hz)</option>
      <option value="lowgamma">Low Gamma (35Hz-48Hz)</option>
      <option value="highgamma">High Gamma (48Hz+)</option>
    </select>`}export function makeEEGChannelSelector(l,s){var n;let o=(n=this.atlas.data.eegshared)==null?void 0:n.eegChannelTags;if(o){let a=Math.floor(Math.random()*1e4),t=()=>{let i="";this.atlas.data.eeg.forEach(p=>{i+="<option value='"+p.tag+"'>"+p.tag+"</option>"});let h="<tr>";return o.forEach((p,u)=>{h+="<td>"+p.ch+":<select id='"+p.ch+"select'>"+i+"</select></td>",u>0&&u%5==0&&(h+="</tr><tr>")}),h+="</tr>",`
        <table id='`+a+`channelselector'>
        `+h+`
        </table>
        `},e=()=>{o.forEach(i=>{document.getElementById(i.ch+"select").onchange=()=>{i.tag=document.getElementById(i.ch+"select").value}})};return new d(t,l,void 0,e)}else console.error("tags not found")}
