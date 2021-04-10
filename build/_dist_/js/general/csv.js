export class CSV{constructor(t=this.onOpen,n=null,e=null){this.onOpen=t,this.notes=[{idx:0,text:"comment"}],n!==null&&document.getElementById(n).addEventListener("click",this.saveCSV),e!==null&&document.getElementById(e).addEventListener("click",this.openCSV)}processArraysForCSV(t=["1|2|3","3|2|1"],n="|",e="a,b,c",l=!1){let r=e+`
`,a=0;return t.forEach((s,c)=>{t[c]==="string"&&n!==","?r+=s.split(n).join(","):csvData+=s.join(","),l===!0&&this.notes[a].idx===c&&(s+=this.notes[a].text,a++),s.indexOf(`
`)<0&&(r+=`
`)}),r}static saveCSV(t=`a,b,c
1,2,3
3,2,1
`,n=new Date().toISOString()){var e=document.createElement("a");e.href="data:text/csv;charset=utf-8,"+encodeURI(t),e.target="_blank",n!==""?e.download=n+".csv":e.download=Date().toISOString()+".csv",e.click()}static openCSV(t=",",n=e=>e){var e=document.createElement("input");e.accept=".csv",e.type="file",e.onchange=l=>{var r=l.target.files[0],a=new FileReader;a.readAsText(r),a.onload=s=>{var c=s.target.result,i=c.split(`
`),o=[];i.pop(),i.forEach((d,v)=>{if(v==0)var p=d.split(t);else{var p=d.split(t);o.push(p)}}),n(o)},e.value=""},e.click()}onOpen(t=[]){return console.log("CSV Opened!",t),t}}
