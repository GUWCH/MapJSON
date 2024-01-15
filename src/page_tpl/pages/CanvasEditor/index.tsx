import React  from 'react';
import { observer, Observer } from 'mobx-react';
import Layout from './layouts';
import Canvas from './Editor';
import PreviewPage from './Preview';

interface ICEPros{
    isEdit?: boolean;
}

function CE(props: ICEPros = {isEdit: true}) {

	return <Layout>
        {
            props.isEdit ? <Canvas /> : <PreviewPage />
        }
    </Layout>;
}

export default observer(CE);
