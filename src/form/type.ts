// 获取可选字段
export type PickOptional<T> = Pick<T, { [K in keyof T]-?: {} extends { [P in K]: T[K] } ? K : never }[keyof T]>;
