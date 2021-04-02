import * as React from "react";
import { Button } from "antd";

import { Form, useForm } from "src/form";
import { Field } from "./antd-style/Field";
import { Input } from "./antd-style/Input";

interface FormState {
    email: string;
    password: string;
}

const defaultFormState: FormState = {
    email: "",
    password: "",
};

export const FormHooks = () => {
    const { store, form } = useForm(defaultFormState);

    const submit = async () => {
        const result = await form.submit();
        console.log(result);
        if (result.ok) {
            // eslint-disable-next-line no-alert
            alert(`提交数据：${JSON.stringify(result.values, null, 4)}`);
        }
    };

    return (
        <div style={{ width: 600, margin: "100px auto" }}>
            <h1>useForm hooks 方式编写表单</h1>
            <Form store={store}>
                <Field name="email" label="邮箱" required>
                    <Input />
                </Field>
                <Field name="password" label="密码" required validate={[{ pattern: /\w{4,}/, message: "密码长度最少4位" }]}>
                    <Input />
                </Field>
                <Button onClick={submit}>提交</Button>
            </Form>
        </div>
    );
};
