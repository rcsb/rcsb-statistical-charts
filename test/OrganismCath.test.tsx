import {act, render, screen} from "@testing-library/react";
import {ChartType} from "@rcsb/rcsb-charts/lib/RcsbChartComponent/ChartConfigInterface";
import {RcsbSearchMetadata} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchMetadata";
import {
    AggregationType,
    Service,
    Type,
    ReturnType
} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {StatsPlot} from "../src/StatsPlot/StatsPlot";
import * as React from "react";

describe('<OrganismCath> test', ()=>{
    test('count nodes[role=presentation] and <path/> elements', async ()=>{
        let container: HTMLElement = document.createElement("div");
        await act(()=>{
            const component = render(<StatsPlot
                firstDim={{
                    name: `FACET/${RcsbSearchMetadata.RcsbEntitySourceOrganism.NcbiScientificName.path}`,
                    aggregation_type: AggregationType.Terms,
                    attribute: RcsbSearchMetadata.RcsbEntitySourceOrganism.NcbiScientificName.path,
                    max_num_intervals: 10
                }}
                secondDim={{
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
                            aggregation_type: AggregationType.Terms,
                            max_num_intervals: 10
                        }]
                    }]
                }}
                chartType={ChartType.barplot}
                returnType={ReturnType.Entry}
            />);
            container = component.container;
        });
        const node = await screen.findAllByRole("presentation");
        expect(node.length).toBeGreaterThan(400);
        const paths  = container.getElementsByTagName("path")
        expect(paths.length).toBeGreaterThan(400);
    });
});