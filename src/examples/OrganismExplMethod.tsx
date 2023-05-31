import * as React from "react";
import {createRoot} from "react-dom/client";
import {RcsbSearchMetadata} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchMetadata";
import {
    AggregationType
} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import { ReturnType } from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {ChartType} from "@rcsb/rcsb-charts/lib/RcsbChartComponent/ChartConfigInterface";

import {FacetPlot} from "../StatsPlot/FacetPlot";

const node: HTMLElement|null = document.getElementById("chart-element");
if(node==null)
    throw `ERROR: HTML element not found`

const root = createRoot(node);
root.render(<FacetPlot
    firstDim={{
        name: `FACET/${RcsbSearchMetadata.RcsbEntitySourceOrganism.NcbiScientificName.path}`,
        aggregation_type: AggregationType.Terms,
        attribute: RcsbSearchMetadata.RcsbEntitySourceOrganism.NcbiScientificName.path,
        min_interval_population: 1
    }}
    secondDim={{
        name: `FACET/${RcsbSearchMetadata.Exptl.Method.path}`,
        aggregation_type: AggregationType.Terms,
        attribute: RcsbSearchMetadata.Exptl.Method.path
    }}
    chartType={ChartType.barplot}
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
        mostPopulatedGroups: 10
    }}
/>);