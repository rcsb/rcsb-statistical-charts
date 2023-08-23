import {RcsbSearchMetadata} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchMetadata";
import {AggregationType, Interval, Service, Type} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {ChartConfigInterface, ChartType} from "@rcsb/rcsb-charts/lib/RcsbChartComponent/ChartConfigInterface";
import {StatsFacetInterface} from "./StatsFacetInterface";

const globalChartConfig: ChartConfigInterface = {
    chartDisplayConfig: {
        constWidth: 800,
        constHeight: 600
    },
    tooltipText: (d)=>{
        return d.id?.join(" ");
    }
}

const RELEASE_DATE: StatsFacetInterface = {
    facetName: "Release date",
    facetId: "release_date",
    chartType: ChartType.histogram,
    facet:{
        name: `FACET/${RcsbSearchMetadata.RcsbAccessionInfo.InitialReleaseDate.path}`,
        aggregation_type: AggregationType.DateHistogram,
        attribute: RcsbSearchMetadata.RcsbAccessionInfo.InitialReleaseDate.path,
        interval: Interval.Year,
        min_interval_population: 0
    },
    chartConfig: {
        ...globalChartConfig
    }
};

const EXPL_METHOD: StatsFacetInterface = {
    facetName: "Experimental Method",
    facetId: "expl_method",
    chartType: ChartType.barplot,
    facet: {
        name: `FACET/${RcsbSearchMetadata.Exptl.Method.path}`,
        aggregation_type: AggregationType.Terms,
        attribute: RcsbSearchMetadata.Exptl.Method.path
    },
    chartConfig: {
        ...globalChartConfig,
        mostPopulatedGroups: 3
    }
};

const ORGANISM: StatsFacetInterface = {
    facetName: "Organism",
    facetId: "organism",
    chartType: ChartType.barplot,
    facet:{
        name: `FACET/${RcsbSearchMetadata.RcsbEntitySourceOrganism.NcbiScientificName.path}`,
        aggregation_type: AggregationType.Terms,
        attribute: RcsbSearchMetadata.RcsbEntitySourceOrganism.NcbiScientificName.path,
    },
    chartConfig: {
        ...globalChartConfig,
        mostPopulatedGroups: 10
    }
};

const ADD_ORGANISM: StatsFacetInterface = {
    facetName: "Organism",
    facetId: "organism",
    facet:{
        name: `FACET/${RcsbSearchMetadata.RcsbEntitySourceOrganism.NcbiScientificName.path}`,
        aggregation_type: AggregationType.Terms,
        attribute: RcsbSearchMetadata.RcsbEntitySourceOrganism.NcbiScientificName.path,
        max_num_intervals: 5
    }
};

const CATH_DOMAIN: StatsFacetInterface = {
    facetName: "CATH domains",
    facetId: "cath_domains",
    chartType: ChartType.barplot,
    facet: {
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
            }]
        }]
    },
    chartConfig: {
        ...globalChartConfig,
        mostPopulatedGroups: 10
    }
};

const ADD_CATH_DOMAIN: StatsFacetInterface = {
    facetName: "CATH domains",
    facetId: "cath_domains",
    facet: {
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
                max_num_intervals: 5
            }]
        }]
    }
};

export const FACET_STORE: StatsFacetInterface[] = [
    RELEASE_DATE,
    EXPL_METHOD,
    ORGANISM,
    CATH_DOMAIN
];

export const ADDITIONAL_FACET_STORE: StatsFacetInterface[] = [
    {facetId: "none", facetName: "None"},
    EXPL_METHOD,
    ADD_ORGANISM,
    ADD_CATH_DOMAIN
];