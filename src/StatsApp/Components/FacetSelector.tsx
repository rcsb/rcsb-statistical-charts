import * as React from "react";
import {useEffect} from "react";
import {fromEvent, map, Observer} from 'rxjs';
import {StatsFacetInterface} from "../StatsFacetInterface";

export type SelectorRoleType = "main" | "additional";
export interface FacetSelectorProps {
  componentId: string;
  facets: StatsFacetInterface[];
  selectorRole: SelectorRoleType;
  observer: Observer<{facet:StatsFacetInterface;role:SelectorRoleType;}>;
}

export function FacetSelector(props: FacetSelectorProps){

    const selectEl = React.useRef<HTMLSelectElement>(null);

    useEffect(()=>{
        if(selectEl.current)
            fromEvent<React.ChangeEvent<HTMLInputElement>>(selectEl.current, "change").pipe(
                map(event=> ({
                    facet: props.facets[parseInt(event.target.value)],
                    role: props.selectorRole
                }))
            ).subscribe(props.observer);
    }, []);

    return (<>
        <div style={{display:"inline-block", marginRight:15, fontFamily:"Arial, Helvetica, sans-serif", fontSize:12, color:"#666"}}>
            {props.selectorRole.toUpperCase()} ATTRIBUTE:
        </div>
        <select style={{marginRight:20, outline:"none"}} ref={selectEl} id={`facet-selector-${props.componentId}`} >
        {
            props.facets.map((facet, n)=><option value={n.toString()} key={facet.facetId}>{facet.facetName}</option>)
        }
        </select>
    </>);

}