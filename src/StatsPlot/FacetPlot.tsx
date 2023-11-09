import * as React from "react";
import { useEffect, useState, useRef } from "react";

// import { ChartFacetPlotInterface, FacetPlotInterface } from "./FacetPlotInterface";
import { FacetPlotInterface } from "./FacetPlotInterface";
import { SearchQueryType, SearchRequestType } from "@rcsb/rcsb-search-tools/lib/SearchQueryTools/SearchQueryInterfaces";
import {
    buildAttributeQuery,
    buildMultiFacet,
    buildRequestFromSearchQuery
} from "@rcsb/rcsb-search-tools/lib/SearchQueryTools/SearchQueryTools";
import { RcsbSearchMetadata } from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchMetadata";
import { Service } from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {
    AttributeFacetType,
    FilterFacetType,
    SearchBucketFacetType
} from "@rcsb/rcsb-search-tools/lib/SearchParseTools/SearchFacetInterface";
import { cloneDeep } from "lodash";
import { ChartComponent } from "@rcsb/rcsb-charts/lib/RcsbChartComponent/ChartComponent";

import { ChartObjectInterface, ChartType } from "@rcsb/rcsb-charts/lib/RcsbChartComponent/ChartConfigInterface";
import { SearchClient } from "@rcsb/rcsb-search-tools/lib/SearchClient/SearchClient";
import { QueryResult } from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchResultInterface";
import { getFacetsFromSearch } from "@rcsb/rcsb-search-tools/lib/SearchParseTools/SearchFacetTools";
import { HistogramChartDataProvider } from "@rcsb/rcsb-charts/lib/RcsbChartDataProvider/HistogramChartDataProvider";
import { BarChartDataProvider } from "@rcsb/rcsb-charts/lib/RcsbChartDataProvider/BarChartDataProvider";
import {
    ChartJsBarComponent
} from "@rcsb/rcsb-charts/lib/RcsbChartImplementations/ChatJsImplementations/ChartJsBarComponent";
import {
    ChartJsHistogramComponent
} from "@rcsb/rcsb-charts/lib/RcsbChartImplementations/ChatJsImplementations/ChartJsHistogramComponent";
import { getPalette } from '../utils/colors'
import {
    createCategoryListFromData,
    findStartAndEndYearsForAll,
    // findStartAndEndYears,
    addEmptyYears,
    transformToCumulative
} from './facetPlotHelpers'
import { CategoryListType } from './FacetPlotInterface'
import Button from 'react-bootstrap/Button';

import Icon from '../StatsApp/Components/Icons'

import csvHelper from '../utils/csvHelper.js'
import saveTargetAsImage from '../utils/saveChart.js'
import {
    addMonitorResizeListener,
    // removeMonitorResizeListener
} from '../utils/resizeMonitor.js'
import StatsAppModal from "../StatsApp/Components/StatsAppModal";

const CHART_FILE_NAME: string = 'RCSB Statistics Chart'
const viewSettingList: string[] = ["Released Annually", "Cumulative"]
// const menuStyle = {width: 200, height: '100%', outline: '1px solid red', textAlign: 'center'}
// const headerStyle = {width:'50%'}

const labelStyle = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    left: 0,
    // border: `3px solid ${c.color}`,
    marginLeft: `5px`,
    // color: c.color,
    // backgroundColor: isHidden ? 'transparent' : c.color,
    width: `15px`,
    height: `15px`,
    borderRadius: `3px`,
    display: `inline-flex`,
    justifyContent: `center`,
    alignItems: `center`,
    cursor: `pointer`,
    verticalAlign: `middle`,
} as React.CSSProperties

const categoryContainerStyle = {
    position: `relative`,
    width: `calc(100% - 15px)`
} as React.CSSProperties

const categoryLineStyle = {
    // color: c.color,  
    textOverflow: `ellipsis`,
    width: `calc(100% - 15px)`,
    paddingLeft: '30px'
} as React.CSSProperties

const closeFullScreenStyle = {
    position: 'fixed',
    top: `20px`,
    left: `50vw`,
    transform: `translateX(-50%)`,
    borderRadius: '50%',
    boxShadow: '0 0 5px black',
    display: 'flex',
    padding: '10px'
} as React.CSSProperties

export function FacetPlot(props: FacetPlotInterface) {
    const { resetOptions = function () { } } = props
    const [data, setData] = useState<ChartObjectInterface[][]>([]);
    const [viewSetting, setViewSetting] = useState<string>(viewSettingList[0]);
    const [categoriesToHide, setCategoriesToHide] = useState<string[]>([])
    const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
    const [isColorPickerOpen, setIsColorPickerOpen] = useState<boolean>(false);
    const [chosenColorPaletteName, setChosenColorPaletteName] = useState<string>('IBM_COLORS');

    const chosenPalette: string[] = ALL_COLORS[chosenColorPaletteName]

    // Prevent scroll when chart is full screen
    if (isFullScreen) {
        document.body.style.overflow = 'hidden'
    }
    else {
        document.body.style.overflow = 'auto'
    }

    console.log("isFullScreen", isFullScreen, "bodyOverflow", document.body.style.overflow)

    const chartRef = useRef(null)
    const chartContainer: any = useRef();
    const chartContainerWidth = chartContainer?.current?.offsetWidth || null
    console.log("chartContainerWidth", chartContainerWidth)

    // if (mainFacet?.chartConfig?.chartDisplayConfig?.constWidth) mainFacet.chartConfig.chartDisplayConfig.constWidth = determineChartWidth(windowInnerWidth)

    const modifiedChartConfig = cloneDeep(props.chartConfig)
    const derivedChartWidth = determineChartWidth(chartContainerWidth)
    if (modifiedChartConfig?.chartDisplayConfig?.constWidth) {
        modifiedChartConfig.chartDisplayConfig.constWidth = derivedChartWidth
    }

    const isHistogram: boolean = (props.chartType == ChartType.histogram)
    const is2dData: boolean = props.secondDim ? true : false



    // let categoryMap:any = {};
    let categories: any[] = createCategoryListFromData(data)

    // Hide all, show all, toggle specific categories in the chart
    function hideAllCategories() { setCategoriesToHide(categories.map(item => item.name)) }
    function showAllCategories() { setCategoriesToHide([]) }
    function toggleCategory(category: string) {
        if (categoriesToHide.includes(category)) {
            setCategoriesToHide(categoriesToHide.filter(item => item !== category))
        } else {
            setCategoriesToHide([...categoriesToHide, category])
        }
    }

    function monitorSize(w: number, h: number) { console.log(w, h) }

    useEffect(() => {
        setData([]);
        setViewSetting(viewSettingList[0])
        // @#@#@#
        chartFacets(props).then(data => setData(data));
        addMonitorResizeListener(monitorSize);
        setCategoriesToHide([])
        setIsFullScreen(false)
        setIsColorPickerOpen(false)
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
    // @#@#@# refactor into a single dataToCumulative function
    if (viewSetting === 'Cumulative') {
        console.log("isCumulative")
        let [start, end]: number[] = findStartAndEndYearsForAll(dataToDisplay)
        // Add empty data points for all years between
        if (start ?? end ?? true) {
            const dataWithEmptyYears: any[] = dataToDisplay.map(category => addEmptyYears(category, start, end))
            dataToDisplay = dataWithEmptyYears.map(category => transformToCumulative(category))
        }
    }

    const chartType = isHistogram
        ? ChartJsHistogramComponent
        : ChartJsBarComponent
    const chartDataProvider = isHistogram
        ? new HistogramChartDataProvider()
        : new BarChartDataProvider()

    const fadeHeight = '40px';
    const categoryStyle: any = { height: '300px', overflowY: 'auto', padding: '30px 0', position: 'relative', paddingBottom: fadeHeight }
    const whiteFadeBottom: any = {
        left: 0, position: 'absolute', bottom: 0, height: fadeHeight, width: 'calc(100% - 10px)', background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)', zIndex: 100, pointerEvents: 'none'
    }
    const whiteFadeTop: any = {
        ...whiteFadeBottom,
        top: 0, bottom: 'unset', background: 'linear-gradient(to top, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)'
    }

    // @#@#@#
    // const chartWidth = props?.chartConfig?.chartDisplayConfig?.constWidth || '225px'
    const chartWidth = derivedChartWidth || '225px'
    const fullScreenStyle = { position: 'fixed', height: '100vh', width: '100vw', top: 0, left: 0, backgroundColor: 'white', zIndex: '1000', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }
    let containerStyle = { fontSize: `12px` }
    if (isFullScreen) { containerStyle = { ...containerStyle, ...fullScreenStyle } }


    // apply colors to dataset
    dataToDisplay = dataToDisplay.map((category, index) => {
        const color:string = chosenPalette[index % chosenPalette.length]
        // const color:string = "black"
        return category.map((item) => {
            if(item?.objectConfig?.color) item.objectConfig.color = color
            return item
        })
    })

    return (
        <div style={containerStyle} ref={chartRef}>
            <h3>Title of Chart</h3>
            <div className='FacetPlot Component' style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap' }}>
                {/* Chart */}
                <div ref={chartContainer}>
                    <ChartComponent
                        data={dataToDisplay}
                        chartComponentImplementation={chartType}
                        dataProvider={chartDataProvider}
                        chartConfig={modifiedChartConfig}
                    />
                    <LegendComponent data={dataToDisplay} width={derivedChartWidth} />
                </div>

                {/* Chart Buttons */}
                <div style={{ width: `50px`, height: `100%`, textAlign: `center`, margin: `10px` }}>
                    <div className='mb-1'><Icon.FullScreen onClick={() => setIsFullScreen(!isFullScreen)} /></div>
                    {
                        props?.resetOptions &&
                        <div className='mb-1'><Icon.Rotate onClick={() => { resetOptions(); showAllCategories(); }} /></div>
                    }
                    <div className='mb-1'><Icon.CameraLens onClick={() => saveTargetAsImage(chartRef.current, CHART_FILE_NAME)} /></div>
                    <div className='mb-1'><Icon.LetterI onClick={() => alert("Information About Data (WIP)")} /></div>
                    <div className='mb-1'><Icon.GridBox onClick={() => alert("Display Data Table (WIP)")} /></div>
                    <div className='mb-1'><a href={csvHelper.getSampleCSV()} target="_blank"><Icon.Download /></a></div>
                    <div className='mb-1'><Icon.ChartDisplay onClick={() => alert("Toggle Linear / Log Scale (WIP)")} /></div>
                    <div className='mb-1'><Icon.ColorWheel onClick={() => setIsColorPickerOpen(!isColorPickerOpen)} /></div>
                </div>

                {/* @#@#@# what is this? */}
                {/* <a href="http://sstatic.net/stackexchange/img/logos/so/so-logo.png" download="logo.png"></a> */}


                {/* Sidebar */}
                <div className="p-3 flex-grow-1" style={{ textAlign: 'left', width: `100%`, maxWidth: `300px`, borderLeft: `2px solid #D1D0D0` }}>

                    {/* Annual or Cumulative Setting */}
                    {/* {
                        isHistogram && 
                        <div className="d-flex justify-content-center">
                            <div className="btn-group">
                                {viewSettingList.map(item => {
                                    const btnClass = item === viewSetting ? 'btn-primary' : 'btn-light'
                                    return <div className={`btn ${btnClass}`} key={item} onClick={()=>setViewSetting(item)}>{item}</div>
                                })}
                            </div>
                        </div>
                    } */}


                    <h6 style={{ fontWeight: `bold` }}>Data Options</h6>
                    {/* <hr className="hr hr-blurry" /> */}

                    {/* All Categories */}
                    <div style={{ position: 'relative' }}>
                        <div style={whiteFadeTop}></div>
                        <div style={categoryStyle}>
                            {categories.map(createCategoryCheckbox)}
                        </div>
                        <div style={whiteFadeBottom}></div>
                    </div>
                    {
                        isHistogram &&
                        is2dData &&
                        <div>
                            <Button variant='primary' style={{ fontSize: `12px` }} className='py-0 px-1' onClick={showAllCategories}>Show All</Button>
                            <Button variant='warning' style={{ fontSize: `12px` }} className='py-0 px-1 mx-1' onClick={hideAllCategories}>Hide All</Button>
                        </div>
                        // [
                        //     createRadioButton('Show All', false, showAllCategories),
                        //     createRadioButton('Hide All', false, hideAllCategories)
                        // ]
                    }
                    {/* <hr className="hr hr-blurry w-100" /> */}


                    <p className="mt-3" style={{ fontWeight: `bold` }}>Data Set</p>
                    <div>
                        {/* Annual, Cumulative buttons */}
                        {
                            isHistogram &&
                            viewSettingList.map(s =>
                                createRadioButton(s, viewSetting === s, () => { setViewSetting(s) })
                            )
                        }
                    </div>
                    {/* <hr className="hr hr-blurry w-100" /> */}
                    <p style={{ fontWeight: `bold` }}>Filter Data</p>
                    <select onSelect={(e) => { console.log("selecting", e.target) }} >
                        <option selected disabled value={0}>Source Organism</option>
                        <option value={1}>Homo Sapiens</option>
                        <option value={2}>Homo Erectus</option>
                        <option value={3}>Homo Habilis</option>
                    </select>

                    {/* @#@#@# this section lets you see the color palette more clearly */}
                    {/* <div style={{display:'flex', flexWrap: 'wrap'}}>
                        {COLORS.map(c => <div style={{height: '25px', width: '50px', backgroundColor: c, color: 'black', textShadow: '1px 1px 0 white'}}>{c}</div>)}
                    </div> */}

                </div>
            </div>
            {/* Close Full Scren Mode */}
            {
                isFullScreen &&
                <span style={closeFullScreenStyle} onClick={() => setIsFullScreen(false)}><Icon.CloseX /></span>
            }
            {/* <StatsAppModal showModal={true}>COLOR PICKER</StatsAppModal> */}
            {
                isColorPickerOpen &&
                <StatsAppModal show={isColorPickerOpen} handleClose={() => { setIsColorPickerOpen(false) }} title={`Color Picker`} >
                    Choose a palette: ({loudToTitleCase(chosenColorPaletteName)})
                    {Object.entries(ALL_COLORS).map((entry: any) => {
                        const [paletteName, colors] = entry;
                        return <div style={{display:'flex', alignItems: 'center', flexWrap: 'wrap'}} onClick={() => {
                            setChosenColorPaletteName(paletteName)
                        }}><input style={{margin: '5px'}} type='checkbox' checked={chosenColorPaletteName === paletteName} /> {colors.map((c: string) => createColorSpan(c))}</div>
                    })}
                </StatsAppModal>
            }
        </div>
    );

    // Helper function ///////////////////////////////////////////////////////////////////////////////////////////
    function createColorSpan(color: string) {
        return <div style={{ display: 'inline-block', minHeight: '15px', minWidth: '15px', backgroundColor: color }}></div>
    }

    function createCategoryCheckbox(c: CategoryListType, index: number) {
        let isHidden: boolean = categoriesToHide.includes(c.name)

        let labelStyleCopy = {
            ...labelStyle,
            backgroundColor: isHidden ? 'transparent' : c.color,
            border: `3px solid ${c.color}`,
            color: c.color
        }

        return (
            <div className='categories.map' style={categoryContainerStyle} key={index}>
                <div style={categoryLineStyle} onClick={() => toggleCategory(c.name)} >
                    {/* This is the checkbox */}
                    <label style={labelStyleCopy}>
                        {/* This is the checkmark */}
                        <span style={{ color: "white" }}>{!isHidden && '✓'}</span>
                    </label>
                    {/* Text */}
                    {c.name}
                </div>
            </div>
        )
    }
    // function createCheckbox(text:string, isChecked:boolean = false, onClickFn: React.MouseEventHandler<HTMLElement> = ()=>{}){
    //     let labelStyleCopy = {
    //         ...labelStyle, 
    //         backgroundColor: isChecked ? `blue` : `transparent`,
    //         border: `3px solid blue`,
    //         color: `blue`
    //     }
    //     return (
    //         <div className='categories.map' style={categoryContainerStyle}>
    //             <div style={categoryLineStyle} onClick={onClickFn} >
    //                 {/* This is the checkbox */}
    //                 <label style={labelStyleCopy}>
    //                     {/* This is the checkmark */}
    //                     <span style={{color:"white"}}>{isChecked && `✓`}</span>
    //                 </label>
    //                 {/* Text */}
    //                 {text} 
    //             </div>
    //         </div>
    //     )
    // }

    function createRadioButton(text: string, isChecked: boolean = false, onClickFn: React.MouseEventHandler<HTMLElement> = () => { }) {
        let labelStyleCopy = {
            ...labelStyle,
            backgroundColor: isChecked ? `blue` : `transparent`,
            border: `3px solid blue`,
            color: `blue`,
            borderRadius: `50%`
        }
        return (
            <div className='categories.map' style={categoryContainerStyle}>
                <div style={categoryLineStyle} onClick={onClickFn} >
                    {/* This is the radio button */}
                    <label style={labelStyleCopy}></label>
                    {/* Text */}
                    {text}
                </div>
            </div>
        )
    }

    async function chartFacets(props: Omit<FacetPlotInterface, "chartType">): Promise<ChartObjectInterface[][]> {

        // Destructure RcsbSearchMetadata
        const { RcsbEntryInfo: {
            StructureDeterminationMethodology: {
                path,
                enum: { experimental },
                operator: { ExactMatch }
            }
        } } = RcsbSearchMetadata

        // Create search query
        const searchQuery: SearchQueryType = props.searchQuery ?? buildAttributeQuery({
            attribute: path,
            value: experimental,
            operator: ExactMatch,
            service: Service.Text
        });

        // Copy the firstDim
        const clonedFacet: AttributeFacetType | FilterFacetType = cloneDeep(props.firstDim);

        if (props.secondDim) // Mutate facet if 2nd dimension
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
        const queryResults: QueryResult | null = await SearchClient.get().request(searchRequest);
        if (!queryResults)
            return [[]];

        // buckets is the actual data [{data:[{label: "word", population: 100}, {... repeats}}]}]
        const buckets = getFacetsFromSearch(queryResults);
        const secondDim = props.secondDim;
        let result;
        if (secondDim)
            // combine first and 2nd datasets together
            result =  drillFacets(buckets.filter(f => f.name === getFacetName(secondDim)));
        else
            result =  [buckets[0].data.map((d:any, index:number) => ({
                ...d,
                objectConfig: {
                    objectId: [d.label, d.population],
                    // @#@#@# color for single dimension
                    // color: chosenPalette[index % chosenPalette.length]
                }
            }))];
        console.log("chartFacets() result", result)
        return result
    }

    function drillFacets(facets: SearchBucketFacetType[]): ChartObjectInterface[][] {
        const labelSet: Set<string> = new Set();
        const domList: string[] = [];
        const valueMap: Map<string, Map<string, number>> = new Map();

        facets.forEach(facet => {
            // Add to dom list (text)
            domList.push(facet.labelPath[0]);
            // Go through all datapoints and add to labelSet (once, and unique)
            facet.data.forEach(dataPoint => {
                labelSet.add(dataPoint.label.toString());
                // Also add to valueMap if not there
                if (!valueMap.has(facet.labelPath[0]))
                    valueMap.set(facet.labelPath[0], new Map());
                // Get that entry? Set to a value?
                valueMap.get(facet.labelPath[0])?.set(dataPoint.label.toString(), dataPoint.population);
            });
        });

        const labelList: string[] = Array.from(labelSet);
        const result: ChartObjectInterface[][] = [];

        labelList.forEach((label, index) => {
            const row: ChartObjectInterface[] = [];
            // Go through dom items (text)
            domList.forEach(domItem => {
                if (valueMap.get(domItem)?.get(label))
                    // creates a dataset for the chart to use maybe?
                    row.push({
                        label: domItem,
                        population: valueMap.get(domItem)?.get(label) ?? 0,
                        objectConfig: {
                            color: chosenPalette[index % chosenPalette.length],
                            objectId: [domItem, label, valueMap.get(domItem)?.get(label)]
                        }
                    })
            });
            result.push(row);
        });
        return result;
    }

    function getFacetName(facet: AttributeFacetType | FilterFacetType): string {
        if ('name' in facet)
            return facet.name
        if (!facet.facets || facet.facets.length != 1)
            throw new Error("Multiple facets are not allowed");
        return getFacetName(facet.facets[0]);
    }

    // @#@#@# Should probably move to it's own file 
    function LegendComponent(props: any) {
        const data: any = props.data
        // const width:string = `${props.width}px`
        const DEFAULT_ITEM_LIMIT = 10
        const DEFAULT_COLOR = "#999999"
        // console.log("LegendComponent", DEFAULT_ITEM_LIMIT, DEFAULT_COLOR)
        // console.log("dataToDisplay", data)
        const [itemLimit, setItemLimit] = useState(DEFAULT_ITEM_LIMIT);
        // const labelSet = labels.slice(0,itemLimit)
        const legendItemHTML = data.slice(0, itemLimit).map((item: any, index: number) => legendItem(item[0], index))
        // const style = {display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap'}
        // const itemStyle = {}

        return (
            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', flexWrap: 'wrap', width: props.width, marginLeft: 'auto' }}>
                {legendItemHTML}
                <br />
                {itemLimit < data.length && <a href="" onClick={increaseItemLimit}>See More</a>}&nbsp;
                {itemLimit !== DEFAULT_ITEM_LIMIT && data?.length > DEFAULT_ITEM_LIMIT && <a href="" onClick={resetItemLimit}>See Less</a>}&nbsp;
                ({Math.min(itemLimit, data.length)} of {data.length})
            </div>
        )

        function legendItem(item: any, index: number) {
            let label = item?.objectConfig?.objectId[1]
            if (!label) return <></>
            if (typeof label === 'string') { label = label.toLowerCase() }

            return <div style={{ display: 'inline-flex', textTransform: 'capitalize', margin: '.5em' }} key={index}>
                <div
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '1.5em', width: '50px', marginRight: '.5em', backgroundColor: item?.objectConfig?.color || DEFAULT_COLOR }}>
                </div>
                {label}
            </div>
        }
        function increaseItemLimit(e: any) { e.preventDefault(); setItemLimit(itemLimit + DEFAULT_ITEM_LIMIT) }
        function resetItemLimit(e: any) { e.preventDefault(); setItemLimit(DEFAULT_ITEM_LIMIT) }
    }
}







// Array argument is for brightness across colors
const ALL_COLORS: any = {
    IBM_COLORS: getPalette('IBM_COLORS'),
    HTML_COLORS: getPalette('HTML_COLORS'),
    BLUE_TO_RED: getPalette('BLUE_TO_RED'),
    DUTCH_FIELD: getPalette('DUTCH_FIELD'),
    ORANGE_TO_PURPLE: getPalette('ORANGE_TO_PURPLE'),
    RETRO_METRO: getPalette('RETRO_METRO'),
    RIVER_NIGHTS: getPalette('RIVER_NIGHTS'),
    SALMON_TO_AQUA: getPalette('SALMON_TO_AQUA'),
    SPRING_PASTELS: getPalette('SPRING_PASTELS'),
}
// let COLORS:string[] = getPalette('HTML_COLORS')
// let COLORS:string[] = getPalette('BLUE_TO_RED')
// let COLORS:string[] = getPalette('DUTCH_FIELD')
// let COLORS:string[] = getPalette('ORANGE_TO_PURPLE')
// let COLORS:string[] = getPalette('RETRO_METRO')
// let COLORS:string[] = getPalette('RIVER_NIGHTS')
// let COLORS:string[] = getPalette('SALMON_TO_AQUA')
// let COLORS:string[] = getPalette('SPRING_PASTELS')


/**
 * The rcsb-charts library is a layer between rcsb-statistical-charts and the 3rd party chart.js library. chart.js's native behavior is for the chart to fill the horizontal container. rcsb-charts requires a "constWidth" and "constHeight" setting in order to display the chart. So this function will measure the screen and kind of act as CSS to determine the width of the charting portino of the app.
 * @param width - the size of the screen
 * @returns number - the size the chart should be
 */
function determineChartWidth(width: number) {
    let result
    if (width > 1000) { result = width - 200 }
    else { result = width }

    console.log(width, result)
    // @#@#@# this is a hardcoded value until I figure out the right combination of flex:wrap and sizes
    return 700
}
// if (mainFacet?.chartConfig?.chartDisplayConfig?.constWidth) mainFacet.chartConfig.chartDisplayConfig.constWidth = determineChartWidth(windowInnerWidth)

function loudToTitleCase(s: String) {
    return s.replace(/_/g, " ").toLowerCase().replace(
        /\w\S*/g,
        function (txt: string) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    )
}

