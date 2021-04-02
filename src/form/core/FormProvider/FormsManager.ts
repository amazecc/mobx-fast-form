import type { Form } from "../Form";

export type Forms = Record<string, any>;

export class FormsManager<F extends Forms> {
    forms = {} as F;

    addForm = (formName: string, form: Form<any>) => {
        Object.assign(this.forms, { [formName]: form });
    };

    removeForm = (formName: string) => {
        delete this.forms[formName];
    };
}
