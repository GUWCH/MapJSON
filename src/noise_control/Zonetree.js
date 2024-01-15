import React from 'react';
import PropTypes from 'prop-types';

class Zonetree extends React.Component {
	static propTypes = {
		className: PropTypes.string,
		info: PropTypes.object,
		del: PropTypes.func
    };

    static defaultProps = {
		className: '',
		info: {},
		del: () =>{}
	};
	
    constructor(props) {
    	super(props);

    	this.state = {
    	}
    }

    componentWillMount() {
    }

    componentWillReceiveProps(nextProps) {
	}
	
	del(obj){
		let {info={}, del} = this.props;
		let {modelMap={}, models={}, wtgs=[], modelWtgs={}} = info;
		switch(typeof obj){
			//代表型号
			case 'string':
				del(modelWtgs[obj].map(f => f.alias));
			break;
			//代表风机
			case 'object':
				del([obj.alias]);
			break;
		}
	}
	
	renderList(){
		let {className, info={}} = this.props;
		let {modelMap={}, models={}, wtgs=[], modelWtgs={}} = info;

		let loop = (obj, parent, children, key) => {
			children = children || [];
			return (
				<li key={key}>
					<div>
						<span>{parent}</span>
						<span 
							className={`${className}-del`}
							onClick={(e) => {this.del(obj);}}
						></span>
					</div>
					
					{
						children.length > 0 ? <ul>
							{
								children.map((c, ind) => loop(c, c.display_name, c.children, ind))
							}
						</ul> : null
					}
				</li>
			);
		}

		return Object.keys(modelWtgs).map((model, ind) => {
			return (
				<ul key={ind} className={className}>
					{loop(model, model, modelWtgs[model], ind)}
				</ul>
			);
		});
	}

	render() {
		let {info} = this.props;	

        return info ? this.renderList() : null;
    }
  }
  
  export default Zonetree;
