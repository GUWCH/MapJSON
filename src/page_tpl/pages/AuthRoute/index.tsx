import React, { useEffect, useState } from 'react';
import { _dao, daoIsOk } from '@/common/dao';

// 模板和编辑需要用户的系统节点有画面模板可编辑权限
function AuthRoute(props){
    const [auth, setAuth] = useState(false);

    useEffect(() => {
        (async () => {
            const res = await _dao.getAuth();
            if(daoIsOk(res) && res.data && res.data[0] && String(res.data[0]['config_69']) === '1'){
                setAuth(true);
            }
        })();
    }, []);

    return auth ? props.children : <div>No Auth</div>;
}

export default AuthRoute;