import * as React from "react";
import { Button, Input } from "antd";

import { Form, FormActions } from "src/form";
import { Field } from "./antd-style/Field";

interface FormState {
    name: string;
    age: number | undefined;
    height: string;
    weight: string;
    isKid: boolean | undefined;
}

const defaultFormState: FormState = {
    name: "",
    age: undefined,
    height: "",
    weight: "",
    isKid: undefined,
};

export class FormDemo extends React.PureComponent {
    private readonly formRef: React.RefObject<Form<any>> = React.createRef();

    submit = async () => {
        const result = await this.formRef.current!.submitForm();
        console.log(result);
    };

    effect = (name: keyof FormState, values: FormState, actions: FormActions<FormState>) => {
        console.log({ name, values, actions });
    };

    render() {
        return (
            <div style={{ width: 600, margin: "100px auto" }}>
                <Form effect={this.effect} ref={this.formRef} initialValue={defaultFormState}>
                    <Field name="name" label="姓名" required>
                        <Input />
                    </Field>
                    <Field name="age" label="年龄">
                        <Input />
                    </Field>
                    <Field name="height" label="身高">
                        <Input />
                    </Field>
                    <Field name="weight" label="体重">
                        <Input />
                    </Field>
                    <Field name="isKid" label="是否为小孩">
                        <Input />
                    </Field>
                    <div>
                        <Button onClick={this.submit}>提交</Button>
                    </div>
                </Form>
            </div>
        );
    }
}
