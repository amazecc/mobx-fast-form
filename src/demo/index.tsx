import * as React from "react";
import { render } from "react-dom";
import { configure } from "mobx";
import "mobx-react-lite/batchingForReactDom";
import { Route, BrowserRouter, Link, Switch } from "react-router-dom";
import "antd/dist/antd.css";

import { FormBasic } from "./FormBasic";
import { FormMultiple } from "./FormMultiple";
import { FormHooks } from "./FormHooks";
import { FormLarge } from "./FormLarge";

configure({ enforceActions: "observed" });

const App = () => {
    return (
        <BrowserRouter>
            <ul>
                <li>
                    <Link to="/basic">基础表单</Link>
                </li>
                <li>
                    <Link to="/multiple">多表表单</Link>
                </li>
                <li>
                    <Link to="/hooks">hooks用法</Link>
                </li>
                <li>
                    <Link to="/largeForm">超大表单</Link>
                </li>
            </ul>
            <Switch>
                <Route path="/basic" component={FormBasic} />
                <Route path="/multiple" component={FormMultiple} />
                <Route path="/hooks" component={FormHooks} />
                <Route path="/largeForm" component={FormLarge} />
            </Switch>
        </BrowserRouter>
    );
};

render(<App />, document.getElementById("root"));
