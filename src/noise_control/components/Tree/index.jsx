import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import RcTree, {TreeNode} from 'rc-tree';
import './style.scss';

class Tree extends React.Component {
    static propTypes = {
        prefixCls: PropTypes.string
    };

    static defaultProps = {
        prefixCls: 'env-rc-tree'
    };

    constructor(props) {
        super(props)

        this.state = {
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.state, nextState) 
            || !_.isEqual(_.omit(this.props, _.functions(this.props)), _.omit(nextProps, _.functions(nextProps)))) {
            return true;
        }
        return false;
    }

    onExpand = (expandedKeys, info) => {
    };

    onCheck = (checkedKeys, info) => {
    };

    onSelect = (selectedKeys, info) => {
    };

    render() {
        const loop = data => {
            return data.map((item) => {
                if (item.children) {
                    return (
                        <TreeNode key={item.key} title={item.title}>
                            {loop(item.children)}
                        </TreeNode>
                    );
                }
                return <TreeNode key={item.key} title={item.title}/>;
            });
        };

        let {prefixCls, treeData, onCheck, ...restProps} = this.props;

        let sortedTreeData = treeData.map(ele => {
            return (Object.assign(
                {}, 
                ele, 
                {children: ele.children.sort(function(a, b) {  
                    if (a.display_name < b.display_name) return -1;  
                    if (a.display_name > b.display_name) return 1;  
                    return 0;  
                })}
            ))
        });

        return (
            <RcTree 
                prefixCls={prefixCls}
                onCheck = {onCheck}
                {...restProps}
            >
                {loop(sortedTreeData)}
            </RcTree>
        )
    }
}

export default Tree;