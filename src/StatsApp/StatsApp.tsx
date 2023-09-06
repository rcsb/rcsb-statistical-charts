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
        <div className="StatsApp Component container" ref={chartRef}>
            <div style={{marginBottom:20}}>
                {/* Select 1st Dataset */}
                <div className="row mb-1">
                    <div className="btn-group">
                        <div className={`btn`}>1st Dimension</div>
                        {
                            FACET_STORE.map((facet, index)=>{
                                let buttonClass = index === opt1 ? 'btn-primary' : 'btn-light'
                                return <div className={`btn ${buttonClass}`} onClick={()=>setOpt1(index)} key={index}>{facet.facetName}</div>
                            })
                        }
                    </div>
                </div>
                {/* Select 2nd Dataset */}
                <div className="row">
                    <div className="btn-group">
                        <div className={`btn`}>2nd Dimension</div>
                        {
                            ADDITIONAL_FACET_STORE.map((facet, index)=>{
                                let buttonClass = index === opt2 ? 'btn-primary' : 'btn-light'
                                return <div className={`btn ${buttonClass}`} onClick={()=>setOpt2(index)} key={index}>{facet.facetName}</div>
                            })
                        }
                    </div>
                </div>
                <span><button onClick={() => {saveTargetAsImage(chartRef.current, CHART_FILE_NAME)}}>Save</button> Chart as Image</span>
                
            </div>
            {/* Draw the Chart */}
            <FacetPlot
                firstDim={mainFacet.facet}
                secondDim={
                    mainFacet.facetId != additionalFacet?.facetId ? additionalFacet?.facet : undefined
                }
                chartType={mainFacet.chartType}
                returnType={ReturnType.Entry}
                chartConfig={{
                    ...mainFacet.chartConfig,
                    // @#@#@# sort of works, errors when clicking on background :(
                    // barClickCallback
                }}
            />
        </div>
    )
}

// @#@#@# not working correctly yet
// function barClickCallback(datum:any, data:any, event:any){
//     try{
//         console.log("barClickCallback", datum, data, event)
//     }catch(e){console.log("error", e)}
// }