import React from 'react'

export interface chartInfoInterface {
    [key:string]: chartInfoData
}

export interface chartInfoData {
    title: string,
    body:  React.ReactElement,
    footer: React.ReactElement
}

const chartInfo:chartInfoInterface = {
    example:{
        title: 'TITLE',
        body:  <div>TITLE BODY</div>,
        footer: <div>TITLE FOOTER</div>
    },
    'Release date':{
        title: 'Release Date',
        body:  <div>Release Date BODY</div>,
        footer: <div>Release Date FOOTER</div>
    },
    'Release date - Experimental Method':{
        title: 'Experimental Method by Release Date',
        body:  <div>Release date - Experimental Method BODY</div>,
        footer: <div>Release date - Experimental Method FOOTER</div>
    },
    'Release date - Organism':{
        title: 'Organism by Release Date',
        body:  <div>Release date - Organism BODY</div>,
        footer: <div>Release date - Organism FOOTER</div>
    },
    'Release date - CATH domains':{
        title: 'CATH Domains by Release Date',
        body:  <div>Release date & CATH domains BODY</div>,
        footer: <div>Release date & CATH domains FOOTER</div>
    },
    'Experimental Method':{
        title: 'Experimental Method',
        body:  <div>Experimental Method BODY</div>,
        footer: <div>Experimental Method FOOTER</div>
    },
    'Experimental Method - Organism':{
        title: 'Experimental Method by Organism',
        body:  <div>Experimental Method & Organism BODY</div>,
        footer: <div>Experimental Method & Organism FOOTER</div>
    },
    'Experimental Method - CATH domains':{
        title: 'Experimental Method by CATH domains',
        body:  <div>Experimental Method & CATH domains BODY</div>,
        footer: <div>Experimental Method & CATH domains FOOTER</div>
    },
    'Organism':{
        title: 'Organism',
        body:  <div>Organism BODY</div>,
        footer: <div>Organism FOOTER</div>
    },
    'Organism - Experimental Method':{
        title: 'Organism by Experimental Method',
        body:  <div>Organism & Experimental Method BODY</div>,
        footer: <div>Organism & Experimental Method FOOTER</div>
    },
    'Organism - CATH domains':{
        title: 'Organism by CATH domains',
        body:  <div>Organism & CATH domains BODY</div>,
        footer: <div>Organism & CATH domains FOOTER</div>
    },
    'CATH domains':{
        title: 'CATH Domains',
        body:  <div>CATH domains BODY</div>,
        footer: <div>CATH domains FOOTER</div>
    },
    'CATH domains - Experimental Method':{
        title: 'CATH Domains by Experimental Method',
        body:  <div>CATH domains & Experimental Method BODY</div>,
        footer: <div>CATH domains & Experimental Method FOOTER</div>
    },
    'CATH domains - Organism':{
        title: 'CATH Domains by Organism',
        body:  <div>CATH domains & Organism BODY</div>,
        footer: <div>CATH domains & Organism FOOTER</div>
    }
}

/**
 * 
 * @param d1 String for the first dimension
 * @param d2 String for the second dimension
 * @returns an object with {title: string, body: {React.ReactElement}, footer: {React.ReactElement}}
 * Returns a blank object when there is no matching data in the chartInfo object
 * ChartInfo object's keys follow this format: `${dimension1} - @{dimension2}`.
 */
export function getChartInfo(d1:string, d2:string): chartInfoData{
    const key = d1 !== d2  && d2 !== 'None' ? `${d1} - ${d2}` : d1
    const result = chartInfo[key] || {title:'',body:<></>,footer:<></>}
    return result
}

export default chartInfo