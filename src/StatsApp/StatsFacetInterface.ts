import {AttributeFacetType, FilterFacetType} from "@rcsb/rcsb-search-tools/lib/SearchParseTools/SearchFacetInterface";
import {ChartConfigInterface, ChartType} from "@rcsb/rcsb-charts/lib/RcsbChartComponent/ChartConfigInterface";

export interface StatsFacetInterface {
    facetName: string;
    facetId: string;
    facet?: (AttributeFacetType | FilterFacetType);
    chartType?: ChartType;
    chartConfig?: ChartConfigInterface;
}