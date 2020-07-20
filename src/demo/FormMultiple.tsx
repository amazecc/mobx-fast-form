import * as React from "react";

import { Form, FormProvider } from "src/form";
import { Field } from "./antd-style/Field";
import { Input } from "./antd-style/Input";
import { Button } from "antd";

interface FormState1 {
    email: string;
    password: string;
}

interface FormState2 {
    name: string;
    age: string;
}

interface Forms {
    form1: Form<FormState1>;
    form2: Form<FormState2>;
}

export class FormMultiple extends React.PureComponent {
    private readonly formRef: React.RefObject<FormProvider<Forms>> = React.createRef();

    private readonly defaultFormState: FormState1 = {
        email: "",
        password: "",
    };

    private readonly defaultForm2State: FormState2 = {
        name: "",
        age: "",
    };

    submit = async () => {
        const forms = this.formRef.current?.getForms();
        console.log("-----:: forms：", forms);
        if (forms) {
            const result1 = await forms.form1.submit();
            const result2 = await forms.form2.submit();
            if (result1.ok && result2.ok) {
                // eslint-disable-next-line no-alert
                alert(`提交数据：${"\n"}name1: ${JSON.stringify(result1.values, null, 4)}${"\n"}name2: ${JSON.stringify(result2.values, null, 4)}`);
            }
        }
    };

    onFormChange = (formName: keyof Forms, fieldName: string, forms: Forms) => {
        console.log(formName, fieldName, forms);
    };

    render() {
        return (
            <div style={{ width: 600, margin: "100px auto" }}>
                <FormProvider<Forms> ref={this.formRef} onFormChange={this.onFormChange}>
                    <Form name="form1" initialValue={this.defaultFormState}>
                        <Field name="email" label="邮箱" required>
                            <Input />
                        </Field>
                        <Field name="password" label="密码" required validate={[{ pattern: /\w{4,}/, message: "密码长度最少4位" }]}>
                            <Input />
                        </Field>
                    </Form>
                    <hr />
                    <Form name="form2" initialValue={this.defaultForm2State}>
                        <Field name="name" label="名称" required>
                            <Input />
                        </Field>
                        <Field name="age" label="年龄">
                            <Input />
                        </Field>
                    </Form>
                    <div>
                        <Button onClick={this.submit}>提交</Button>
                    </div>
                </FormProvider>
            </div>
        );
    }
}
