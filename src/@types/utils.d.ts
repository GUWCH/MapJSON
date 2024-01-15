// 获取函数参数类型
type ArgumentsType<T> = T extends (...args: infer U) => any ? U : never

// 获取数组参数
type ArrayElement<ArrayType extends readonly unknown[]> =
    ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

// 全部属性（包括嵌套对象属性）可选
type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>;
};

/**
 * 联合类型的key
 * type A = {a:string}
 * type B = {b:string}
 * type O = A | B
 * UnionKey<O> ==> 'a' | 'b'
 */
type UnionKey<O> = O extends O ? keyof O : never