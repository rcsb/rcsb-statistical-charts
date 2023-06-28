import * as React from "react";
import {createRoot} from "react-dom/client";
import {StatsApp} from "../StatsApp/StatsApp";

const node: HTMLElement|null = document.getElementById("chart-element");
if(node==null)
    throw `ERROR: HTML element not found`

const root = createRoot(node);
root.render(<StatsApp/>);