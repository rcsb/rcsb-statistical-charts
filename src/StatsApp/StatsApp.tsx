import * as React from "react";
import {useState} from "react";
import {FacetSelector, SelectorRoleType} from "./Components/FacetSelector";
import {ADDITIONAL_FACET_STORE, FACET_STORE} from "./FacetStore";
import {FacetPlot} from "../StatsPlot/FacetPlot";
import {ReturnType} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {Observer} from "rxjs";
import {StatsFacetInterface} from "./StatsFacetInterface";

interface StatsAppState {
    mainAttribute: StatsFacetInterface;
    additionalAttribute?: StatsFacetInterface;
}
export function StatsApp(){

    const [state, setState] = useState<StatsAppState>({mainAttribute: FACET_STORE[0]});

    const selectorObserver: Observer<{facet:StatsFacetInterface;role:SelectorRoleType;}> = {
        next: (selector) => {
           setState( prevState=>{
               const newFacet = selector.facet;
               return {
                   ...prevState,
                   [selector.role == "main" ? "mainAttribute" : "additionalAttribute"]: newFacet
               }
           });
        },
        error: ()=>{},
        complete: ()=>{}
    };


    return state.mainAttribute.facet && state.mainAttribute.chartType ?
        <div>
            <div style={{marginBottom:20}}>
                <FacetSelector
                    componentId={"main-attribute"}
                    observer={selectorObserver}
                    selectorRole={"main"}
                    facets={FACET_STORE}
                />
                <FacetSelector
                    componentId={"additional-attribute"}
                    observer={selectorObserver}
                    selectorRole={"additional"}
                    facets={ADDITIONAL_FACET_STORE}
                />
            </div>
            <FacetPlot
                firstDim={state.mainAttribute.facet}
                secondDim={
                    state.mainAttribute.facetId != state.additionalAttribute?.facetId ? state.additionalAttribute?.facet : undefined
                }
                chartType={state.mainAttribute.chartType}
                returnType={ReturnType.Entry}
                chartConfig={state.mainAttribute.chartConfig}
            />
        </div> : <div/>;
}
