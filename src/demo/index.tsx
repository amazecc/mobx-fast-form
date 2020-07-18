import React from "react";
import ReactDOM from "react-dom";
import { configure } from "mobx";
import "mobx-react-lite/batchingForReactDom";

configure({ enforceActions: "observed" });

ReactDOM.render(
    <div>
        <h1>hello</h1>
    </div>,
    document.getElementById("root")
);
