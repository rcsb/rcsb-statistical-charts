import * as React from "react";
import {useState, useRef} from "react";
import {ADDITIONAL_FACET_STORE, FACET_STORE} from "./FacetStore";
import {FacetPlot} from "../StatsPlot/FacetPlot";
import {ReturnType} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import saveTargetAsImage from '../utils/saveChart.js'

const CHART_FILE_NAME = 'RCSB Statistics Chart'

export function StatsApp(){

    const [opt1, setOpt1] = useState<number>(0);
    const [opt2, setOpt2] = useState<number>(0);
    const mainFacet = FACET_STORE[opt1];
    const additionalFacet = ADDITIONAL_FACET_STORE[opt2];
    const chartRef = useRef(null)

    if (!mainFacet.facet || !mainFacet.chartType) return null;

    return (
        <div className="StatsApp Component">
            <div style={{marginBottom:20}}>
                {/* Select 1st Dataset */}
                <label>1st Dimension</label>
                <select onChange={(e)=>setOpt1(Number(e.target.value))}>
                    {
                        FACET_STORE.map((facet, index)=>{
                            return <option key={index} value={index}>{facet.facetName}</option>
                        })
                    }
                </select>
                {/* Select 2nd Dataset */}
                <label>2nd Dimension</label>
                <select onChange={(e)=>setOpt2(Number(e.target.value))}>
                    {
                        ADDITIONAL_FACET_STORE.map((facet, index)=>{
                            return <option key={index} value={index}>{facet.facetName}</option>
                        })
                    }
                </select>
                <span><button onClick={() => {saveTargetAsImage(chartRef.current, CHART_FILE_NAME)}}>Save</button> Chart as Image</span>
                
            </div>
            {/* Draw the Chart */}
            <div ref={chartRef}>
                <FacetPlot
                    firstDim={mainFacet.facet}
                    secondDim={
                        mainFacet.facetId != additionalFacet?.facetId ? additionalFacet?.facet : undefined
                    }
                    chartType={mainFacet.chartType}
                    returnType={ReturnType.Entry}
                    chartConfig={mainFacet.chartConfig}
                />   
            </div>
        </div>
    )
}
