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
import { COLORBLIND, NON_COLORBLIND, getPalette } from '../utils/colors'
import {
    createCategoryListFromData,
    findStartAndEndYearsForAll,
    addEmptyYears,
    transformToCumulative,
    loudToTitleCase,
    // determineChartWidth
} from './facetPlotHelpers'
import { CategoryListType } from './FacetPlotInterface'
import Button from 'react-bootstrap/Button';

import Icon from '../StatsApp/Components/Icons'

import csvHelper from '../utils/csvHelper.js'
import saveTargetAsImage from '../utils/saveChart.js'
import {
    addScreenResizeListener,
} from '../utils/resizeMonitor.js'
import StatsAppModal from "../StatsApp/Components/StatsAppModal";
import chartInfo from './chartInfo'

const {log} = console;

const CHART_FILE_NAME: string = 'RCSB Statistics Chart'
const viewSettingList: string[] = ["Released Annually", "Cumulative"]

// CSS Styles
const labelStyle = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    left: 0,
    marginLeft: `5px`,
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

// FacetPlot Component
export function FacetPlot(props: FacetPlotInterface) {
    const { resetOptions = function () { }, firstDimName = "", secondDimName = "" } = props // clears user input
    const [data, setData] = useState<ChartObjectInterface[][]>([]); // RCSB data
    const [viewSetting, setViewSetting] = useState<string>(viewSettingList[0]); // annual or cumulative view
    const [categoriesToHide, setCategoriesToHide] = useState<string[]>([])
    
    // Prevent scroll when chart is full screen
    const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
    document.body.style.overflow = isFullScreen ? 'hidden' : 'auto'

    // Manage Color Picker Modal and selection
    const [modalOpenName, setModalOpenName] = useState<string>("")
    const [chosenColorPaletteName, setChosenColorPaletteName] = useState<string>(Object.keys(ALL_COLORS)[0]);
    const chosenPalette: string[] = ALL_COLORS[chosenColorPaletteName] || ["#000000"]

    // Element to save as image ( with function saveTargetAsImage() )
    const chartRef = useRef(null)

    // Element to measure for width
    const chartContainer: any = useRef();
    const chartContainerWidth = chartContainer?.current?.offsetWidth || null
    log("chartContainerWidth", chartContainerWidth)

    const modifiedChartConfig = cloneDeep(props.chartConfig)
    // // const modifiedChartWidth = determineChartWidth(chartContainerWidth)
    // if (modifiedChartConfig?.chartDisplayConfig?.constWidth) {
    //     log("modifiedChartConfig", chartContainerWidth)
    //     modifiedChartConfig.chartDisplayConfig.constWidth = chartContainerWidth
    // }

    // Check Chart type
    const isHistogram: boolean = (props.chartType == ChartType.histogram)
    const is2dData: boolean = props.secondDim ? true : false


    const categories: any[] = createCategoryListFromData(data)

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

    function screenSize(w: number, h: number) { console.log(w, h) }

    useEffect(() => {
        setData([]);
        setViewSetting(viewSettingList[0])
        chartFacets(props).then(data => setData(data));
        setCategoriesToHide([])
        setIsFullScreen(false)
        setModalOpenName("")
    }, [props]);

    useEffect(() => {
        addScreenResizeListener(screenSize);
    }, [])

    let dataToDisplay:ChartObjectInterface[][] = data.map(
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
    if (viewSetting === 'Cumulative') {
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

    const fadeHeight = '30px';
    const categoryStyle: any = { height: '300px', overflowY: 'auto', padding: '30px 0', position: 'relative', paddingBottom: fadeHeight, marginBottom: '20px' }
    const whiteFadeBottom: any = {
        left: 0, position: 'absolute', bottom: 0, height: fadeHeight, width: 'calc(100% - 10px)', background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)', zIndex: 100, pointerEvents: 'none'
    }
    const whiteFadeTop: any = {
        ...whiteFadeBottom,
        top: 0, bottom: 'unset', background: 'linear-gradient(to top, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)'
    }

    const fullScreenStyle = { position: 'fixed', height: '100vh', width: '100vw', top: 0, left: 0, backgroundColor: 'white', zIndex: '1000', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }
    let containerStyle = { fontSize: `12px` }
    if (isFullScreen) { containerStyle = { ...containerStyle, ...fullScreenStyle } }


    // apply colors to dataset
    dataToDisplay = dataToDisplay.map((category, index) => {
        const color:string = chosenPalette[index % chosenPalette.length]
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
                    <LegendComponent data={dataToDisplay} width={props?.chartConfig?.chartDisplayConfig?.constWidth} />
                </div>

                {/* Chart Buttons */}
                <div style={{ width: `50px`, height: `100%`, textAlign: `center`, margin: `10px` }}>
                    <div className='mb-1'><Icon.FullScreen onClick={() => setIsFullScreen(!isFullScreen)} /></div>
                    {
                        props?.resetOptions &&
                        <div className='mb-1'><Icon.Rotate onClick={() => { resetOptions(); showAllCategories(); }} /></div>
                    }
                    <div className='mb-1'><Icon.CameraLens onClick={() => saveTargetAsImage(chartRef.current, CHART_FILE_NAME)} /></div>
                    <div className='mb-1'><Icon.LetterI onClick={() => { setModalOpenName('info'); }} /></div>
                    <div className='mb-1'><Icon.GridBox onClick={() => { setModalOpenName('grid') }} /></div>
                    <div className='mb-1'><a href={csvHelper.getSampleCSV()} target='_blank'><Icon.Download /></a></div>
                    <div className='mb-1'><Icon.ChartDisplay onClick={() => alert('Toggle Linear / Log Scale (WIP)')} /></div>
                    <div className='mb-1'><Icon.ColorWheel onClick={() => setModalOpenName('color')} /></div>
                </div>

                {/* @#@#@# what is this? */}
                {/* <a href="http://sstatic.net/stackexchange/img/logos/so/so-logo.png" download="logo.png"></a> */}


                {/* Sidebar */}
                <div className="p-3 flex-grow-1" style={{ textAlign: 'left', width: `100%`, maxWidth: `300px`, borderLeft: `2px solid #D1D0D0` }}>

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

                    {/* Hide all, show all buttons */}
                    {
                        isHistogram &&
                        is2dData &&
                        <div>
                            <Button variant='primary' style={{ fontSize: `12px` }} className='py-0 px-1' onClick={showAllCategories}>Show All</Button>
                            <Button variant='warning' style={{ fontSize: `12px` }} className='py-0 px-1 mx-1' onClick={hideAllCategories}>Hide All</Button>
                        </div>
                    }

                    {/* Annual, Cumulative buttons */}
                    <p className="mt-3" style={{ fontWeight: `bold` }}>Data Set</p>
                    <div>
                        {
                            isHistogram &&
                            viewSettingList.map(s =>
                                createRadioButton(s, viewSetting === s, () => { setViewSetting(s) })
                            )
                        }
                    </div>

                    <p className="mt-3" style={{ fontWeight: `bold` }}>Filter Data</p>
                    <select onSelect={(e) => { log("selecting", e.target) }} >
                        <option selected disabled value={0}>Source Organism</option>
                        <option value={1}>Homo Sapiens</option>
                        <option value={2}>Homo Erectus</option>
                        <option value={3}>Homo Habilis</option>
                    </select>

                </div>
            </div>

            {/* Close Full Screen Mode */}
            { isFullScreen && <span style={closeFullScreenStyle} onClick={() => setIsFullScreen(false)}><Icon.CloseX /></span> }

            {/* Color Picker Modal */}
            {
                modalOpenName === 'color' &&
                <StatsAppModal show={true} handleClose={() => { setModalOpenName('') }} title={`Color Picker`} >
                    Choose a palette: ({loudToTitleCase(chosenColorPaletteName)})
                    {/* Normal Color Entries */}
                    {Object.entries(NON_COLORBLIND).map((entry: any) => {
                        const [paletteName, colors] = entry;
                        return <div style={{display:'flex', alignItems: 'center', flexWrap: 'wrap'}} onClick={() => {
                            setChosenColorPaletteName(paletteName)
                        }}><input style={{margin: '5px'}} type='checkbox' checked={chosenColorPaletteName === paletteName} /> {colors.map((c: string) => createColorSpan(c))}</div>
                    })}
                    {/* Colorblind Entries */}
                    {Object.keys(COLORBLIND).length && "Colorblind:"}
                    {Object.entries(COLORBLIND).map((entry: any) => {
                        const [paletteName, colors] = entry;
                        return <div style={{display:'flex', alignItems: 'center', flexWrap: 'wrap'}} onClick={() => {
                            setChosenColorPaletteName(paletteName)
                        }}><input style={{margin: '5px'}} type='checkbox' checked={chosenColorPaletteName === paletteName} /> {colors.map((c: string) => createColorSpan(c))}</div>
                    })}
                </StatsAppModal>
            }

            {/* Info Modal */}
            {
                modalOpenName === 'info' &&
                getChartInfo(firstDimName, secondDimName) &&
                <StatsAppModal show={true} handleClose={() => { setModalOpenName('') }} title={getChartInfo(firstDimName, secondDimName).title} footer={getChartInfo(firstDimName, secondDimName).footer} >
                    {getChartInfo(firstDimName, secondDimName).body}
                </StatsAppModal>
            }
        </div>
    );

    // Helper functions ///////////////////////////////////////////////////////////////////////////////////////////
    function getChartInfo(d1:string, d2:string){
        const key = d1 !== d2  && d2 !== "None" ? `${d1} - ${d2}` : d1
        const result = chartInfo[key] || {title:"",body:<></>,footer:<></>}
        return result
    }
    
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
                }
            }))];
        console.log("result", result)
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

    function LegendComponent(props: any) {
        const data: any = props.data
        // const width:string = `${props.width}px`
        const DEFAULT_ITEM_LIMIT = 10
        const DEFAULT_COLOR = "#999999"
        const [itemLimit, setItemLimit] = useState(DEFAULT_ITEM_LIMIT);
        const legendItemHTML = data.slice(0, itemLimit).map((item: any, index: number) => legendItem(item[0], index))

        return (
            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', flexWrap: 'wrap', width: props.width, marginLeft: 'auto' }}>
                {legendItemHTML}
                <br />
                {itemLimit < data.length && <a href="" onClick={increaseItemLimit}>See More</a>}&nbsp;
                {itemLimit !== DEFAULT_ITEM_LIMIT && data?.length > DEFAULT_ITEM_LIMIT && <a href="" onClick={resetItemLimit}>See Less</a>}&nbsp;
                {data.length > DEFAULT_ITEM_LIMIT && `(${Math.min(itemLimit, data.length)} of ${data.length})`}
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

// Constants

const ALL_COLORS: ColorPallettes = {
    IBM_COLORS: getPalette('IBM_COLORS'),
    HTML_COLORS: getPalette('HTML_COLORS'),
    BLUE_TO_RED: getPalette('BLUE_TO_RED'),
    DUTCH_FIELD: getPalette('DUTCH_FIELD'),
    ORANGE_TO_PURPLE: getPalette('ORANGE_TO_PURPLE'),
    RETRO_METRO: getPalette('RETRO_METRO'),
    RIVER_NIGHTS: getPalette('RIVER_NIGHTS'),
    SALMON_TO_AQUA: getPalette('SALMON_TO_AQUA'),
    SPRING_PASTELS: getPalette('SPRING_PASTELS'),
    BANG_WONG: getPalette('BANG_WONG'),
    PAUL_TOL: getPalette('PAUL_TOL'),
}

interface ColorPallettes{
    [propName: string]: string[];
}