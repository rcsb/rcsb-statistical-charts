import React from 'react'

interface chartInfoInterface {
    [key:string]: chartInfoData
}

interface chartInfoData {
    title: string,
    body:  React.ReactElement,
    footer: React.ReactElement
}

const chartInfo:chartInfoInterface = {
    example:{
        title: "TITLE",
        body:  <div>EXAMPLE BODY</div>,
        footer: <div>EXAMPLE FOOTER</div>
    },
    "Release date":{
        title: "Release Date",
        body:  <div>EXAMPLE BODY</div>,
        footer: <div>EXAMPLE FOOTER</div>
    },
    "Release date - Experimental Method":{
        title: "Release Date & Experimental Method",
        body:  <div>EXAMPLE BODY</div>,
        footer: <div>EXAMPLE FOOTER</div>
    },
    "Release date - Organism":{
        title: "Release date & Organism",
        body:  <div>EXAMPLE BODY</div>,
        footer: <div>EXAMPLE FOOTER</div>
    },
    "Release date - CATH domains":{
        title: "Release date & CATH domains",
        body:  <div>EXAMPLE BODY</div>,
        footer: <div>EXAMPLE FOOTER</div>
    },
    "Experimental Method":{
        title: "Experimental Method",
        body:  <div>EXAMPLE BODY</div>,
        footer: <div>EXAMPLE FOOTER</div>
    },
    "Experimental Method - Organism":{
        title: "Experimental Method & Organism",
        body:  <div>EXAMPLE BODY</div>,
        footer: <div>EXAMPLE FOOTER</div>
    },
    "Experimental Method - CATH domains":{
        title: "Experimental Method & CATH domains",
        body:  <div>EXAMPLE BODY</div>,
        footer: <div>EXAMPLE FOOTER</div>
    },
    "Organism":{
        title: "TITLE",
        body:  <div>EXAMPLE BODY</div>,
        footer: <div>EXAMPLE FOOTER</div>
    },
    "Organism - Experimental Method":{
        title: "Organism & Experimental Method",
        body:  <div>EXAMPLE BODY</div>,
        footer: <div>EXAMPLE FOOTER</div>
    },
    "Organism - CATH domains":{
        title: "Organism & CATH domains",
        body:  <div>EXAMPLE BODY</div>,
        footer: <div>EXAMPLE FOOTER</div>
    },
    "CATH domains":{
        title: "CATH domains",
        body:  <div>EXAMPLE BODY</div>,
        footer: <div>EXAMPLE FOOTER</div>
    },
    "CATH domains - Experimental Method":{
        title: "CATH domains & Experimental Method",
        body:  <div>EXAMPLE BODY</div>,
        footer: <div>EXAMPLE FOOTER</div>
    },
    "CATH domains - Organism":{
        title: "CATH domains & Organism",
        body:  <div>EXAMPLE BODY</div>,
        footer: <div>EXAMPLE FOOTER</div>
    }
}

export default chartInfo