export interface IBlock {
    id: string;
    name: string;
    position?: string;
    top: number;
    left: number;
    zIndex: number;
    width: number;
    height: number;
    props: {[k: string]: any}
};

export interface ITpl {
    container: {
        width: number;
        height: number
    };
    block: IBlock[];
    [k: string]: any;
};