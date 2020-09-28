import type { Form } from "../Form";

export interface Forms {
    [k: string]: any;
}

export class FormsManager<F extends Forms> {
    forms = {} as F;

    /** 实例化后需要在外部赋值 */
    onFormChange?: (formName: keyof F, fieldName: string, forms: Readonly<F>) => void;

    addForm = (formName: any, form: Form<any>) => {
        Object.assign(this.forms, { [formName]: form });
    };

    removeForm = (formName: string) => {
        delete this.forms[formName];
    };
}
