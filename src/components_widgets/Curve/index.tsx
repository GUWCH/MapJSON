import { Curve } from './Curve';

// 组件注册时默认选项, 表单配置组件里会返回, 一般是常量值, 一般空对象。
interface ICurveDefaultOptions {};
export const CurveDefaultOptions: ICurveDefaultOptions = {};
export const CurveDefaultCfg = {};

export { default as CurveForm } from './form';
export { Curve };