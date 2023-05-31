import * as React from "react";
import {createRoot} from "react-dom/client";
import {RcsbSearchMetadata} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchMetadata";
import { ReturnType } from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {ChartType} from "@rcsb/rcsb-charts/lib/RcsbChartComponent/ChartConfigInterface";
import {
    AggregationType,
    Service,
    Type
} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";

import {FacetPlot} from "../StatsPlot/FacetPlot";

const node: HTMLElement|null = document.getElementById("chart-element");
if(node==null)
    throw `ERROR: HTML element not found`

const root = createRoot(node);
root.render(<FacetPlot
    firstDim={{
        filter: {
            type: Type.Terminal,
            service: Service.Text,
            parameters: {
                attribute: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.Type.path,
                operator: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.Type.operator.ExactMatch,
                value:  RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.Type.enum.CATH
            }
        },
        facets: [{
            filter: {
                type: Type.Terminal,
                service: Service.Text,
                parameters: {
                    attribute: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.AnnotationLineage.Depth.path,
                    operator: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.AnnotationLineage.Depth.operator.Equals,
                    value: 3
                }
            },
            facets: [{
                name: `FACET/${RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.AnnotationLineage.Name.path}/${RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.Type.enum.CATH}`,
                attribute: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.AnnotationLineage.Name.path,
                aggregation_type: AggregationType.Terms
            }]
        }]
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