
/********* 测点 Start ******/
export const TRANSFORMER_STATE = "BXTF.State"; // 箱变状态;
// 箱变遥测测点
export const TRANSFORMER_HIA = "BXTF.IaBr1"; // 高压侧Ia;
export const TRANSFORMER_HIB = "BXTF.IbBr1"; // 高压侧Ib;
export const TRANSFORMER_HIC = "BXTF.IcBr1"; // 高压侧Ic;
export const TRANSFORMER_HUA = "BXTF.UaBr1"; // 高压侧ua;
export const TRANSFORMER_HUB = "BXTF.UbBr1"; // 高压侧ub;
export const TRANSFORMER_HUC = "BXTF.UcBr1"; // 高压侧uc;
export const TRANSFORMER_HUAB = "BXTF.UabBr1"; // 高压侧uab;
export const TRANSFORMER_HUBC = "BXTF.UbcBr1"; // 高压侧ubc;
export const TRANSFORMER_HUCA = "BXTF.UcaBr1"; // 高压侧uca;
export const TRANSFORMER_HP = "BXTF.ActPowPhBr1"; // 高压侧P;
export const TRANSFORMER_HQ = "BXTF.ReActPowPhBr1" // 高压侧Q;
export const TRANSFORMER_HCOS = "BXTF.CosPhiBr1"; // 高压侧Cos;
export const TRANSFORMER_LIA1 = "BXTF.IaBr2";  // 1#低压侧Ia;
export const TRANSFORMER_LIB1 = "BXTF.IbBr2";  // 1#低压侧Ib;
export const TRANSFORMER_LIC1 = "BXTF.IcBr2";  // 1#低压侧Ic;
export const TRANSFORMER_LUA1 = "BXTF.UaBr2";  // 1#低压侧Ua;
export const TRANSFORMER_LUB1 = "BXTF.UbBr2";  // 1#低压侧Ub;
export const TRANSFORMER_LUC1 = "BXTF.UcBr2";  // 1#低压侧Uc;
export const TRANSFORMER_LUAB1 = "BXTF.UabBr2";  // 1#低压侧Uab;
export const TRANSFORMER_LUBC1 = "BXTF.UbcBr2";  // 1#低压侧Ubc;
export const TRANSFORMER_LUCA1 = "BXTF.UcaBr2";  // 1#低压侧Uca;
export const TRANSFORMER_LP1 = "BXTF.ActPowPhBr2";  // 1#低压侧P;
export const TRANSFORMER_LQ1 = "BXTF.ReActPowPhBr2" // 1#低压侧Q;
export const TRANSFORMER_LCOS1 = "BXTF.CosPhiBr2"; // 1#低压侧Cos;
export const TRANSFORMER_LIA2 = "BXTF.IaBr22";  // 2#低压侧Ia;
export const TRANSFORMER_LIB2 = "BXTF.IbBr22";  // 2#低压侧Ib;
export const TRANSFORMER_LIC2 = "BXTF.IcBr22";  // 2#低压侧Ic;
export const TRANSFORMER_LUA2 = "BXTF.UaBr22";  // 2#低压侧Ua;
export const TRANSFORMER_LUB2 = "BXTF.UbBr22";  // 2#低压侧Ub;
export const TRANSFORMER_LUC2 = "BXTF.UcBr22";  // 2#低压侧Uc;
export const TRANSFORMER_LUAB2 = "BXTF.UabBr22";  // 2#低压侧Uab;
export const TRANSFORMER_LUBC2 = "BXTF.UbcBr22";  // 2#低压侧Ubc;
export const TRANSFORMER_LUCA2 = "BXTF.UcaBr22";  // 2#低压侧Uca;
export const TRANSFORMER_LP2 = "BXTF.ActPowPhBr22";  // 2#低压侧P;
export const TRANSFORMER_LQ2 = "BXTF.ReActPowPhBr22" // 2#低压侧Q;
export const TRANSFORMER_LCOS2 = "BXTF.CosPhiBr22"; // 2#低压侧Cos;
// 箱变遥信测点
export const TRANSFORMER_HSWITCH = "BXTF.LoadSwitchClose"; // 高压侧开关合位
export const TRANSFORMER_HFAULT = "BXTF.LoadSwitchFault"; // 高压侧开关故障
export const TRANSFORMER_HOILTEMP = "BXTF.OilTempHigh"; // 油温高信号（油冷）
export const TRANSFORMER_LOIL = "BXTF.OilLow"; // 油位低信号（油冷）
export const TRANSFORMER_POIL = "BXTF.OilPressure"; // 压力异常（油冷）
export const TRANSFORMER_LGAS = "BXTF.LightGas"; // 轻瓦斯
export const TRANSFORMER_HGAS = "BXTF.HeavyGas"; // 重瓦斯
export const TRANSFORMER_SMOGALARM = "BXTF.SmogAlarm"; // 烟雾告警
export const TRANSFORMER_SGZ = "BXTF.SGZ"; // 事故总
export const TRANSFORMER_HDOOR = "BXTF.HighVolDoor"; // 高压箱变门打开
export const TRANSFORMER_LDOOR = "BXTF.LowVolDoor"; // 低压箱变门打开
export const TRANSFORMER_BREAKER1 = "BXTF.SingleBreaker01"; // 1#低压断路器合
export const TRANSFORMER_BREAKER2 = "BXTF.SingleBreaker02"; // 2#低压断路器合
// 直流汇流箱测点
export const DCCBX_STATE = "State";
export const DCCBX_DISPERSE = "Disperse";
export const DCCBX_TEMP = "TempAir";
export const DCCBX_VOL = "Vol";
/********* 测点 END ******/