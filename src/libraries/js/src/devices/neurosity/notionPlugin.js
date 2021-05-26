//Template system to feed into the deviceStream class for creating possible configurations. 
//Just fill out the template functions accordingly and add this class (with a unique name) to the list of usable devices.
import { DOMFragment } from '../../ui/DOMFragment';
import {DataAtlas} from '../../DataAtlas'
import {BiquadChannelFilterer} from '../../algorithms/BiquadFilters'
import {Notion} from '@neurosity/notion'

export class notionPlugin {
    constructor(mode, onconnect=this.onconnect, ondisconnect=this.ondisconnect) {
        this.atlas = null;
        this.mode = mode;

        this.device = null; //Invoke a device class here if needed
        this.filters = [];

        this.onconnect = onconnect;
        this.ondisconnect = ondisconnect;

        let disconnectOnRefresh = () => {
            this.disconnect()
            window.removeEventListener('beforeunload', disconnectOnRefresh)
        }
        window.addEventListener('beforeunload', disconnectOnRefresh)
    }

    init = async (info,pipeToAtlas) => {

        // NEUROSITY
        this.device = new Notion({autoSelectDevice: false});
        
        this.info = info;
        return new Promise((resolve, reject) => {
            let onAuth = (success) => {
                this.setupAtlas(info,pipeToAtlas).then(() => {
                    resolve(true)
                });
            }
            this.promptLogin(document.body, onAuth)
        });
    }


    timeCorrection = (coord, data, timestamp, direction='back') => {

        // Update Sampling Rate for New Data
        let prevTime = coord.times[coord.times.length - 1]
        if (prevTime == null) prevTime = timestamp - (data.length/this.info.sps)
        let timeToSample = (timestamp - prevTime)/data.length 
        this.info.sps = 1000/timeToSample // In Seconds

        // Calculate Time Vector through Linear interpolation
        let time = Array(data.length).fill(timestamp);
        if (direction === 'back') time = time.map((t,i) => {return t-(timeToSample*(time.length - i))}) // Back
        else time = time.map((t,i) => {return t+(timeToSample*i)}) // Forward
        
        return time
    }


    connect = async () => {

            this.device.brainwaves('raw').subscribe(brainwaves => {

                console.log(brainwaves)
                let raw = brainwaves.data
                if(this.info.useAtlas) {

                    raw.forEach((data,i) => {
                        let coord = this.atlas.getEEGDataByChannel(i);

                        let time = this.timeCorrection(coord,data,brainwaves.info.startTime)

                        // Push to Atlas
                        coord.times.push(...time);
                        coord.raw.push(...data);
                        coord.count += data.length;

                        // Filter Data
                        if(this.info.useFilters === true) {                
                            let latestFiltered = new Array(data.length).fill(0);
                            if(this.filters[i] !== undefined) {
                                data.forEach((sample,k) => { 
                                    latestFiltered[k] = this.filters[i].apply(sample); 
                                });
                            }
                            coord.filtered.push(...latestFiltered);
                        }
                    })
                }
            })

            // // Calm
            // this.device.calm().subscribe(({probability}) => {
            //     console.log('calm', probability)
            // });

            // // Focus
            // this.device.focus().subscribe(({probability}) => {
            //     console.log('focus', probability);
            // });

            // // Kinesis
            // this.device.kinesis("rightArm").subscribe(intent => {
            //     console.log(intent);
            // });

            // Signal Quality
            // notion.signalQuality().subscribe(signalQuality => {
            //     console.log(signalQuality);
            // });
              

            this.atlas.data.eegshared.startTime = Date.now();
            this.atlas.settings.deviceConnected = true;
            if(this.atlas.settings.analyzing !== true && this.info.analysis.length > 0) {
                this.atlas.settings.analyzing = true;
                setTimeout(() => {this.atlas.analyzer();},1200);		
            }

        this.onconnect();
    }

    disconnect = () => {

        this.device.disconnect();
        this.device.logout().then(() => {
            console.log('logged out');
        }).catch((error) => {
            console.error("Log out error", error);
        });

        this.ondisconnect();
        if (this.ui) this.ui.deleteNode()
        this.atlas.settings.deviceConnected = false;
    }

    setupAtlas = async (info,pipeToAtlas) => {

         let notionInfo = await this.device.getInfo();
         info.sps = notionInfo.samplingRate
         info.deviceType = 'eeg'
         info.eegChannelTags = []
         notionInfo.channelNames.forEach((t,i) => {
            info.eegChannelTags.push({tag: t, ch: i, analyze: true})
         })
 
         // FOR EEG ONLY
         if(pipeToAtlas === true) { //New Atlas
             let config = '10_20';
             this.atlas = new DataAtlas(
                 location+":"+this.mode,
                 {eegshared:{eegChannelTags: info.eegChannelTags, sps:info.sps}},
                 config,true,true,
                 info.analysis
                 );
             info.useAtlas = true;
         } else if (typeof pipeToAtlas === 'object') { //Reusing an atlas
             this.atlas = pipeToAtlas; //External atlas reference
             this.atlas.data.eegshared.sps = info.sps;
             this.atlas.data.eegshared.frequencies = this.atlas.bandpassWindow(0,128,info.sps*0.5);
             this.atlas.data.eegshared.bandFreqs = this.atlas.getBandFreqs(this.atlas.data.eegshared.frequencies);
             this.atlas.data.eeg = this.atlas.gen10_20Atlas(info.eegChannelTags); 
             
             this.atlas.data.coherence = this.atlas.genCoherenceMap(info.eegChannelTags);
             this.atlas.settings.coherence = true;
             this.atlas.settings.eeg = true;
             info.useAtlas = true;
             if(info.analysis.length > 0 ) {
                 this.atlas.settings.analysis.push(...info.analysis);
                 if(!this.atlas.settings.analyzing) { 
                     this.atlas.settings.analyzing = true;
                     this.atlas.analyzer();
                 }
             }
         }
 
  
         if(info.useFilters === true) {
             info.eegChannelTags.forEach((row,i) => {
                 if(row.tag !== 'other') {
                     this.filters.push(new BiquadChannelFilterer(row.ch,info.sps,true,1));
                 }
                 else { 
                     this.filters.push(new BiquadChannelFilterer(row.ch,info.sps,false,1)); 
                 }
             });
         }
         
         return this.atlas
    }

    //externally set callbacks
    onconnect = () => {}
    ondisconnect = () => {}

    addControls = (parentNode = document.body) => {
        // this.uiid = Math.floor(Math.random()*10000); //prevents any possible overlap with other elements
        // let template = () => {
        //     return `
        //     `;
        // }

        // let setup = () => {
           

        // }

        // this.ui = new DOMFragment(
        //     template,
        //     parentNode,
        //     undefined,
        //     setup
        // )
    }




    selectDevice = (devices, parentNode = document.body, onsuccess = () => { }) => {
        
       return new Promise((resolve, reject) => {

		let t = 1
		
		let template = () => {
			return `
			<div id="${this.id}-deviceBrowser" style="z-index: 1000; background: black; width:100%; height: 100%; position: absolute; top: 0; left: 0; display:flex; align-items: center; justify-content: center; opacity: 0;">
				<div id="${this.id}-choiceDisplay" style="flex-grow: 1;">
					<h1>Select your Device</h1>
					<div style="display: flex;">
						<div id="${this.id}-deviceDiv" style="flex-grow: 1; overflow-y: scroll; border: 1px solid white;">
						
						</div>
					</div>
				</div>
				<button id="${this.id}-exitBrowser" class="brainsatplay-default-button" style="position: absolute; bottom:25px; right: 25px;">Go Back</button>
			</div>`
		}

		let setup = () => {
			let browser = document.getElementById(`${this.id}-deviceBrowser`)
			let userDiv = browser.querySelector(`[id='${this.id}-deviceDiv']`)
			let closeUI = () => {
				browser.style.opacity = '0'
				window.removeEventListener('resize', resizeDisplay)
				setTimeout(() => {ui.deleteNode()},t*1000)
			}


			const resizeDisplay = () => {
				let browser = document.getElementById(`${this.id}-deviceBrowser`)
				let display = browser.querySelector(`[id='${this.id}-choiceDisplay']`)
				let userDiv = browser.querySelector(`[id='${this.id}-deviceDiv']`)
				let padding = 50;
				browser.style.padding = `${padding}px`
				userDiv.style.height = `${window.innerHeight - 2 * padding - (display.offsetHeight - userDiv.offsetHeight)}px`
			}

			let exitBrowser = browser.querySelector(`[id='${this.id}-exitBrowser']`)
			exitBrowser.onclick = closeUI

			resizeDisplay()
			window.addEventListener('resize', resizeDisplay)
			browser.style.transition = `opacity ${t}s`
			browser.style.opacity = '1'

			let updateDisplay = () => {
				userDiv.innerHTML = ''

				let deviceStyle = `
				background: rgb(20,20,20);
				padding: 25px;
				border: 1px solid black;
				transition: 0.5s;
			`

				let onMouseOver = () => {
					this.style.background = 'rgb(35,35,35)';
					this.style.cursor = 'pointer';
				}

				let onMouseOut = () => {
					this.style.background = 'rgb(20,20,20)';
					this.style.cursor = 'default';
				}

				devices.forEach(o => {
                    userDiv.innerHTML += `
                    <div  id="${this.id}-device-${o.deviceId}" class="neurosity-device" style="${deviceStyle}" onMouseOver="(${onMouseOver})()" onMouseOut="(${onMouseOut})()">
                    <p style="font-size: 60%;">${o.deviceId}</p>
                    <p>${o.deviceNickname}</p>
                    <p style="font-size: 80%;">${o.model}</p>
                    </div>`
				})

				let divs = userDiv.querySelectorAll(".neurosity-device")
				for (let div of divs) {
					let id = div.id.split(`${this.id}-device-`)[1]
                    div.onclick = async (e) => {
                        let device = await this.device.selectDevice((devices) =>devices.find((device) => device.deviceId === id));
                        resolve(device)
                        onsuccess()
                        closeUI()
                    }
				}
			}

            updateDisplay()
		}

		let ui = new DOMFragment(
			template,
			parentNode,
			undefined,
			setup
        )
        })
	}


    promptLogin = async (parentNode = document.body, callback = () => { }) => {
		let returned = new Promise((resolve, reject) => {
			let template = () => {
				return `
		<div id="${this.id}login-page" class="brainsatplay-default-container" style="z-index: 1000; opacity: 0; transition: opacity 1s;">
			<div>
				<h2>Access Notion Data</h2>
				<div id="${this.id}login-container" class="form-container">
					<div id="${this.id}login" class="form-context">
						<p id="${this.id}login-message" class="small"></p>
						<div class='flex'>
							<form id="${this.id}login-form" action="">
                                <div class="login-element" style="margin-left: 0px; margin-right: 0px">
                                    <input type="text" name="email" autocomplete="off" placeholder="Enter your email"/>
                                    <br>
                                    <input type="password" name="password" autocomplete="off" placeholder="Enter your password"/>
								</div>
							</form>
						</div>
						<div class="login-buttons" style="justify-content: flex-start;">
							<div id="${this.id}login-button" class="brainsatplay-default-button">Sign In</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		`}

			let setup = () => {
				let loginPage = document.getElementById(`${this.id}login-page`)
				const loginButton = loginPage.querySelector(`[id='${this.id}login-button']`)
				let form = loginPage.querySelector(`[id='${this.id}login-form']`)
				const usernameInput = form.querySelector('input')

				form.addEventListener("keyup", function (event) {
					if (event.keyCode === 13) {
						event.preventDefault();
					}
				});

				usernameInput.addEventListener("keyup", function (event) {
					if (event.keyCode === 13) {
						event.preventDefault();
						loginButton.click();
					}
				});

				loginButton.onclick = () => {
					let formDict = {}
					let formData = new FormData(form);
					for (var pair of formData.entries()) {
						formDict[pair[0]] = pair[1];
                    }

					this.device.login(formDict).catch((error) => {
                        console.error(error)
                    }).finally(async () => {
                        const devices = await this.device.getDevices();
                        await this.selectDevice(devices,document.body)
                        resolve(true)
                        callback()
                        loginPage.style.opacity = '0'
                        setTimeout(() => {ui.deleteNode()},1000)
                    });
				}

				loginPage.style.transition = 'opacity 1s'
				loginPage.style.opacity = '1'
			}

			let ui = new DOMFragment(
				template,
				parentNode,
				undefined,
				setup
			)
        });
        return returned
	}
}