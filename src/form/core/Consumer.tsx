import * as React from "react";
import { observe } from "mobx";
import { StoreContext } from "./Form/context";
import type { Lambda } from "mobx";

export interface ConsumerProps<V> {
    /** names 包含的字段值变化后，重新渲染该组件，不填写该项默认所有字段变化都重渲染 */
    bindNames?: Array<keyof V>;
    children: (values: Readonly<V>) => React.ReactNode;
}

export class Consumer<V> extends React.PureComponent<ConsumerProps<V>> {
    static contextType = StoreContext;

    readonly context!: React.ContextType<typeof StoreContext>;

    private disposer: Lambda | null = null;

    componentDidMount() {
        const { bindNames } = this.props;
        this.disposer = observe(this.context.values as V, change => {
            if (change.type === "update") {
                if (!bindNames || bindNames.includes(change.name as keyof V)) {
                    this.forceUpdate();
                }
            }
        });
    }

    componentWillUnmount() {
        this.disposer?.();
    }

    render() {
        return this.props.children(this.context.values);
    }
}
