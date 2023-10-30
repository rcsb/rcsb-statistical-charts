const sampleData = [
    ["Name", "City", "Employer"],
    ["Zintis", "New Brunswick", "Rutgers"],
    ["Henry", "New Brunswick", "Rutgers"]
];

let sampleCSV = "data:text/csv;charset=utf-8," + sampleData.map(row => (row.join(","))).join("\r\n")
    // let sampleCSV = "data:text/csv;charset=utf-8," + sampleData.map((row) => row.join(","))?.join("\r\n")


function getCSV(){
    console.log("sampleCSV", sampleCSV)
    return sampleCSV
}


function getSampleCSV(){
    console.log("sampleCSV", sampleCSV)
    return sampleCSV
}

module.exports = {getCSV, getSampleCSV}