
//By Joshua Brewster (MIT License)
export class CSV { //data=["1|2","11|22"], or data=[[1,2,"xyz"],[2,3,"abc"],etc]
    constructor(onOpen=this.onOpen, saveButtonId=null, openButtonId=null) {

        this.onOpen = onOpen;
        this.notes = [{idx:0,text:"comment"}]; //order comments by data index

        if(saveButtonId !== null) {
            document.getElementById(saveButtonId).addEventListener('click', this.saveCSV);
        }
        if(openButtonId !== null) {
            document.getElementById(openButtonId).addEventListener('click', this.openCSV);
        }
    }

    processArraysForCSV(data=["1|2|3","3|2|1"],  delimiter="|", header="a,b,c",saveNotes=false) {
        let csvDat = header+"\n";
        let noteIdx = 0;
        data.forEach((line, i) => { //Add comments from an array with this structure this.notes = [{idx:n, text: "comment"},{...}]       
            if(data[i] === "string" && delimiter !== ",") { csvDat += line.split(delimiter).join(","); } 
            else{ csvData += line.join(",");} // Data can just be an array of arrays
            if (saveNotes === true) {
                if(this.notes[noteIdx].idx === i) {
                    line += this.notes[noteIdx].text;
                    noteIdx++;
                }
            }
            if(line.indexOf('\n') < 0) {csvDat+="\n";} //Add line endings exist in unprocessed array data
        });

        return csvDat;
    }

    //Converts an array of strings (e.g. raw data stream text) or an array of arrays representing lines of data into CSVs
    static saveCSV(csvDat="a,b,c\n1,2,3\n3,2,1\n",name=new Date().toISOString()){
        var hiddenElement = document.createElement('a');
        hiddenElement.href = "data:text/csv;charset=utf-8," + encodeURI(csvDat);
        hiddenElement.target = "_blank";
        if (name !== "") {
            hiddenElement.download = name+".csv";
        } else{
            hiddenElement.download = Date().toISOString()+".csv";
        }
        hiddenElement.click();
    }

    static openCSV(delimiter = ",", onOpen = (csvDat, header, path)=>{return csvDat, header, path;}) {
        var input = document.createElement('input');
        input.accept = '.csv';
        input.type = 'file';

        input.onchange = (e) => {
            var file = e.target.files[0];
            var reader = new FileReader();
            reader.onload = (event) => {
                var tempcsvData = event.target.result;
                var tempcsvArr = tempcsvData.split("\n");
                let header = [];
                var csvDat = [];
                tempcsvArr.pop();
                tempcsvArr.forEach((row,i) => {
                    if(i==0){ header = row.split(delimiter); }
                    else{
                        var temp = row.split(delimiter);
                        csvDat.push(temp);
                    }
                });
                onOpen(csvDat,header,input.value);
                input.value = '';
            }
            reader.readAsText(file);
        }
        input.click();
    } 

    //Dump CSV data without parsing it.
    static openCSVRaw(onOpen = (csvDat, path)=>{return csvDat, path;}) {
        var input = document.createElement('input');
        input.accept = '.csv';
        input.type = 'file';

        input.onchange = (e) => {
            var file = e.target.files[0];
            var reader = new FileReader();
            reader.onload = (event) => {
                var tempcsvData = event.target.result;
                onOpen(tempcsvData, input.value);
                input.value = '';
            }
            reader.readAsText(file);
        }
        input.click();
    }

    onOpen(csvDat=[],header=[]) { // Customize this function in your init script, access data with ex. console.log(serialMonitor.csvDat), where var serialMonitor = new chromeSerial(defaultUI=false)
        console.log("CSV Opened!",header, csvDat);
    }
}