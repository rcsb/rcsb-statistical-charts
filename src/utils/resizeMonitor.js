let callbacks = [];

// Example Callback:
// function CB(w,h){
//     console.log("width", w)
//     console.log("height", h)
// }

window.addEventListener('resize', (e) => {
    callbacks.forEach(cb => {
        if(typeof cb === 'function') cb(e.target.innerWidth, e.target.innerHeight)
    })
})

function addMonitorResizeListener(callback){
    // window.removeEventListener("resize", CB);
    console.log("adding listener function", callback)
    if(typeof callback !== "function") throw new Error("monitorResize must take callback as argument")
    callbacks.push(callback)
}
function removeMonitorResizeListener(callback){
    console.log("removing listener function", callback)
    if(typeof callback !== "function") throw new Error("monitorResize must take callback as argument")
    let index = callbacks.indexOf(callback)
    callbacks.splice(index, 1)
}

module.exports = {addMonitorResizeListener, removeMonitorResizeListener}