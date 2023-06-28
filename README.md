# rcsb-statistical-charts

RCSB Statistical Charts is an open-source library that includes different tools to plot statistics of RCSB PDB structure features. 

### Node Module Installation
`npm install @rcsb/rcsb-statistical-charts`

### Folder organization
- `src` module source code
  - `StatsPlot` React component for charting RCSB PDB data
  - `StatsPlotInterface` Configuration for charting distribution of RCSB PDB features
  - `examples` Charting examples
- `test` Unit tests

### Testing
Different testing examples are available in the `src/examples` folder
- `npm install`
- `npm run devServer`

Go to:

- `http://localhost:9000/ExplMethods.html`
- `http://localhost:9000/XrayMethod.html`
- `http://localhost:9000/OrganismXray.html`
- `http://localhost:9000/OrganismExplMethod.html`
- `http://localhost:9000/CathExplMethod.html`
- `http://localhost:9000/OrganismCath.html`

### Statistical app proof of concept
The statistical app (`src/StatsApp/StatsApp.tsx`) is a proof of concept for RCSB statistics. 

Testing available
- `npm install`
- `npm run devServer`

Go to:
- `http://localhost:9000/StatsApp.html`

### Interfaces
- Main interface
```typescript
interface StatsPlotInterface {
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
```
- Main React component `props: StatsPlotInterface`
```typescript jsx
  <StatsPlot
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
/>
```


Contributing
---
All contributions are welcome. Please, make a pull request or open an issue.

License
---

The MIT License

    Copyright (c) 2023 - now, RCSB PDB and contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

