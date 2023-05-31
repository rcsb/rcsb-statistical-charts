import * as React from "react";
import {act, render, screen} from '@testing-library/react';
import {RcsbSearchMetadata} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchMetadata";
import {
    AggregationType,
    Interval
} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import { ReturnType } from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";

import {ChartFacetPlot} from "../src/StatsPlot/FacetPlot";
import {HistogramChartDataProvider} from "@rcsb/rcsb-charts/lib/RcsbChartDataProvider/HistogramChartDataProvider";
import {
    VictoryHistogramChartComponent
} from "@rcsb/rcsb-charts/lib/RcsbChartImplementations/VictoryChartImplementations/VictoryHistogramChartComponent";

describe('<ChartFacetPlot> Released Expl method test', ()=>{
    test('count nodes[role=presentation] and <path/> elements', async ()=>{
        let container: HTMLElement = document.createElement("div");
        await act(()=>{
            const component = render(<ChartFacetPlot
                firstDim={{
                    name: `FACET/${RcsbSearchMetadata.RcsbAccessionInfo.InitialReleaseDate.path}`,
                    aggregation_type: AggregationType.DateHistogram,
                    attribute: RcsbSearchMetadata.RcsbAccessionInfo.InitialReleaseDate.path,
                    interval: Interval.Year,
                    min_interval_population: 0
                }}
                secondDim={{
                    name: `FACET/${RcsbSearchMetadata.Exptl.Method.path}`,
                    aggregation_type: AggregationType.Terms,
                    attribute: RcsbSearchMetadata.Exptl.Method.path
                }}
                chartComponent={VictoryHistogramChartComponent}
                dataProvider={new HistogramChartDataProvider()}
                returnType={ReturnType.Entry}
            />);
            container = component.container;
        });
        const node = await screen.findAllByRole("presentation");
        expect(node.length).toBeGreaterThan(600);
        const paths  = container.getElementsByTagName("path")
        expect(paths.length).toBeGreaterThan(600);
    });
})
