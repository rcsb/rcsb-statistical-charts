import * as React from "react";
import {act, render, screen} from '@testing-library/react';
import {RcsbSearchMetadata} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchMetadata";
import {
    AggregationType,
    Interval
} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import { ReturnType } from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {ChartType} from "@rcsb/rcsb-charts/lib/RcsbChartComponent/ChartConfigInterface";

import {StatsPlot} from "../src/StatsPlot/StatsPlot";

describe('<StatsPlot> test', ()=>{
    test('count nodes[role=presentation] and <path/> elements', async ()=>{
        let container: HTMLElement = document.createElement("div");
        await act(()=>{
            const component = render(<StatsPlot
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
                chartType={ChartType.histogram}
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
