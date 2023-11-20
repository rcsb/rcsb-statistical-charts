import * as React from "react";
import {
     useState,
     useRef
} from "react";

import { ADDITIONAL_FACET_STORE, FACET_STORE } from "./FacetStore";
import { FacetPlot } from "../StatsPlot/FacetPlot";
import StatsAppModal from "./Components/StatsAppModal";
import { ReturnType } from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {StatsFacetInterface} from "./StatsFacetInterface";

import Icon from './Components/Icons'
import saveTargetAsImage from '../utils/saveChart.js'

// React Bootstrap
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
// import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Button from 'react-bootstrap/Button';
// import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

const CHART_FILE_NAME: string = 'RCSB Statistics Chart'
const baseUrl = window.location.href.split("?")[0]


export function StatsApp() {

    const [dataset1Index, setDataset1Index] = useState<number>(0);
    const [dataset2Index, setDataset2Index] = useState<number>(2);
    const mainFacet:StatsFacetInterface = FACET_STORE[dataset1Index];
    const additionalFacet:StatsFacetInterface = ADDITIONAL_FACET_STORE[dataset2Index];
    const chartRef = useRef(null)

    const reset = () => {
        setDataset1Index(0);
        setDataset2Index(0);
    }


    if (!mainFacet.facet || !mainFacet.chartType) return null;
    // console.log("mainFacet.facet", mainFacet.facet)
    // console.log("additionalFacet.facet", additionalFacet.facet)

    return (
        <div>
            {/* @#@#@# can add "fluid" property to extend to edge of screen */}
            <Container ref={chartRef} className="StatsApp Component">
                <Row>
                    <StatsNavBar />

                    <FacetPlot
                        firstDimName={mainFacet.facetName}
                        firstDim={mainFacet.facet}
                        secondDimName={additionalFacet.facetName}
                        secondDim={
                            mainFacet.facetId != additionalFacet?.facetId ? additionalFacet?.facet : undefined
                        }
                        chartType={mainFacet.chartType}
                        returnType={ReturnType.Entry}
                        chartConfig={{
                            ...mainFacet.chartConfig,
                            histogramBinIncrement: 1,
                        }}
                        resetOptions={reset}
                    />
                    <div style={{ margin: '100px 0 20px 0' }}>
                        {/* Select 1st Dataset */}
                        <Row className="row mb-1">
                            <ButtonGroup className="btn-group" style={{ outline: '1px solid black' }}>
                                <div className={`btn`}>1st Dimension:</div>
                                {
                                    FACET_STORE.map((facet, index) => {
                                        let buttonClass = index === dataset1Index ? 'btn-primary' : 'btn-light'
                                        return <div className={`btn ${buttonClass}`} onClick={() => setDataset1Index(index)} key={index}>{facet.facetName}</div>
                                    })
                                }
                            </ButtonGroup>
                        </Row>
                        {/* Select 2nd Dataset */}
                        <Row className="row mb-1">
                            <ButtonGroup className="btn-group" style={{ outline: '1px solid black' }}>
                                <div className={`btn`}>2nd Dimension:</div>
                                {
                                    ADDITIONAL_FACET_STORE.map((facet, index) => {
                                        let buttonClass = index === dataset2Index ? 'btn-primary' : 'btn-light'
                                        return <div className={`btn ${buttonClass}`} onClick={() => setDataset2Index(index)} key={index}>{facet.facetName}</div>
                                    })
                                }
                            </ButtonGroup>
                        </Row>
                        <div className="d-flex justify-content-start">
                            <div className="btn btn-success" style={{ width: '200px' }} onClick={() => { saveTargetAsImage(chartRef.current, CHART_FILE_NAME) }}>Save Chart as Image</div>
                        </div>

                    </div>
                    {/* Adding some links to go to pages */}
                    <div style={{ margin: '100px 0 20px 0' }}>
                        <div>This area is meant to test different links to the various facet stores. Currently app does NOT support URL based chart facet selection.</div>

                        {/* Select 1st Dataset */}

                        <div className="" style={{ outline: '1px solid black' }}>
                            <div>1</div>
                            {
                                FACET_STORE.map((facet, index) => {
                                    let url = `${baseUrl}?facet1=${facet.facetName}`
                                    return <div><a href={url} key={index}>{url}</a></div>
                                })
                            }
                            <div>2</div>
                            {
                                FACET_STORE.map((f1, index) => {
                                    let url = `${baseUrl}?facet1=${f1.facetName}`
                                    return ADDITIONAL_FACET_STORE.filter((f2) => f2.facetName !== "None" && f2.facetName !== f1.facetName).map((f2, index) => {
                                        return <div><a href={url} key={index}>{url}&facet2={f2.facetName}</a></div>
                                    })
                                })
                            }
                        </div>

                    </div>
                </Row>
            </Container>
        </div>
    )
}

function StatsNavBar() {
    const [showModal, setShowModal] = useState(false);

    return <div>

        <Navbar expand="xl" className="bg-body-tertiary grayBox p-0 px-3 mt-3 mb-2">
                <Navbar.Brand href="#home">RCSB Statistics</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto d-flex justify-content-around">

                        <Nav.Link className="mx-3" href="/StatsApp.html">About</Nav.Link>

                        <NavDropdown className="mx-3" title="Data Growth" id="basic-nav-dropdown">
                            <NavDropdown.Item href="/StatsApp.html">Overall Growth of PDB Data</NavDropdown.Item>
                            <NavDropdown.Item href="/StatsApp.html">Experimental Method</NavDropdown.Item>
                            <NavDropdown.Item href="/StatsApp.html">Structure Type</NavDropdown.Item>
                            <NavDropdown.Item href="/StatsApp.html">Assembly Symmetry</NavDropdown.Item>
                            <NavDropdown.Item href="/StatsApp.html">Unique Sequences Identity</NavDropdown.Item>
                            <NavDropdown.Item href="/StatsApp.html">UniProtKB Entries with Known 3D Structure</NavDropdown.Item>
                            <NavDropdown.Item href="/StatsApp.html">Unique Number of Domains</NavDropdown.Item>
                            <NavDropdown.Item href="/StatsApp.html">Growth of Released Small Molecules</NavDropdown.Item>
                        </NavDropdown>

                        <NavDropdown className="mx-3" title="Data Distribution" id="basic-nav-dropdown">
                            <NavDropdown.Item href="/StatsApp.html">Source Organism</NavDropdown.Item>
                            <NavDropdown.Item href="/StatsApp.html">Resolution</NavDropdown.Item>
                            <NavDropdown.Item href="/StatsApp.html">Software</NavDropdown.Item>
                            <NavDropdown.Item href="/StatsApp.html">R-free</NavDropdown.Item>
                            <NavDropdown.Item href="/StatsApp.html">Space Group</NavDropdown.Item>
                            <NavDropdown.Item href="/StatsApp.html">Journal</NavDropdown.Item>
                            <NavDropdown.Item href="/StatsApp.html">Molecular Weight</NavDropdown.Item>
                            <NavDropdown.Item href="/StatsApp.html">Structure Components Count</NavDropdown.Item>
                        </NavDropdown>


                        <Nav.Link className="mx-3" href="/StatsApp.html">Other Stats</Nav.Link>

                        <Nav.Link className="mx-3" href="/StatsApp.html">PDB Snapshot</Nav.Link>

                        <Nav.Link className="mx-3" href="/StatsApp.html">
                            <Icon.Graph />Build a chart
                        </Nav.Link>

                    </Nav>
                </Navbar.Collapse>

        </Navbar>

        <Button className="btn btn-light mr-0 ml-auto my-1" style={{ maxWidth: `9rem`, width: `auto`, display: 'block', backgroundColor: '#f1f0f0', marginLeft: 'auto'}} onClick={()=>{setShowModal(true)}}>
            <Icon.Gear /> Search API
        </Button>

        <StatsAppModal show={showModal} handleClose={() => { setShowModal(false) }} title={`Search API`} footer={`Cheers`}>
            <h1>Zintis</h1>
            <div>{"const gphurlforLink = gqlUrl + `/index.html?query=${queryforLink}&variables=${variables}`;"}</div>
        </StatsAppModal>
    </div>
}
