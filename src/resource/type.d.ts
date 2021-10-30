/**
 * 获取可选字段, 用于 React 类组件的默认属性类型声明
 * @example
 * static defaultProps: PickOptional<Props> = {}
 */
declare type PickOptional<T> = Pick<T, { [K in keyof T]-?: {} extends { [P in K]: T[K] } ? K : never }[keyof T]>;
