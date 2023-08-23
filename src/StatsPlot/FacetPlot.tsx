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

const viewSettingList = ["annual", "cumulative"]
// const menuStyle = {width: 200, height: '100%', outline: '1px solid red', textAlign: 'center'}
// const headerStyle = {width:'50%'}

export function FacetPlot(props: FacetPlotInterface) {

    const [data, setData] = useState<ChartObjectInterface[][]>([]);
    const [viewSetting, setViewSetting] = useState<string>(viewSettingList[0]);
    const [categoriesToHide, setCategoriesToHide] = useState<string[]>([])

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
        chartFacets(props).then(data=> setData(data));
    }, [props]);

    const showButtonChecked = categoriesToHide.length === 0
    const hideButtonChecked = categoriesToHide.length === categories.length

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

    console.log("dataToDisplay", dataToDisplay)
    if( viewSetting === 'cumulative' ){
        const isNestedArray = Array.isArray(dataToDisplay[0]) // Check if 2d array
        if (isNestedArray){
            dataToDisplay = dataToDisplay.map(transformCategoryToCumulative) // map outer array, transform inner array
        }else{
            dataToDisplay = transformCategoryToCumulative(dataToDisplay) // transform array
        }
    }


    return (
        <div className='FacetPlot Component' style={{display:'flex', flexDirection:'row', overflow: 'hidden' }}>
            {/* Chart */}
            <ChartComponent
                data={dataToDisplay}
                chartComponentImplementation={props.chartType == ChartType.histogram ? ChartJsHistogramComponent : ChartJsBarComponent}
                dataProvider={props.chartType == ChartType.histogram ? new HistogramChartDataProvider() : new BarChartDataProvider()}
                chartConfig={props.chartConfig}
            />
            {/* Sidebar */}
            <div style={{ outline: '1px solid red', textAlign: 'center'}}>

                {/* Annual or Cumulative Setting */}
                <select onChange={(e)=>{setViewSetting(e.target.value)}} value={viewSetting}>
                    {viewSettingList.map(item => <option value={item}>{item}</option>)}
                </select>

                {/* Hide/Show All Categories */}
                <div>
                    <div>
                        <label>Show All:</label><input type="checkbox" checked={showButtonChecked} onChange={(e) => {
                            if (e.target.checked) showAllCategories()
                        }}></input>
                    </div>
                    <div>
                        <label>Hide All:</label><input type="checkbox" checked={hideButtonChecked} onChange={(e) => {
                            if (e.target.checked) hideAllCategories()
                        }}></input>
                    </div>
                </div>
                {/* Hide/Show Categories */}
                { categories.map(createCategoryHTML) }
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
            border: `3px solid ${c.color}`,
            color: c.color,
            backgroundColor: isHidden ? 'transparent' : c.color,
            width: `15px`,
            height: `15px`,
            borderRadius: `50%`,
            display: `inline-block`,
            cursor: `pointer`,   
        }
    
        return (
            <div className="categories.map" key={index}>
                {c.name} ({c.count}) {c.color} 
                <label style={labelStyle} htmlFor={`${index}`} onClick={()=>toggleCategory(c.name)} > </label>
                <input name={`${index}`} style={checkboxStyle} type="checkbox" checked={!isHidden} onChange={()=>toggleCategory(c.name)} />
            </div>
        )
    }

    // @#@#@# start here tomorrow
    function transformCategoryToCumulative(category:any[]):any[]{

        function createChartObject<ChartObjectInterface>(label: string|number, population:number, objectId:any, color:string){
            return {
                label,
                population,
                objectConfig:{
                    objectId,
                    color
                }
            }
        }
        
        // iterate over outer level

        let totalPopulation = 0

        return category.map((details:any, index:any, arr:any) =>{
            // console.log("details, index", details, index)
            let {label, population, objectConfig: {objectId, color}} = details
            // const previousDetails = arr[index - 1]
            // console.log(`total for ${label}`, population, previousDetails?.population, population + previousDetails?.population)
            totalPopulation += population
            return createChartObject(label, totalPopulation, objectId, color)
        })

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

    console.log("buildMultiFacet", props.secondDim, clonedFacet)

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

const COLORS: string[] = [
    "#718de8",
    "#2fad30",
    "#e71f8a",
    "#f60505",
    "#a27206",
    "#60e5bd",
    "#85ff34",
    "#ea6c05"
]