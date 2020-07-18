import * as React from "react";
import { render } from "react-dom";
import { configure } from "mobx";
import "mobx-react-lite/batchingForReactDom";

configure({ enforceActions: "observed" });

render(
    <div>
        <h1>hello</h1>
    </div>,
    document.getElementById("root")
);
