import {ChartObjectInterface} from "@rcsb/rcsb-charts/lib/RcsbChartComponent/ChartConfigInterface";
import {CategoryListType, CategoryDictType} from "./FacetPlotInterface"


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

// Helper functions for cumulative view ////////////////////////////////////////////////////////////
export function findStartAndEndYearsForAll(categories: any[]): number[] {
    
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

export function addEmptyYears(category: any[], start: number = 1800, end: number = new Date().getFullYear()
): any[] {

    // Create array starting at "start" and ending at "end" in values
    let allYears = []

    for (let y = start; y <= end; y++) { 
        allYears.push(y) 
    }

    // Create dictionary containing years and associated data
    let yearDataDict = category.reduce((p, n) => {
        p[n.label] = n
        return p
    }, {})

    let lastValidYear: any = {}

    let result: any[] = allYears.map(year => {
        let currentYear = yearDataDict[year]
        if (currentYear) {
            lastValidYear = currentYear
            return currentYear
        } else {
            let emptyYear = createChartObject(year.toString(), 0, lastValidYear?.objectConfig?.objectId, lastValidYear?.objectConfig?.color)
            return emptyYear
        }
    })

    return result
}

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

export function createChartObject<ChartObjectInterface>(
    label: string | number = '', 
    population: number = 0, 
    objectId: any = [], 
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
