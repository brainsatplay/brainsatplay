import menusvg from '../../assets/menu.svg'
import menuxsvg from '../../assets/menuX.svg'
import logo from '../../public/logo512.png'
import filesvg from '../../assets/file_noun.svg'
import csvsvg from '../../assets/csv_noun.svg'

export function menu_template(props={}) {
    return `
    <img id="logo" src=`+logo+` style="position:absolute; height:50px; left:50%; margin-left:-25px; width:50px; top:17px; z-index:9999; pointer-events:none;"/>  
    <table id="UI" style="width:100%; left:0px; top:0px; position:absolute; z-index:1;">
        <tr id="menu_header" style="height:80px; text-align:center;">
        </tr>
        <tr id="menu_dropdown" style="height:300px; opacity:0; ">
        </tr>
        <tr id="menu_dropdown2" style="height:400px; opacity:0; transform:translateY(-900px);">
        </tr>
        <tr id="menu_dropdown3" style="height:400px; opacity:0; transform:translateY(-1300px);">
        </tr>
    </table>`;
}

export function menuheader_template(props={}) {
    return `
    <td id="connect" style="width:5%;">
        <button id="connectbutton" style="height:40px; width:40px;">
            <span>
            <svg  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" version="1.1" style="fill:black; shape-rendering:geometricPrecision;text-rendering:geometricPrecision;image-rendering:optimizeQuality; position:absolute;  height:40px;width:40px; top:30px; transform:translate(-17px,-3px);" viewBox="0 0 846.66 1058.325" x="0px" y="0px" fill-rule="evenodd" clip-rule="evenodd"><defs><style type="text/css">
                .fil0 {fill-rule:nonzero}
            </style></defs><g><path id="usbico" class="fil0" d="M505.77 220.08l0 118.41 -51.96 0 0 -66.44 -250.68 0 0 422.23 75.51 75.51 168.21 0 0 51.96 -189.73 0 -105.95 -105.95 0 -495.72 53.45 0 0 -195.15 247.71 0 0 195.15 53.44 0zm59.53 481.86c27.37,5.82 47.9,30.15 47.9,59.24 0,33.46 -27.12,60.57 -60.58,60.57 -33.45,0 -60.56,-27.11 -60.56,-60.57 0,-29.09 20.52,-53.42 47.88,-59.24l0 -43.04c-4.32,-2.13 -8.94,-4.34 -13.47,-6.51 -40.22,-19.18 -76.77,-36.63 -76.77,-86.97l0 -20.87c-11.03,-4.87 -18.7,-15.87 -18.7,-28.69 0,-17.32 14.05,-31.37 31.37,-31.37 17.33,0 31.38,14.05 31.38,31.37 0,12.82 -7.7,23.82 -18.7,28.69l0 20.87c0,34.38 29.67,48.52 62.3,64.09l2.59 1.25 0 -266.72 -28.96 0 41.64 -65.85 41.65 65.85 -28.97 0 0 216.08 8.35 -4 0 -0.05c42.78,-20.41 81.66,-38.97 81.66,-85.12l0 -47.87 -14.84 0 0 -55.03 55.03 0 0 55.03 -14.84 0 0 47.87c0,62.14 -45.76,83.98 -96.12,108l-0.02 -0.04c-6.25,2.98 -12.58,5.98 -19.22,9.31l0 93.72zm-221.33 -578.46l41.35 0 0 41.35 -41.35 0 0 -41.35zm-72.35 0l41.35 0 0 41.35 -41.35 0 0 -41.35zm-32.37 96.6l178.44 0 0 -160.52 -178.44 0 0 160.52z"/></g><text x="0" y="861.66" fill="#000000" font-size="5px" font-weight="bold" font-family="'Helvetica Neue', Helvetica, Arial-Unicode, Arial, Sans-serif">Created by callorine</text><text x="0" y="866.66" fill="#000000" font-size="5px" font-weight="bold" font-family="'Helvetica Neue', Helvetica, Arial-Unicode, Arial, Sans-serif">from the Noun Project</text></svg>
            </span>&nbsp;
        </button>
    </td>
    <td id="run" style="width:5%;">
        <button id="runbutton" style="height:40px; width:40px; transform:rotate(90deg); font-size: 30px;">
            <div style=transform:translate(-2px,0px);>▲</div>
        </button>
    </td>
    <td id="stop" style="width:5%;">
        <button id="stopbutton" style="height:40px; width:40px; font-size:35px;">
            <div style=transform:translate(0px,-6px);>■</div>
        </button>
    </td>
    <td id="visuals" style="width:7.5%;">
        <button id="visualsbutton" style="height:40px; width:40px; transform:translate(2px,13px); font-size:35px;">   
                <svg id="squaresvg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" version="1.1" style="fill:black; transform:translate(-19px,-13px); height:50px; width:50px; shape-rendering:geometricPrecision;text-rendering:geometricPrecision;image-rendering:optimizeQuality;" viewBox="0 0 1128.88 1411.1000000000001" x="0px" y="0px" fill-rule="evenodd" clip-rule="evenodd"><defs><style type="text/css">
                    .fil0 {}
                    </style></defs><g><g><g>
                    <path class='fil0' style='transition: all 0.3s;' d="M474.78 230.32l-177.76 0c-36.93,0 -66.83,29.89 -66.83,66.83l0 177.75c0,36.94 29.9,66.83 66.83,66.83l177.76 -0.01c36.94,0 66.83,-29.89 66.83,-66.83l0 -177.75c0,-36.93 -29.89,-66.82 -66.83,-66.82z"/>
                    <path class='fil0' style='transition: all 0.6s;' d="M474.78 587.16l-177.76 0c-36.93,0 -66.83,29.89 -66.83,66.83l0.02 177.74c0,36.94 29.89,66.83 66.83,66.83l177.74 0c36.94,0 66.83,-29.89 66.83,-66.83l0 -177.76c0,-36.87 -29.89,-66.81 -66.83,-66.81z"/>
                    <path class='fil0' style='transition: all 0.4s;' d="M831.84 587.16l-177.75 0c-36.94,0 -66.83,29.89 -66.83,66.83l0.01 177.74c0,36.94 29.89,66.83 66.83,66.83l177.74 0c36.94,0 66.83,-29.89 66.83,-66.83l0 -177.76c0,-36.87 -29.89,-66.81 -66.83,-66.81z"/>
                    <path class='fil0' style='transition: all 0.8s;' d="M831.84 230.32l-177.75 0c-36.94,0 -66.83,29.89 -66.83,66.83l0 177.75c0,36.94 29.89,66.83 66.83,66.83l177.75 -0.01c36.94,0 66.83,-29.89 66.83,-66.83l0 -177.75c0,-36.93 -29.89,-66.82 -66.83,-66.82z"/>
                </g></g></g><text x="0" y="1143.88" fill="#000000" font-size="5px" font-weight="bold" font-family="'Helvetica Neue', Helvetica, Arial-Unicode, Arial, Sans-serif">Created by Ilham Fitrotul Hayat</text><text x="0" y="1148.88" fill="#000000" font-size="5px" font-weight="bold" font-family="'Helvetica Neue', Helvetica, Arial-Unicode, Arial, Sans-serif">from the Noun Project</text></svg>
        </button>
    </td>
    <td id="files" style="width:7.5%;">
        <img id="filesvg" src=`+filesvg+` style="height:60px;width:60px; transform:translateY(6px);" />
    </td>
    <td id="menu" style="width:75%;"> 
        <div style="float:right; margin-right: 80px;">
            <img id="menusvg" src=`+menusvg+` style="position:absolute; height:60px;width:60px; top:12.5px;"/>   
            <img id="menuxsvg" src=`+menuxsvg+` style="position:absolute; height:60px;width:60px; top:12.5px; display:none; opacity:0;"/>
            <input style="display:none;" type="checkbox" id="menucheckbox" title="Menu">
        </div>
    </td>
    `;
}

export function menudropdown_template(props={}) { 
    //<tr><td>Set Channel View</td><td colspan=3><input type="text" style="width:100%;" id="View" placeholder="Format: 0,1,2,5,6,7,etc"></input></td><td><button id="setView">Set</button></td></tr>
    //<tr><td>Set Time Series View</td><td colspan=2><input type="text" style="width:100%;" id="GraphTime" placeholder="10 (seconds)"></input></td><td><button id="setTimeSpan">Set</button></td></tr>
            
    return `
    <td style="width:100%; vertical-align:center; border:2px inset black;" colspan=6>
        <table style="margin-left:auto; margin-right:auto; ">
            <tr><td>Set Band View</td><td><input type="text" style="width:95%;" id="freqStart" placeholder="0 (Hz)"></td><td>to</td><td><input type="text" style="width:100%;" id="freqEnd" placeholder="128 (Hz)"></td><td><button id="setBandView">Set</button></td></tr>
            <tr><td>Set Tags</td><td colspan=3><input type="text" style="width:100%;" id="Tags" placeholder="Format: 0:Fp1 or 2:Fz or 6:P6:0,1,2 or 6:delete"></input></td><td><button id="setTags">Set</button></td></tr>
            <tr><td>Use Filters:<input id="useFilters" type="checkbox" checked></td><td colSpan="3"> Notch 50Hz <input id="notch50" type="checkbox" checked> Notch 60Hz <input id="notch60" type="checkbox" checked> Low Pass 50Hz x4 <input id="lp50" type="checkbox"> SMA4 <input id="sma4" type="checkbox" checked> DC Blocker <input id="dcb" type="checkbox" checked></td></tr>
            <tr><td>Bandpass x4 <input id="bandpass" type="checkbox"></td><td> <input id="bplower" type="text" style="width:95%;" placeholder="3 (Hz)" value="3"></td><td>to</td><td><input id="bpupper" style="width:100%;" type="text" placeholder="45 (Hz)" value="45"></td><td><button id="setbp">Set</button></td></tr>
            <tr><td>Analysis:</td><td colSpan="3"> uV Scaling <input id="uvscaling" type="checkbox" checked> Coherence (CPU intensive)<input id="getCoherence" type="checkbox" checked></td></tr>
        </table>
     </td>`; 
}

export function menudropdown2_template(props={}) {
    return `
    <td style="width:100%; vertical-align:center; border:2px inset black;" colspan=5>
        <table style="margin-left:auto; margin-right:auto;">
            <tr>
                <td>Applet 1:<select id="applet1"></select></td>
            </tr>
            <tr>
                <td>Applet 2:<select id="applet2"></select></td>
            </tr>
            <tr>
                <td>Applet 3:<select id="applet3"></select></td>
            </tr>
            <tr>
                <td>Applet 4:<select id="applet4"></select></td>
            </tr>
        </table>
    </td>
    `;
}

export function menudropdown3_template(props={}) {
    return `
    <td style="width:100%; height:400px; vertical-align:top; border:2px inset black;" colspan=6>
        <button id="saveSession">Save Current Data</button><button id="newSession">New Session</button>
        <div id="filesystem" style="width:100%;height:400px;overflow-y:scroll;"></div>
    </td>
    `;
}

export function appletbox_template(props={}){
    return `
    <div id="applets" style="z-index:2; position:absolute;top:90px;height:`+(window.innerHeight-90)+`;width:`+window.innerWidth+`" ></div>
    `;
}

export function file_template(props={id:Math.random()}) {
    return `
    <div id="`+props.id+`">
        <p id="`+props.id+`filename">`+props.id+`</p><button id="`+props.id+`delete">X</button>
        <img id="`+props.id+`svg" src="`+csvsvg+`" style="height:60px;width:60px;">
    </div>
    `;
}


export function menu_setup() {
    document.getElementById("menuxsvg").style.display = "none";
    
    document.getElementById("menusvg").addEventListener('click',() => {

      document.getElementById("menucheckbox").click();

      document.getElementById("menusvg").style.opacity = 0;
      document.getElementById("menuxsvg").style.display = "";
      
      setTimeout(() => { 
        document.getElementById("menuxsvg").style.opacity = 1; 
        document.getElementById("menusvg").style.display = "none";  
      }, 300);

     });
     
     document.getElementById("menuxsvg").addEventListener('click', () => {

      document.getElementById("menucheckbox").click();

      document.getElementById("menusvg").style.display = "";
      document.getElementById("menuxsvg").style.opacity = 0;

      setTimeout(() => {  
        document.getElementById("menusvg").style.opacity = 1;  
        document.getElementById("menuxsvg").style.display = "none"; 
      }, 300);
     });

     document.getElementById("filesvg").onclick = () => {
        if(document.getElementById("menucheckbox").checked === true){
            document.getElementById("menuxsvg").click();
        }
         if(document.getElementById("menu_dropdown3").style.opacity === "0"){ 
             
            document.getElementById("menu_dropdown2").style.opacity = 0;
            document.getElementById("menu_dropdown2").style.transform = "translateY(-900px)";   
            document.getElementById("menu_dropdown2").style.transition ="transform 0.5s ease-in-out, opacity 0.1s ease";

            document.getElementById("menu_dropdown").style.opacity = 0;
            document.getElementById("menu_dropdown").style.transform = "translateY(-500px)";
            document.getElementById("menu_dropdown").style.transition ="transform 0.5s ease-in-out, opacity 0.1s ease";
    
            document.getElementById("menu_dropdown3").style.transform = "translateY(-700px)";
            document.getElementById("menu_dropdown3").style.opacity = 1;
            document.getElementById("menu_dropdown3").style.transition ="transform 0.5s ease-in-out, opacity 0.4s ease 0.3s"
            document.getElementById("UI").style.zIndex = 999;
         }
         else {
            document.getElementById("menu_dropdown3").style.transform = "translateY(-1300px)";
            document.getElementById("menu_dropdown3").style.opacity = 0;
            document.getElementById("menu_dropdown3").style.transition ="transform 0.5s ease-in-out, opacity 0.1s ease";
            document.getElementById("UI").style.zIndex = -1;
         }
    }

     document.getElementById("menucheckbox").addEventListener('click',() => {

      if(document.getElementById("menucheckbox").checked === true){
        
        document.getElementById("menu_dropdown2").style.opacity = 0;
        document.getElementById("menu_dropdown2").style.transform = "translateY(-900px)";   
        document.getElementById("menu_dropdown2").style.transition ="transform 0.5s ease-in-out, opacity 0.1s ease";

        document.getElementById("menu_dropdown3").style.transform = "translateY(-1300px)";
        document.getElementById("menu_dropdown3").style.opacity = 0;
        document.getElementById("menu_dropdown2").style.transition ="transform 0.5s ease-in-out, opacity 0.1s ease";

        document.getElementById("menu_dropdown").style.opacity = 1;
        document.getElementById("menu_dropdown").style.transform = "translateY(0px)";
        document.getElementById("menu_dropdown").style.transition ="transform 0.5s ease-in-out, opacity 0.4s ease 0.3s";
        document.getElementById("UI").style.zIndex = 999;
      }
      else {
        document.getElementById("menu_dropdown").style.opacity = 0;
        document.getElementById("menu_dropdown").style.transform = "translateY(-500px)";
        document.getElementById("menu_dropdown").style.transition ="transform 0.5s ease-in-out, opacity 0.1s ease";
        document.getElementById("UI").style.zIndex = -1;
      }
     });

     document.getElementById("visualsbutton").addEventListener('click',() => {
        if(document.getElementById("menucheckbox").checked === true){
            document.getElementById("menuxsvg").click();
        }
         if(document.getElementById("menu_dropdown2").style.opacity === "0"){

            document.getElementById("menu_dropdown2").style.opacity = 1;
            document.getElementById("menu_dropdown2").style.transform = "translateY(-300px)";
            document.getElementById("menu_dropdown2").style.transition ="transform 0.5s ease-in-out, opacity 0.4s ease 0.3s";

            document.getElementById("menu_dropdown3").style.transform = "translateY(-1300px)";
            document.getElementById("menu_dropdown3").style.opacity = 0;
            document.getElementById("menu_dropdown2").style.transition ="transform 0.5s ease-in-out, opacity 0.1s ease";
            
            document.getElementById("menu_dropdown").style.opacity = 0;
            document.getElementById("menu_dropdown").style.transform = "translateY(-500px)";
            document.getElementById("menu_dropdown").style.transition ="transform 0.5s ease-in-out, opacity 0.1s ease";
            document.getElementById("UI").style.zIndex = 999;
         }
         else{
            document.getElementById("menu_dropdown2").style.opacity = 0;
            document.getElementById("menu_dropdown2").style.transform = "translateY(-900px)";   
            document.getElementById("menu_dropdown2").style.transition ="transform 0.5s ease-in-out, opacity 0.1s ease";
            document.getElementById("UI").style.zIndex = -1;
         }
     });

}