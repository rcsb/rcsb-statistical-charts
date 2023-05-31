import * as React from "react";
import {createRoot} from "react-dom/client";
import {RcsbSearchMetadata} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchMetadata";
import {
    AggregationType,
    Interval
} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import { ReturnType, Service } from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {ChartType} from "@rcsb/rcsb-charts/lib/RcsbChartComponent/ChartConfigInterface";

import {FacetPlot} from "../StatsPlot/FacetPlot";
import {buildAttributeQuery} from "@rcsb/rcsb-search-tools/lib/SearchQueryTools/SearchQueryTools";

const node: HTMLElement|null = document.getElementById("chart-element");
if(node==null)
    throw `ERROR: HTML element not found`

const root = createRoot(node);
root.render(<FacetPlot
    searchQuery={buildAttributeQuery({
        attribute: RcsbSearchMetadata.Exptl.Method.path,
        value: RcsbSearchMetadata.Exptl.Method.enum["X-RAY DIFFRACTION"],
        operator: RcsbSearchMetadata.Exptl.Method.operator.ExactMatch,
        service: Service.Text
    })}
    firstDim={{
        name: `FACET/${RcsbSearchMetadata.RcsbAccessionInfo.InitialReleaseDate.path}`,
        aggregation_type: AggregationType.DateHistogram,
        attribute: RcsbSearchMetadata.RcsbAccessionInfo.InitialReleaseDate.path,
        interval: Interval.Year,
        min_interval_population: 0
    }}
    secondDim={{
        name: `FACET/${RcsbSearchMetadata.RcsbEntitySourceOrganism.NcbiScientificName.path}`,
        aggregation_type: AggregationType.Terms,
        attribute: RcsbSearchMetadata.RcsbEntitySourceOrganism.NcbiScientificName.path,
        min_interval_population: 20
    }}
    chartType={ChartType.histogram}
    returnType={ReturnType.Entry}
    chartConfig={{
        tooltipText: (d)=>{
            return d.id?.join(" ");
        },
        chartDisplayConfig: {
            constWidth: 1200,
            constHeight: 600
        },
        domainMinValue: 1975,
    }}
/>);