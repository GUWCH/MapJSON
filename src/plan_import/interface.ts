export interface IPointData {
    point_name: string;
    point_id: number;
}
export interface IPlanPointsListData {
    interval_type: string,
    interval_val: number,
    limit: number,
    point_list: IPointData[]
}
export interface IPlanInfoData {
    key: string;
    point_name: string;
    point_id: number;
    plan_time: string;
    val: number | null;
    unit: string;
    operate_time: string;
    edit_flag: number;   //0不可编辑
    fac_alias: string;
}
export interface IPlanInfoResponse {
    code: number;
    message: string;
    data: IPlanInfoData[];
}
export interface IQueryPlanBody {
    interval_val: number;
    point_list: number[];
    start_time: string;
    end_time: string;
    date_format: string;
}
export interface IEditPlanBody {
    interval_val: number;
    save_type: number;
    edit_point_list: {
        point_id: number;
        plan_time: string;
        val: number | null;
        operate_time: string;
    }[];
    loop_point_list: {
        point_id: number;
        plan_time: string;
        val: number | null;
        fac_alias: string;
    }[],
    loop_start_time?: string;
    loop_end_time?: string;
    date_format: string;
}
export interface IExportPlanBody extends IQueryPlanBody {
    language_type: string;
    date_format: string;
}
export type IRangePicker = "time" | "date" | "week" | "month" | "quarter" | "year" | undefined