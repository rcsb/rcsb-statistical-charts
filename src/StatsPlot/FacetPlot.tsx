import * as React from "react";
import {useEffect, useState} from "react";

import {ChartFacetPlotInterface, FacetPlotInterface} from "./FacetPlotInterface";
import {SearchQueryType, SearchRequestType} from "@rcsb/rcsb-search-tools/lib/SearchQueryTools/SearchQueryInterfaces";
import {
    buildAttributeQuery,
    buildMultiFacet,
    buildRequestFromSearchQuery
} from "@rcsb/rcsb-search-tools/lib/SearchQueryTools/SearchQueryTools";
import {RcsbSearchMetadata} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchMetadata";
import {Service} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {
    AttributeFacetType,
    FilterFacetType,
    SearchBucketFacetType
} from "@rcsb/rcsb-search-tools/lib/SearchParseTools/SearchFacetInterface";
import {cloneDeep} from "lodash";
import {ChartComponent} from "@rcsb/rcsb-charts/lib/RcsbChartComponent/ChartComponent";

import {ChartObjectInterface, ChartType} from "@rcsb/rcsb-charts/lib/RcsbChartComponent/ChartConfigInterface";
import {SearchClient} from "@rcsb/rcsb-search-tools/lib/SearchClient/SearchClient";
import {QueryResult} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchResultInterface";
import {getFacetsFromSearch} from "@rcsb/rcsb-search-tools/lib/SearchParseTools/SearchFacetTools";
import {HistogramChartDataProvider} from "@rcsb/rcsb-charts/lib/RcsbChartDataProvider/HistogramChartDataProvider";
import {BarChartDataProvider} from "@rcsb/rcsb-charts/lib/RcsbChartDataProvider/BarChartDataProvider";
import {
    ChartJsBarComponent
} from "@rcsb/rcsb-charts/lib/RcsbChartImplementations/ChatJsImplementations/ChartJsBarComponent";
import {
    ChartJsHistogramComponent
} from "@rcsb/rcsb-charts/lib/RcsbChartImplementations/ChatJsImplementations/ChartJsHistogramComponent";
import {getPalettes} from '../utils/IMB_COLORS'

const viewSettingList = ["annual", "cumulative"]
// const menuStyle = {width: 200, height: '100%', outline: '1px solid red', textAlign: 'center'}
// const headerStyle = {width:'50%'}

export function FacetPlot(props: FacetPlotInterface) {

    const [data, setData] = useState<ChartObjectInterface[][]>([]);
    const [viewSetting, setViewSetting] = useState<string>(viewSettingList[0]);
    const [categoriesToHide, setCategoriesToHide] = useState<string[]>([])

    const isHistogram = (props.chartType == ChartType.histogram)
    const is2dData = props.secondDim ? true : false

    // let categoryMap:any = {};
    let categories: any[] = createCategoryListFromData(data)

    // Hide all, show all, toggle specific categories in the chart
    function hideAllCategories() {setCategoriesToHide(categories.map(item => item.name))}
    function showAllCategories(){setCategoriesToHide([])}
    function toggleCategory(category:string){
        if(categoriesToHide.includes(category)){
            setCategoriesToHide(categoriesToHide.filter(item => item !== category))
        } else {
            setCategoriesToHide([...categoriesToHide, category])
        }
    }

    useEffect(()=>{
        setData([]);
        setViewSetting(viewSettingList[0])
        chartFacets(props).then(data=> setData(data));
    }, [props]);

    let dataToDisplay = data.map(
        dataSet => { 
            return dataSet.filter(
                dataPoint => {
                    // Filter out any categories that are to be hidden
                    return !categoriesToHide.includes(dataPoint?.objectConfig?.objectId[1])
                }
            )
        }
    )

    // Mutate dataToDisplay when cumulative
    if(viewSetting === 'cumulative' && isHistogram){
        if (is2dData) { // 2 array dimensions
            // Find earliest year and latest year
            let [start, end]: number[] = findStartAndEndYearsForAll(dataToDisplay)
            // Add empty data points for all years between
            if (start ?? end ?? true) {
                const dataWithEmptyYears: any[] = dataToDisplay.map(category => addEmptyYears(category, start, end))
                dataToDisplay = dataWithEmptyYears.map(category => transformToCumulative(category))
            }
        } else { // 1 array dimension

            let [start, end] = findStartAndEndYears(dataToDisplay)
            if (start ?? end ?? true) {
                const dataWithEmptyYears: any[] = addEmptyYears(dataToDisplay, start, end)
                dataToDisplay = transformToCumulative(dataWithEmptyYears)
            }
        }
    }

    const chartType = isHistogram
        ? ChartJsHistogramComponent
        : ChartJsBarComponent
    const chartDataProvider = isHistogram
        ? new HistogramChartDataProvider()
        : new BarChartDataProvider()

    return (
        <div className='FacetPlot Component' style={{display:'flex', flexDirection:'row', overflow: 'hidden' }}>
            {/* Chart */}
            <ChartComponent
                data={dataToDisplay}
                chartComponentImplementation={chartType}
                dataProvider={chartDataProvider}
                chartConfig={props.chartConfig}
            />
            {/* Sidebar */}
            <div style={{ outline: '1px solid red', textAlign: 'left'}}>

                {/* Annual or Cumulative Setting */}
                {
                    isHistogram && 
                    <div className="d-flex justify-content-center">
                        <div className="btn-group">
                            {viewSettingList.map(item => {
                                const btnClass = item === viewSetting ? 'btn-primary' : 'btn-light'
                                return <div className={`btn ${btnClass}`} key={item} onClick={()=>setViewSetting(item)}>{item}</div>
                            })}
                        </div>
                    </div>
                }

                {/* Hide/Show All Categories */}
                {
                    isHistogram &&
                    is2dData &&
                    <div className="d-flex justify-content-center">
                        <div className="btn-group m-1">
                            <div className={`btn btn-success`} onClick={(e) => showAllCategories()}>
                                Show All
                            </div>
                            <div className={`btn btn-warning`} onClick={(e) => hideAllCategories()}>
                                Hide All
                            </div>
                        </div>
                    </div>
                }

                {/* Hide/Show Categories */}
                <div style={{height:"500px", overflowY: "auto", padding: "10px 0"}}>
                    { categories.map(createCategoryHTML) }
                </div>
            </div>
        </div>
    );

    // Helper function
    function createCategoryHTML(c:CategoryListType, index:number){
        let isHidden = categoriesToHide.includes(c.name)
        const checkboxStyle = {
            display: 'none'                             
        }
        const labelStyle = {
            position: 'absolute',
            top: 0,
            right: 0,
            border: `3px solid ${c.color}`,
            marginLeft: `5px`,
            color: c.color,
            backgroundColor: isHidden ? 'transparent' : c.color,
            width: `15px`,
            height: `15px`,
            borderRadius: `50%`,
            display: `inline-block`,
            cursor: `pointer`, 
            verticalAlign: `middle`,
        } as React.CSSProperties

        const categoryContainerStyle = {
            position: `relative`,
            width: `calc(100% - 15px)`
        }as React.CSSProperties

        const categoryStyle = {
            color: c.color,  
            textOverflow: `ellipsis`, 
            width: `calc(100% - 15px)`
        } as React.CSSProperties
    
        return (
            <div className='categories.map' style={categoryContainerStyle} key={index}>
                <div style={categoryStyle} onClick={()=>toggleCategory(c.name)} >
                    {c.name} 
                    <label style={labelStyle}> </label>
                </div>
                <input name={`${index}`} style={checkboxStyle} type='checkbox' checked={!isHidden} onChange={()=>toggleCategory(c.name)} />
            </div>
        )
    }

}



export function ChartFacetPlot(props: ChartFacetPlotInterface) {

    const [data, setData] = useState<ChartObjectInterface[][]>([]);

    useEffect(()=>{
        chartFacets(props).then(data=> setData(data));
    }, [props]);

    return (
        <div className="ChartFacetPlot Component">
            <ChartComponent
                data={data}
                chartComponentImplementation={props.chartComponent}
                dataProvider={props.dataProvider}
                chartConfig={props.chartConfig}
            />
        </div>
    );

}

async function chartFacets(props: Omit<FacetPlotInterface, "chartType">): Promise<ChartObjectInterface[][]>{

    // Destructure RcsbSearchMetadata
    const { RcsbEntryInfo: {
        StructureDeterminationMethodology: {
            path, 
            enum: {experimental}, 
            operator: {ExactMatch}
        }
    }} = RcsbSearchMetadata

    // Create search query
    const searchQuery: SearchQueryType = props.searchQuery ?? buildAttributeQuery({
        attribute: path,
        value: experimental,
        operator: ExactMatch,
        service: Service.Text
    });

    // Copy the firstDim
    const clonedFacet: AttributeFacetType | FilterFacetType = cloneDeep(props.firstDim);

    if(props.secondDim) // Mutate facet if 2nd dimension
        buildMultiFacet(props.secondDim, clonedFacet); // recursively adds 

    // Create request query
    const searchRequest: SearchRequestType = buildRequestFromSearchQuery(
        searchQuery,
        props.returnType,
        {
            facets: [clonedFacet]
        }
    );

    // Go get the data
    const queryResults: QueryResult|null = await SearchClient.get().request(searchRequest);
    if(!queryResults)
        return [[]];

    // buckets is the actual data [{data:[{label: "word", population: 100}, {... repeats}}]}]
    const buckets = getFacetsFromSearch(queryResults);
    const secondDim = props.secondDim;
    if(secondDim)
        // combine first and 2nd datasets together
        return drillFacets(buckets.filter(f=>f.name == getFacetName(secondDim)));
    else
        return [buckets[0].data.map(d=>({
            ...d,
            objectConfig: {
                objectId: [d.label, d.population]
            }
        }))];
}

function drillFacets(facets: SearchBucketFacetType[]): ChartObjectInterface[][] {
    const labelSet: Set<string> = new Set();
    const domList: string[] = [];
    const valueMap: Map<string,Map<string,number>> = new Map();
    facets.forEach(facet=>{
        // Add to dom list (text)
        domList.push(facet.labelPath[0]);
        // Go through all datapoints and add to labelSet (once, and unique)
        facet.data.forEach(dataPoint=>{
            labelSet.add(dataPoint.label.toString());
            // Also add to valueMap if not there
            if(!valueMap.has(facet.labelPath[0]))
                valueMap.set(facet.labelPath[0], new Map());
            // Get that entry? Set to a value?
            valueMap.get(facet.labelPath[0])?.set(dataPoint.label.toString(), dataPoint.population);
        });
    });

    const labelList: string[] = Array.from(labelSet);
    const result: ChartObjectInterface[][] =  [];
    labelList.forEach((label,index)=>{
        const row: ChartObjectInterface[] = [];
        // Go through dom items (text)
        domList.forEach(domItem=>{
            if(valueMap.get(domItem)?.get(label))
                // creates a dataset for the chart to use maybe?
                row.push({
                    label: domItem,
                    population: valueMap.get(domItem)?.get(label) ?? 0,
                    objectConfig: {
                        color: COLORS[index % COLORS.length],
                        objectId: [domItem, label, valueMap.get(domItem)?.get(label)]
                    }
                })
        });
        result.push(row);
    });
    return result;
}

function getFacetName(facet: AttributeFacetType | FilterFacetType): string {
    if('name' in facet)
        return facet.name
    if(!facet.facets || facet.facets.length != 1)
        throw new Error("Multiple facets are not allowed");
    return getFacetName(facet.facets[0]);
}

function createCategoryListFromData(data:ChartObjectInterface[][]):CategoryListType[]{
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
function findStartAndEndYearsForAll(categories: any[]): number[] {
    let allYears: number[] = categories.map(category => findStartAndEndYears(category)).flat()
    if (allYears.length === 0) return []
    let start = Math.min(...allYears)
    let end = Math.max(...allYears)
    return [start, end]
}

function findStartAndEndYears(category: any[]): number[] {
    let allYears: number[] = category.map(c => Number(c.label))
    if (allYears.length === 0) return []
    let start = Math.min(...allYears)
    let end = Math.max(...allYears)
    return [start, end]
}

function addEmptyYears(category: any[], start: number = 1800, end: number = new Date().getFullYear()
): any[] {

    // Create array starting at "start" and ending at "end" in values
    let allYears = []
    for (let y = start; y <= end; y++) { allYears.push(y) }
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
            let emptyYear = createChartObject(year.toString(), 0, lastValidYear?.objectConfig?.objectId || [], lastValidYear?.objectConfig?.color || "")
            return emptyYear
        }
    })

    return result
}

function transformToCumulative(category: any[]): any[] {

    let totalPopulation = 0

    // update all values to be cumulative to that point
    const result = category.map((details: any) => {
        let { label, population, objectConfig: { objectId, color } } = details
        totalPopulation += population
        return createChartObject(label, totalPopulation, objectId, color)
    })

    return result
}

function createChartObject<ChartObjectInterface>(label: string | number = '', population: number = 0, objectId: any = [], color: string = '') {
    return {
        label,
        population,
        objectConfig: {
            objectId,
            color
        }
    }
}

type CategoryListType = {
    name: string,
    count: number,
    color: string
};
type CategoryDictItemType = {
    year: number,
    count: number,
    color: string
};
type CategoryDictType = {
    [key: string]:CategoryDictItemType
};

// Array argument is for brightness across colors
let COLORS:string[] = getPalettes([7,5,3])
// const COLORS: string[] = [
//     '#F05039',
//     '#A8B6CC',
//     '#E57A77',
//     '#7CA1CC',
//     '#EEBAB4',
//     '#3D65A5',
//     '#1F449C',
// ]