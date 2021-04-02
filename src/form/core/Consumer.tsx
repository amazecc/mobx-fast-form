import * as React from "react";
import { IReactionDisposer, reaction } from "mobx";
import { StoreContext } from "./Form/context";

export interface ConsumerProps<V> {
    /** bind 返回的值中，存在一个变化，那么即重新渲染该组件，不填写该项默认不会重渲染 */
    bind?: (values: V) => any[];
    children: (values: Readonly<V>) => React.ReactNode;
}

export class Consumer<V> extends React.PureComponent<ConsumerProps<V>> {
    static contextType = StoreContext;

    readonly context!: React.ContextType<typeof StoreContext>;

    private disposer: IReactionDisposer | null = null;

    componentDidMount() {
        const { bind } = this.props;
        if (bind) {
            this.disposer = reaction(
                () => bind(this.context.values as V),
                () => this.forceUpdate()
            );
        }
    }

    componentWillUnmount() {
        this.disposer?.();
    }

    render() {
        return this.props.children(this.context.values);
    }
}
