import * as React from "react";
import { FormsManager, Forms } from "./FormsManager";
import { FormContext } from "./context";

export interface FormProviderProps<F extends Forms> {
    formsManager?: FormsManager<F>;
}

export class FormProvider<F extends Forms> extends React.PureComponent<FormProviderProps<F>> {
    private readonly contextState;

    constructor(props: FormProviderProps<F>) {
        super(props);
        this.contextState = this.props.formsManager ?? new FormsManager<F>();
    }

    get forms() {
        return this.contextState.forms;
    }

    render() {
        return <FormContext.Provider value={this.contextState}>{this.props.children}</FormContext.Provider>;
    }
}
