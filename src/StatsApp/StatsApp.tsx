import * as React from "react";
import { useState, useRef } from "react";
import { ADDITIONAL_FACET_STORE, FACET_STORE } from "./FacetStore";
import { FacetPlot } from "../StatsPlot/FacetPlot";
import StatsAppModal from "./Components/StatsAppModal";
import { ReturnType } from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
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
// const textAndLinks = {
//     "RCSB Statistics": "/",
//     "About RCSB Statistics": "/",
//     "Data Growth": "/",
//     "Data Distribution": "/",
//     "Other Statistics": "/",
//     "PDB Data Snapshot": "/",
//     "Build a Chart": "/",
// }

const DEFAULT_GQL_URL: string = `https://data.rcsb.org/graphql/index.html`

export function StatsApp() {

    const [opt1, setOpt1] = useState<number>(0);
    // @#@#@# default should be 0 for the real app
    const [opt2, setOpt2] = useState<number>(1);
    const mainFacet = FACET_STORE[opt1];
    const additionalFacet = ADDITIONAL_FACET_STORE[opt2];
    const chartRef = useRef(null)

    function resetOptions(){
        setOpt1(0);
        setOpt2(0);
    }

    console.log("FACET_STORE", FACET_STORE)

    if (!mainFacet.facet || !mainFacet.chartType) return null;

    return (
        <div>
            <Container ref={chartRef} className="StatsApp Component">
                <Row>
                    {/* <div className="StatsApp Component container" ref={chartRef}> */}
                    <StatsNavBar />
                    {/* <div className="grayBox">

                    </div> */}

                    <FacetPlot
                        firstDim={mainFacet.facet}
                        secondDim={
                            mainFacet.facetId != additionalFacet?.facetId ? additionalFacet?.facet : undefined
                        }
                        chartType={mainFacet.chartType}
                        returnType={ReturnType.Entry}
                        chartConfig={{
                            ...mainFacet.chartConfig,
                            histogramBinIncrement: 1,
                        }}
                        resetOptions={resetOptions}
                    />
                    <div style={{ margin: '100px 0 20px 0' }}>
                        {/* Select 1st Dataset */}
                        <Row className="row mb-1">
                            <ButtonGroup className="btn-group" style={{ outline: '1px solid black' }}>
                                <div className={`btn`}>1st Dimension:</div>
                                {
                                    FACET_STORE.map((facet, index) => {
                                        let buttonClass = index === opt1 ? 'btn-primary' : 'btn-light'
                                        return <div className={`btn ${buttonClass}`} onClick={() => setOpt1(index)} key={index}>{facet.facetName}</div>
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
                                        let buttonClass = index === opt2 ? 'btn-primary' : 'btn-light'
                                        return <div className={`btn ${buttonClass}`} onClick={() => setOpt2(index)} key={index}>{facet.facetName}</div>
                                    })
                                }
                            </ButtonGroup>
                        </Row>
                        <div className="d-flex justify-content-start">
                            <div className="btn btn-success" style={{ width: '200px' }} onClick={() => { saveTargetAsImage(chartRef.current, CHART_FILE_NAME) }}>Save Chart as Image</div>
                        </div>

                    </div>
                    {/* Draw the Chart */}

                    {/* </div> */}
                </Row>
            </Container>
        </div>
    )
}

function StatsNavBar() {
    const [showModal, setShowModal] = useState(false);

    return <div>
        <Navbar expand="lg" className="bg-body-tertiary grayBox p-0 px-3">
                <Navbar.Brand href="#home">RCSB Statistics</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto d-flex justify-content-around">

                        <Nav.Link className="mx-3" href="/StatsApp.html">About RCSB Statistics</Nav.Link>

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


                        <Nav.Link className="mx-3" href="/StatsApp.html">Other Statistics</Nav.Link>

                        <Nav.Link className="mx-3" href="/StatsApp.html">PDB Data Snapshot</Nav.Link>

                        <Nav.Link className="mx-3" href="/StatsApp.html">
                            <Icon.Graph />Build a chart
                        </Nav.Link>

                    </Nav>
                </Navbar.Collapse>

        </Navbar>
        <Button className="btn btn-light mr-0 ml-auto my-1" style={{ maxWidth: `9rem`, width: `auto`, display: 'block', backgroundColor: '#f1f0f0', marginLeft: 'auto'}} href={DEFAULT_GQL_URL}>
            <Icon.Gear /> Search API
        </Button>
        <StatsAppModal show={showModal} handleClose={() => { setShowModal(false) }} title={`Search API`}>
            <h1>Zintis</h1>
            <div>{"const gphurlforLink = gqlUrl + `/index.html?query=${queryforLink}&variables=${variables}`;"}</div>
        </StatsAppModal>
    </div>
}