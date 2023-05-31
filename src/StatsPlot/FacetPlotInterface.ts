import {SearchQueryType} from "@rcsb/rcsb-search-tools/lib/SearchQueryTools/SearchQueryInterfaces";
import {ChartConfigInterface, ChartType} from "@rcsb/rcsb-charts/lib/RcsbChartComponent/ChartConfigInterface";
import {AttributeFacetType, FilterFacetType} from "@rcsb/rcsb-search-tools/lib/SearchParseTools/SearchFacetInterface";
import { ReturnType } from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {
    AbstractChartImplementationType
} from "@rcsb/rcsb-charts/lib/RcsbChartImplementations/AbstractChartImplementation";
import {ChartDataProviderInterface} from "@rcsb/rcsb-charts/lib/RcsbChartDataProvider/ChartDataProviderInterface";

export interface FacetPlotInterface {
    /**Principal feature displayed in the chart defined as search Facet. It defines the magnitude associated to the domain axis*/
    firstDim: AttributeFacetType | FilterFacetType;
    /**Histogram, barplot or pie (display not implemented)*/
    chartType: ChartType;
    /**Granularity of the distribution: entry, polymer-entity, assembly, ...*/
    returnType: ReturnType;
    /**Second feature displayed in the chart defined as search Facet. It is displayed as stack bars*/
    secondDim?: AttributeFacetType | FilterFacetType;
    /**Search query to filter the structural data. Otherwise, the whole structural archive is used*/
    searchQuery?: SearchQueryType;
    /**Configuration for the chart*/
    chartConfig?: ChartConfigInterface;
}

export interface ChartFacetPlotInterface {
    /**Principal feature displayed in the chart defined as search Facet. It defines the magnitude associated to the domain axis*/
    firstDim: AttributeFacetType | FilterFacetType;
    /**Component to render the plot*/
    chartComponent: AbstractChartImplementationType;
    /**Chart data provider*/
    dataProvider: ChartDataProviderInterface;
    /**Granularity of the distribution: entry, polymer-entity, assembly, ...*/
    returnType: ReturnType;
    /**Second feature displayed in the chart defined as search Facet. It is displayed as stack bars*/
    secondDim?: AttributeFacetType | FilterFacetType;
    /**Search query to filter the structural data. Otherwise, the whole structural archive is used*/
    searchQuery?: SearchQueryType;
    /**Configuration for the chart*/
    chartConfig?: ChartConfigInterface;
}