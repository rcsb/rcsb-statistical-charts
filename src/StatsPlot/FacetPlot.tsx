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
import {
    createCategoryListFromData,
    findStartAndEndYearsForAll,
    // findStartAndEndYears,
    addEmptyYears,
    transformToCumulative
} from './facetPlotHelpers'
import {CategoryListType} from './FacetPlotInterface'

const viewSettingList = ["annual", "cumulative"]
// const menuStyle = {width: 200, height: '100%', outline: '1px solid red', textAlign: 'center'}
// const headerStyle = {width:'50%'}

export function FacetPlot(props: FacetPlotInterface) {

    const [data, setData] = useState<ChartObjectInterface[][]>([]);
    const [viewSetting, setViewSetting] = useState<string>(viewSettingList[0]);
    const [categoriesToHide, setCategoriesToHide] = useState<string[]>([])

    const isHistogram:boolean = (props.chartType == ChartType.histogram)
    const is2dData:boolean = props.secondDim ? true : false

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
    ).filter(arr => arr.length !== 0)

    // Mutate dataToDisplay when cumulative
    if(viewSetting === 'cumulative'){
        console.log("isCumulative")
        let [start, end]: number[] = findStartAndEndYearsForAll(dataToDisplay)
        // Add empty data points for all years between
        if (start ?? end ?? true) {
            const dataWithEmptyYears: any[] = dataToDisplay.map(category => addEmptyYears(category, start, end))
            dataToDisplay = dataWithEmptyYears.map(category => transformToCumulative(category))
        }
    }
    console.log("datatodisplay", dataToDisplay)

    const chartType = isHistogram
        ? ChartJsHistogramComponent
        : ChartJsBarComponent
    const chartDataProvider = isHistogram
        ? new HistogramChartDataProvider()
        : new BarChartDataProvider()

    return (
        <div className='FacetPlot Component' style={{display:'flex', flexDirection:'row', flexWrap: 'wrap', outline: '2px dotted red' }}>
            {/* Chart */}
            <div>
                <ChartComponent
                    data={dataToDisplay}
                    chartComponentImplementation={chartType}
                    dataProvider={chartDataProvider}
                    chartConfig={props.chartConfig}
                />
                <LegendComponent data={dataToDisplay} />
            </div>

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

    // Helper function ///////////////////////////////////////////////////////////////////////////////////////////
    function createCategoryHTML(c:CategoryListType, index:number){
        let isHidden:boolean = categoriesToHide.includes(c.name)
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

// @#@#@# Should probably move to it's own file 
function LegendComponent(props:any){
    const data:any = props.data
    const DEFAULT_ITEM_LIMIT = 20
    const DEFAULT_COLOR = "#999999"
    console.log("LegendComponent", DEFAULT_ITEM_LIMIT, DEFAULT_COLOR)
    console.log("dataToDisplay", data)
    const [itemLimit, setItemLimit] = useState(DEFAULT_ITEM_LIMIT);
    // const labelSet = labels.slice(0,itemLimit)
    const legendItemHTML = data.slice(0,itemLimit).map((item:any) => legendItem(item[0]))
    // const style = {display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap'}
    // const itemStyle = {}

    return (<div style={{display:'flex', justifyContent: 'center', alignItems:'center', flexWrap: 'wrap'}}>
        {legendItemHTML}
        <br/>
        {itemLimit < data.length && <div className="btn btn-success" onClick={increaseItemLimit}>See More...</div>}
        {itemLimit >= data.length && itemLimit > DEFAULT_ITEM_LIMIT && <div className="btn btn-warning" onClick={resetItemLimit}>Hide</div>}
    </div>)

    function legendItem(item:any) {
        let label = item?.objectConfig?.objectId[1]

        if(!label) return <></>
        if(typeof label === 'string'){label = label.toLowerCase()}

        return <div style={{display: 'inline-flex', textTransform: 'capitalize', margin: '.5em'}}>
            <div 
                style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '1.5em', width: '50px', marginRight: '.5em', backgroundColor: item?.objectConfig?.color || DEFAULT_COLOR}}>
            </div>
            {label}
        </div>
    }
    function increaseItemLimit() { setItemLimit(itemLimit + DEFAULT_ITEM_LIMIT) }
    function resetItemLimit() { setItemLimit(DEFAULT_ITEM_LIMIT) }
}



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