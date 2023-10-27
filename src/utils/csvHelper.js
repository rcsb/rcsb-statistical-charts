const rows = [
    ["Name", "City", "Employer"],
    ["Zintis", "New Brunswick", "Rutgers"],
    ["Henry", "New Brunswick", "Rutgers"]
];
let csvContent = "data:text/csv;charset=utf-8," + rows.map(row => (row.join(","))).join("\r\n")
    // let csvContent = "data:text/csv;charset=utf-8," + rows.map((row) => row.join(","))?.join("\r\n")


function getCSV(){
    console.log("csvContent", csvContent)
    return csvContent
}

module.exports = {getCSV}