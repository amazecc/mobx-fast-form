import * as React from "react";
import { Button } from "antd";

import { Form, FormActions, Consumer } from "src/form";
import { Field } from "./antd-style/Field";
import { Input } from "./antd-style/Input";

interface FormState {
    email: string;
    password: string;
}

export class FormBasic extends React.PureComponent {
    private readonly formRef: React.RefObject<Form<any>> = React.createRef();

    private readonly defaultFormState: FormState = {
        email: "",
        password: "",
    };

    submit = async () => {
        const result = await this.formRef.current!.submit();
        console.log(result);
        if (result.ok) {
            // eslint-disable-next-line no-alert
            alert(`提交数据：${JSON.stringify(result.values, null, 4)}`);
        }
    };

    effect = (name: keyof FormState, values: FormState, actions: FormActions<FormState>) => {
        console.log({ name, values, actions });
    };

    render() {
        return (
            <div style={{ width: 600, margin: "100px auto" }}>
                <h1>基础用法以及 Consumer 组件用法</h1>
                <Form effect={this.effect} ref={this.formRef} initialValue={this.defaultFormState}>
                    <Field name="email" label="邮箱" required>
                        <Input />
                    </Field>
                    <Field name="password" label="密码" required validate={[{ pattern: /\w{4,}/, message: "密码长度最少4位" }]}>
                        <Input />
                    </Field>
                    <Consumer<FormState> bindNames={["email", "password"]}>
                        {values => (
                            <div style={{ margin: "20px 0" }}>
                                <strong>Consumer 组件绑定字段值并重渲染</strong> <br />
                                <strong>email: {values.email}</strong> <br />
                                <strong>password: {values.password}</strong>
                            </div>
                        )}
                    </Consumer>
                    <Button onClick={this.submit}>提交</Button>
                </Form>
            </div>
        );
    }
}
