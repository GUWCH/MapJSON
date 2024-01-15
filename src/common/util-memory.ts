import { useState, useCallback, useRef, useEffect, useMemo} from 'react';
import _ from 'lodash';
import { _dao, daoIsOk } from './dao';
import { FetchModel } from './constants';

export const MEMORY_OP = {
    GET: 'get',
    UPDATE: 'update',
    INSERT: 'insert'
};

export const MemoryType = {
    PAGE_TPL: '6060',
    USER_OP: '6061'
};

export const getMemoryDesc = (pageId?: string, widgetId?: string, suffix?: string) => {
    return [pageId, widgetId, suffix].reduce((a, b) => {
        return `${a||''}${a&&b? '_' : ''}${b||''}`;
    }, '');
}

export const getPageMemoryReq = () => {
    return Object.assign({}, FetchModel.MemoReq, {
        description: '',
        is_desc: '1',
        type: String(MemoryType.PAGE_TPL),
        username: ''
    })
}

export const getUserOpMemoryReq = () => {
    return Object.assign({}, FetchModel.MemoReq, {
        description: '',
        is_desc: '1',
        type: String(MemoryType.USER_OP),
        username: ''
    })
}

/**
 * 单条记录缓存, 一个description如果有多条记录暂不适用
 * @method init: (MemoReq) => Promise 初始化
 * @method save: (Object) => Promise 保存. 初始化有记录则更新, 无记录则插入
 */
class Memory {
    private inited: boolean = false;
    private id: string = '';
    private content: string = '';

    private base: Partial<IMemory> = {
        type: '',
        is_desc: '1',
        description: '',
        username: ''
    }

    constructor(params: Partial<IMemory>){
        this.base = Object.assign({}, this.base, params || {});
    }

    private isCorrect(){
        return this.base.type && this.base.description;
    }

    async init(){
        if(this.inited){
            return {isOk: true, content: this.content};
        }
        return await this._get();
    }

    private async _get(): Promise<{isOk: boolean, content: string}>{
        if(!this.isCorrect()) return new Promise(() => ({isOk: false, content: ''}));

        const res = await _dao.memo(MEMORY_OP.GET, this.base);
        const isGetted = daoIsOk(res);
        if(isGetted){
            this.inited = true;
        }
        if(isGetted && res.data[0]){
            const rd = res.data[0];
            this.id = rd.id;
            this.content = rd.content;

            delete rd.id;
            delete rd.content;

            this.base = Object.assign({}, this.base, rd);
        }

        return {isOk: isGetted, content: this.content};
    }

    async save(content: object){
        if(!this.isCorrect()) return;
        if(!this.inited){
            // 保证记录唯一性, 初始化失败后不允许操作
            throw new Error('initialed error, please check request');
        }

        const contentStr = JSON.stringify(content);
        const req = Object.assign({}, this.base);
        if(this.id){
            // @ts-ignore
            req.id = this.id;
        }
        req.content = contentStr;
        
        const res = await _dao.memo(this.id ? MEMORY_OP.UPDATE : MEMORY_OP.INSERT, req);

        if(daoIsOk(res)){
            this.content = contentStr;
            if(res.id){
                this.id = res.id;
            }
        }

        return daoIsOk(res);
    }
}

export default Memory;

export const useMemoryStateCallback = <T>(initialState: T, pageId, widgetId, sendReq: boolean = true, initialTransfer?: (oldConfig: any) => T): [T, (newState: T, cb?: (newState: T) => void)=>void, boolean] => {
    const [state, setState] = useState(initialState);
    const [initialized, setInitialized] = useState<boolean>(false);
    const cbRef = useRef<Function | null>(null);
    const cacheHandler = useRef(new Memory(
        Object.assign(
            {}, 
            getPageMemoryReq(), 
            {description: getMemoryDesc(pageId, widgetId)}
        ))
    );
  
    const setMemoryStateCallback = useCallback((state, cb) => {
        cbRef.current = cb;
        setState(state);
        cacheHandler.current && cacheHandler.current.save(state);
    }, []);

    useEffect(() => {
        const fetchCache = async () => {
            if(!cacheHandler.current) return;

            const res = await cacheHandler.current.init();
            if(res.isOk && res.content){
                try{
                    let newConfig = JSON.parse(res.content as string);
                    if(typeof initialTransfer === 'function'){
                        newConfig = initialTransfer(newConfig);
                    }
                    setState(Object.assign(Array.isArray(state) ? [] : {}, state, newConfig));
                }catch(e){
                    console.error('cache config parse json error');
                }
            }
            setInitialized(true);
        }

        sendReq && fetchCache();
    }, []);
  
    useEffect(() => {
      if (cbRef.current) {
        cbRef.current(state);
        cbRef.current = null;
      }
    }, useDeepCompareMemoize([state]));
  
    return [state, setMemoryStateCallback, initialized];
}

function useDeepCompareMemoize<T>(value: T) {
    const ref = useRef<T>(value);
    const signalRef = useRef<number>(0);
  
    if (!_.isEqual(value, ref.current)) {
      ref.current = value;
      signalRef.current += 1;
    }

    return useMemo(() => ref.current, [signalRef.current]);
}