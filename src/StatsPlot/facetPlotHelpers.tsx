import {ChartObjectInterface} from "@rcsb/rcsb-charts/lib/RcsbChartComponent/ChartConfigInterface";
import {CategoryListType, CategoryDictType} from "./FacetPlotInterface"

/**
 * Transforms RCSB data into a list of categories
 * @param data 
 * @returns array of CategoryListType (i.e. [ {name: string, count: number, color: string} ] )
 */
export function createCategoryListFromData(data:ChartObjectInterface[][]):CategoryListType[]{
    let categoryDict: CategoryDictType = {};
    let categories: CategoryListType[] = []

    // Populate categories dict
    data.length > 1 && data.forEach(item => {
        item?.forEach(chartObject => {
            let [year, name, count] = chartObject?.objectConfig?.objectId
            let color = chartObject?.objectConfig?.color || ""
            if (categoryDict[name]) {
                categoryDict[name].count += count
            } else {
                categoryDict[name] = { count, year, color }
            }
        })
    })

    // Convert map into array
    categories = Object.entries(categoryDict).map((item:any) => {
        return {name:item[0], count: item[1]?.count, color: item[1]?.color}
    })

    // Sort the categories, highest to lowest
    categories.sort( (a,b) => {return b.count - a.count} )

    return categories
}

/**
 * Takes an array of categories, which are arrays of categoriObjectInterfaces (see below)
 * @param categories [ [         
 *      {
 *          label,
            population,
            objectConfig: {
                objectId,
                color
            }
        }
    ] ]
 * @returns number[] an array with the lowest and highest numbers found (for category years) (i.e. [1984, 2023])
 */
export function findStartAndEndYearsForAll(categories: ChartObjectInterface[][]): number[] {
    
    let allYears: number[] = categories.map(category => findStartAndEndYears(category)).flat()
    if (allYears.length === 0) return []
    
    let start = Math.min(...allYears)
    let end = Math.max(...allYears)
    
    return [start, end]

    function findStartAndEndYears(category: any[]): number[] {
        let years: any[] = category.map(c => (c.label))
        if (years.length === 0) return []
        let start = Math.min(...years)
        let end = Math.max(...years)
        return [start, end]
    }
}

/**
 * 
 * @param category an array of chartObjectInterfaces
 * @param start number (low)
 * @param end number (high)
 * @returns additional entries in the category, beginning with the low number's year, and ending with the high. Existing entries are preserved
 */
export function addEmptyYears(category: any[], start: number = 1800, end: number = new Date().getFullYear()
): any[] {

    // Create array starting at "start" and ending at "end" in values
    let allYears = []
    const categoryDefaultColor:string = category[0].objectConfig.color
    const categoryDefaultId:string = category[0].objectConfig.objectId

    for (let y = start; y <= end; y++) { 
        allYears.push(y) 
    }

    // Create dictionary containing years and associated data
    let yearDataDict = category.reduce((dict, item) => {
        dict[item.label] = item
        return dict
    }, {}) // empty dict

    let lastValidYear: any = {}

    let result: any[] = allYears.map(year => {
        let currentYear = yearDataDict[year]
        if (currentYear) {
            lastValidYear = currentYear
            return currentYear
        } else {
            let emptyYear = createChartObject(year.toString(), 0, lastValidYear?.objectConfig?.objectId || categoryDefaultId, lastValidYear?.objectConfig?.color || categoryDefaultColor)
            return emptyYear
        }
    })

    return result
}

/**
 * This function updates the population of each entry to match the cumulative total up until that point
 * @param category 
 * @returns 
 */
export function transformToCumulative(category: any[]): any[] {

    let totalPopulation = 0

    // update all values to be cumulative to that point
    const result = category.map((details: any) => {
        let { label, population, objectConfig: { objectId, color } } = details
        totalPopulation += population
        return createChartObject(label, totalPopulation, objectId, color)
    })

    return result
}

/**
 * Casting some data points into a Chart Object
 * @param label label for display
 * @param population number count of item
 * @param objectId array of strings/numbers i.e. ['1987', 'Saccharomyces cerevisiae', 4]
 * @param color color for display
 * @returns an object in the correct format for the chart
 */
export function createChartObject<ChartObjectInterface>(
    label: string | number = '', 
    population: number = 0, 
    objectId: string | number [], 
    color: string
) {
    return {
        label,
        population,
        objectConfig: {
            objectId,
            color
        }
    }
}

/**
 * Convert LOUD_CASE string to Proper Case
 * @param s Is a "LOUD_CASE" string
 * @returns a proper case string i.e. "Loud Case"
 */
export function loudToTitleCase(s: String) {
    return s.replace(/_/g, " ").toLowerCase().replace(
        /\w\S*/g,
        function (txt: string) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    )
}

/**
 * The rcsb-charts library is a layer between rcsb-statistical-charts and the 3rd party chart.js library. chart.js's native behavior is for the chart to fill the horizontal container. rcsb-charts requires a "constWidth" and "constHeight" setting in order to display the chart. So this function will measure the screen and kind of act as CSS to determine the width of the charting portino of the app.
 * @param width - the size of the screen
 * @returns number - the size the chart should be
 */
export function determineChartWidth(width: number) {
    let result
    if (width > 1000) { result = width - 200 }
    else { result = width }
    // console.log(width, result)
    return 700 || result
}