import type { Form } from "../Form";

export interface Forms {
    [k: string]: any;
}

export class FormsManager<F extends Forms> {
    forms = {} as F;

    addForm = (formName: any, form: Form<any>) => {
        Object.assign(this.forms, { [formName]: form });
    };

    removeForm = (formName: string) => {
        delete this.forms[formName];
    };
}
