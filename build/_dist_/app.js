import{brainsatplay as o}from"./js/brainsatplay.js";import{DOMFragment as c}from"./js/frontend/utils/DOMFragment.js";let e=new o("guest","","Brain Joust");e.state.data.x=0,e.state.subscribe("x",n=>{console.log(n)}),setTimeout(()=>{e.state.data.x=2},300);let s=`
	<button id='connect'>Connect Device</button>
    <button id='server'>Connect to Server</button>
    <button id='ping'>Send Ping</button>
	<button id='getusers'>Get Users</button>
	<button id='createGame'>Make Game session</button>
	<button id='subscribeToGame'>Subscribe to game session (connect device first)</button>
	<button id='subscribeToSelf'>Subscribe to self</button>
`,d=new c(s,document.body,void 0,()=>{let n=()=>{console.log("connected"),e.subscribe("muse","AF7",void 0,t=>{console.log(t)})};document.getElementById("connect").onclick=()=>{e.info.auth.authenticated?e.connect("muse",["eegcoherence"],n,void 0,!0,[["eegch","AF7","all"],["eegch","AF8","all"]]):e.connect("muse",["eegcoherence"],n)},document.getElementById("server").onclick=()=>{e.login(!0)},document.getElementById("ping").onclick=()=>{e.sendWSCommand(["ping"])},document.getElementById("getusers").onclick=()=>{e.sendWSCommand(["getUsers"])},document.getElementById("createGame").onclick=()=>{e.sendWSCommand(["createGame",e.info.auth.appname,["muse"],["eegch_AF7","eegch_AF8"]])},document.getElementById("subscribeToGame").onclick=()=>{e.subscribeToGame(void 0,!1,t=>{console.log("subscribed!",t)})},document.getElementById("subscribeToSelf").onclick=()=>{e.subscribeToUser("guest",["eegch_AF7","eegch_AF8"],t=>{console.log("subscribed!",t)})}},void 0,"NEVER");
