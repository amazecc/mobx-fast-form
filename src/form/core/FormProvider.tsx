import * as React from "react";
import type { Form } from "./Form";

interface Forms {
    /**
     * key: 表单名称
     * value: 表单实例 Form<any>
     */
    [k: string]: any;
}

interface ContextState {
    forms: Forms;
    addForm: (formName: string, form: Form<any>) => void;
    onFormChange: (formName: string, fieldName: string) => void;
}

export const FormContext = React.createContext<ContextState | null>(null);

export interface FormProviderProps<F extends Forms> {
    onFormChange?: (formName: keyof F, fieldName: string, forms: F) => void;
}

export class FormProvider<F extends Forms> extends React.PureComponent<FormProviderProps<F>> {
    private contextState: ContextState;

    constructor(props: FormProviderProps<F>) {
        super(props);
        this.contextState = {
            forms: {},
            addForm: this.addForm,
            onFormChange: this.onFormChange,
        };
    }

    private addForm = (formName: string, form: Form<any>) => {
        this.contextState.forms[formName] = form;
    };

    private onFormChange = (formName: string, fieldName: string) => this.props.onFormChange?.(formName, fieldName, this.getForms());

    getForms = () => this.contextState.forms as F;

    render() {
        return <FormContext.Provider value={this.contextState}>{this.props.children}</FormContext.Provider>;
    }
}
