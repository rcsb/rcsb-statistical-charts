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

export function FacetPlot(props: FacetPlotInterface) {

    const [data, setData] = useState<ChartObjectInterface[][]>([]);

    useEffect(()=>{
        setData([]);
        chartFacets(props).then(data=> setData(data));
    }, [props]);

    return (<ChartComponent
        data={data}
        chartComponentImplementation={props.chartType == ChartType.histogram ? ChartJsHistogramComponent : ChartJsBarComponent}
        dataProvider={props.chartType == ChartType.histogram ? new HistogramChartDataProvider() : new BarChartDataProvider()}
        chartConfig={props.chartConfig}
    />);

}

export function ChartFacetPlot(props: ChartFacetPlotInterface) {

    const [data, setData] = useState<ChartObjectInterface[][]>([]);

    useEffect(()=>{
        chartFacets(props).then(data=> setData(data));
    }, [props]);

    return (<ChartComponent
        data={data}
        chartComponentImplementation={props.chartComponent}
        dataProvider={props.dataProvider}
        chartConfig={props.chartConfig}
    />);

}

async function chartFacets(props: Omit<FacetPlotInterface, "chartType">): Promise<ChartObjectInterface[][]>{

    const searchQuery: SearchQueryType = props.searchQuery ?? buildAttributeQuery({
        attribute: RcsbSearchMetadata.RcsbEntryInfo.StructureDeterminationMethodology.path,
        value: RcsbSearchMetadata.RcsbEntryInfo.StructureDeterminationMethodology.enum.experimental,
        operator: RcsbSearchMetadata.RcsbEntryInfo.StructureDeterminationMethodology.operator.ExactMatch,
        service: Service.Text
    });

    const facet: AttributeFacetType | FilterFacetType = cloneDeep(props.firstDim);
    if(props.secondDim)
        buildMultiFacet(props.secondDim, facet);

    const searchRequest: SearchRequestType = buildRequestFromSearchQuery(
        searchQuery,
        props.returnType,
        {
            facets: [facet]
        }
    );

    const queryResults: QueryResult|null = await SearchClient.get().request(searchRequest);
    if(!queryResults)
        return [[]];

    const buckets = getFacetsFromSearch(queryResults);
    const secondDim = props.secondDim;
    if(secondDim)
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
    facets.forEach(f=>{
        domList.push(f.labelPath[0]);
        f.data.forEach(d=>{
            labelSet.add(d.label.toString());
            if(!valueMap.has(f.labelPath[0]))
                valueMap.set(f.labelPath[0], new Map());
            valueMap.get(f.labelPath[0])?.set(d.label.toString(), d.population);
        });
    });

    const labelList: string[] = Array.from(labelSet);
    const out: ChartObjectInterface[][] =  [];
    labelList.forEach((label,n)=>{
        const row: ChartObjectInterface[] = [];
        domList.forEach(dom=>{
            if(valueMap.get(dom)?.get(label))
                row.push({
                    label: dom,
                    population: valueMap.get(dom)?.get(label) ?? 0,
                    objectConfig: {
                        color: COLORS[n % COLORS.length],
                        objectId: [dom, label, valueMap.get(dom)?.get(label)]
                    }
                })
        });
        out.push(row);
    });

    return out;
}

function getFacetName(facet: AttributeFacetType | FilterFacetType): string {
    if('name' in facet)
        return facet.name
    if(!facet.facets || facet.facets.length != 1)
        throw new Error("Multiple facets are not allowed");
    return getFacetName(facet.facets[0]);
}

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