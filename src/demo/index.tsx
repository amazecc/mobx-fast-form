import * as React from "react";
import { render } from "react-dom";
import { configure } from "mobx";
import "mobx-react-lite/batchingForReactDom";
import { FormDemo } from "./FormDemo";
import 'antd/dist/antd.css'

configure({ enforceActions: "observed" });

render(<FormDemo />, document.getElementById("root"));
