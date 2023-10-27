// https://www.ibm.com/design/language/color/
// These colors are chosen from the above article. Not all IBM colors are being used (no gray, cool gray, warm gray). 

const HTML_COLORS = {
    aqua: ['aqua'], 
    black: ['black'], 
    blue: ['blue'], 
    fuchsia: ['fuchsia'], 
    // gray: ['gray'], 
    green: ['green'], 
    lime: ['lime'], 
    maroon: ['maroon'], 
    navy: ['navy'], 
    olive: ['olive'], 
    purple: ['purple'], 
    red: ['red'], 
    silver: ['silver'], 
    teal: ['teal'], 
    white: ['white'], 
    yellow: ['yellow'],
}

const IBM_COLORS = {
    red: [
        '#2d0709',
        '#520408',
        '#750e13',
        '#a2191f',
        '#da1e28',
        '#fa4d56',
        '#ff8389',
        '#ffb3b8',
        '#ffd7d9',
        '#fff1f1',
    ],
    // magenta: [
    //     '#2a0a18',
    //     '#510224',
    //     '#740937',
    //     '#9f1853',
    //     '#d02670',
    //     '#ee5396',
    //     '#ff7eb6',
    //     '#ffafd2',
    //     '#ffd6e8',
    //     '#fff0f7',
    // ],
    purple: [
        '#1c0f30',
        '#31135e',
        '#491d8b',
        '#6929c4',
        '#8a3ffc',
        '#a56eff',
        '#be95ff',
        '#d4bbff',
        '#e8daff',
        '#f6f2ff',
    ],
    blue: [
        '#001141',
        '#001d6c',
        '#002d9c',
        '#0043ce',
        '#0f62fe',
        '#4589ff',
        '#78a9ff',
        '#a6c8ff',
        '#d0e2ff',
        '#edf5ff',
    ],
    cyan: [
        '#061727',
        '#012749',
        '#003a6d',
        '#00539a',
        '#0072c3',
        '#1192e8',
        '#33b1ff',
        '#82cfff',
        '#bae6ff',
        '#e5f6ff',
    ],
    // teal: [
    //     '#081a1c',
    //     '#022b30',
    //     '#004144',
    //     '#005d5d',
    //     '#007d79',
    //     '#009d9a',
    //     '#08bdba',
    //     '#3ddbd9',
    //     '#9ef0f0',
    //     '#d9fbfb',
    // ],
    green: [
        '#071908',
        '#022d0d',
        '#044317',
        '#0e6027',
        '#198038',
        '#24a148',
        '#42be65',
        '#6fdc8c',
        '#a7f0ba',
        '#defbe6',
    ],
}

const ALL_COLORS = {
    HTML_COLORS, 
    IBM_COLORS
}

function getPalette(paletteName, brightness=0){
    if(!ALL_COLORS[paletteName]) throw new Error("Palette Name does not match existing palettes")
    return Object.values(ALL_COLORS[paletteName]).map(item => item[brightness])
}

function getPalettes(paletteName, brightnesses=[0,1,2,3,4,5,6,7,8,9]){
    let palette = brightnesses.map(b => getPalette(paletteName, b)).flat()
    console.log("palette", palette)
    let result = []
    // for (let brightness of brightnesses) {
        for (let color of palette) {
            console.log("color", color)
            result.push(color || null)
        }
    // }
    return result.filter(item => item !== null)
    return shuffle(result)
}

// This is a proper shuffling algo. But we don't want perfect shuffling, we want high contrast colors next to each other
// function sampleShuffle(array) {
//     let currentIndex = array.length, randomIndex;

//     // While there remain elements to shuffle.
//     while (currentIndex > 0) {

//         // Pick a remaining element.
//         randomIndex = Math.floor(Math.random() * currentIndex);
//         currentIndex--;

//         // And swap it with the current element.
//         [array[currentIndex], array[randomIndex]] = [
//             array[randomIndex], array[currentIndex]];
//     }

//     return array;
// }

// Shuffles the colors so there is higher contrast between adjacent colors in the array
function shuffle(arr){
    let result = []
    for(let x = 0; x <= arr.length / 2; x++){
        let item = arr[x]
        let otherItem = arr[arr.length - x - 1]
        result.push(item, otherItem)
    }
    return result
}

export {IBM_COLORS, getPalette, getPalettes}