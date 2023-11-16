const PRESET = {
    // https://www.heavy.ai/blog/12-color-palettes-for-telling-better-stories-with-your-data
    "RETRO_METRO": ["#ea5545", "#f46a9b", "#ef9b20", "#edbf33", "#ede15b", "#bdcf32", "#87bc45", "#27aeef", "#b33dc6"],
    "DUTCH_FIELD": ["#e60049", "#0bb4ff", "#50e991", "#e6d800", "#9b19f5", "#ffa300", "#dc0ab4", "#b3d4ff", "#00bfa0"],
    "RIVER_NIGHTS": ["#b30000", "#7c1158", "#4421af", "#1a53ff", "#0d88e6", "#00b7c7", "#5ad45a", "#8be04e", "#ebdc78"],
    "SPRING_PASTELS": ["#fd7f6f", "#7eb0d5", "#b2e061", "#bd7ebe", "#ffb55a", "#ffee65", "#beb9db", "#fdcce5", "#8bd3c7"],
    "BLUE_TO_RED": ["#1984c5", "#22a7f0", "#63bff0", "#a7d5ed", "#e2e2e2", "#e1a692", "#de6e56", "#e14b31", "#c23728"],
    "ORANGE_TO_PURPLE": ["#ffb400", "#d2980d", "#a57c1b", "#786028", "#363445", "#48446e", "#5e569b", "#776bcd", "#9080ff"],
    "SALMON_TO_AQUA": ["#e27c7c", "#a86464", "#6d4b4b", "#503f3f", "#333333", "#3c4e4b", "#466964", "#599e94", "#6cd4c5"],
}

const COLORBLIND = {
    // https://www.color-hex.com/color-palette/1018347
    "BANG_WONG": ["#000000", "#829F01", "#56B4E9", "#009E73", "#F0E442", "#0072B2", "#D55E00", "#CC79A7"],
    // https://personal.sron.nl/~pault/
    "PAUL_TOL": [
        "#2166AC",
        "#4393C3",
        "#92C5DE",
        "#D1E5F0",
        // "#F7F7F7", // This color is too light, close to white
        "#FDDBC7",
        "#F4A582",
        "#D6604D",
        "#B2182B"
    ]
}

// Not all colors are used
const HTML_ALL_COLORS = {
    aqua: ['#00FFFF'],
    black: ['#000000'],
    blue: ['#0000FF'],
    fuchsia: ['#FF00FF'],
    gray: ['gray'],
    green: ['#008000'],
    lime: ['#32CD32'],
    maroon: ['#800000'],
    navy: ['#000080'],
    olive: ['#808000'],
    purple: ['#800080'],
    red: ['#ff0000'],
    silver: ['#c0c0c0'],
    teal: ['#008080'],
    white: ['white'],
    yellow: ['#FFFF55'],
}

// https://www.ibm.com/design/language/color/
// These colors are chosen from the above article. Not all IBM colors are being used (no gray, cool gray, warm gray). 
// Not all colors are used
const IBM_ALL_COLORS = {
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
    magenta: [
        '#2a0a18',
        '#510224',
        '#740937',
        '#9f1853',
        '#d02670',
        '#ee5396',
        '#ff7eb6',
        '#ffafd2',
        '#ffd6e8',
        '#fff0f7',
    ],
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
    teal: [
        '#081a1c',
        '#022b30',
        '#004144',
        '#005d5d',
        '#007d79',
        '#009d9a',
        '#08bdba',
        '#3ddbd9',
        '#9ef0f0',
        '#d9fbfb',
    ],
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

const IBM_COLORS = pickColorsFromPalette(IBM_ALL_COLORS, ['red', 'purple', 'blue', 'teal', 'green'], [8,6,4,2])
const HTML_COLORS = pickColorsFromPalette(HTML_ALL_COLORS, ['aqua', 'blue', 'fuchsia', 'green', 'lime', 'maroon', 'navy', 'olive', 'red', 'silver', 'yellow'], [0])


const NON_COLORBLIND = {
    "IBM_COLORS": IBM_COLORS,
    "HTML_COLORS": HTML_COLORS,
    ...PRESET,
}

const ALL_COLORS = {
    "IBM_COLORS": IBM_COLORS,
    "HTML_COLORS": HTML_COLORS,
    ...PRESET, 
    ...COLORBLIND
}

/**
 * 
 * @param {*} palette Object with colors as keys and array of brightnesses of that color
 * @param {*} colorsToUse Array of color names to use from object
 * @param {*} brightnessToUse Levels of brightness to pick from the array
 * @returns 
 */
function pickColorsFromPalette(palette, colorsToUse, brightnessToUse){
    return Object
        .entries(palette) // Just entries
        .filter(([key, colorArr]) => colorsToUse.includes(key)) // Only specific colorsToUse
        .map(([key, colorArr]) => [key, colorArr.filter((c,i) => brightnessToUse.includes(i))]) // Only specific brightnesses
        .map(([a,b]) => b) // Only the color hexcodes
        .flat() // Single flat array
}

function getPalette(paletteName, shouldShuffle){
    const chosenPalette = ALL_COLORS[paletteName]
    if(!chosenPalette) throw new Error("Palette Name does not match existing palettes")
    if(shouldShuffle) return shuffle(chosenPalette)
    return chosenPalette
}

/**
 * // Shuffles the colors so there is higher contrast between adjacent colors in the array
 * @param {*} arr 
 * @returns array with values shuffled
 * // example: input is [1,2,3,4,5] output is [1,4,2,5,3]
 */
function shuffle(arr){
    let result = []
    const halfIndex = Math.ceil(arr.length / 2)
    const arr1 = arr.slice(0,halfIndex)
    const arr2 = arr.slice(halfIndex)
    for(let x = 0; x < Math.max(arr1.length, arr2.length); x++){
        if(arr1[x]) result.push(arr1[x])
        if(arr2[x]) result.push(arr2[x])
    }
    return result
}

export {PRESET, COLORBLIND, NON_COLORBLIND, ALL_COLORS, getPalette}