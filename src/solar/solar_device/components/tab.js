export default class Tab{
    constructor(flag='', name='', type=[]){
        this.flag = flag;
        this.name = name;
        this.type = type;
    }

    getFlag(){
        return this.flag;
    }

    setFlag(flag){
        this.flag = flag;
    }

    getName(){
        return this.name;
    }

    setName(name){
        this.name = name;
    }

    getType(){
        return this.type;
    }

    /**
     * 
     * @param {String[]|Number[]} type 
     */
    setType(type){
        this.type = type;
    }
}

