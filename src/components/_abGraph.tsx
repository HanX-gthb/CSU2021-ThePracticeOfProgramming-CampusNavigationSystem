import React from "react";
import { IComponentProps } from "../interface/IComponentProps";
import G6 from '@antv/g6';
import { findShortestPath, findAllPath } from '@antv/algorithm';
import { convertJSONtoG6 } from "../utils/convertToG6";
import { msTree } from "../utils/prim";

const graphFromJson = require("../static/graph.json");
interface IAbGraphProps extends IComponentProps{
    setSolutions:(solutions:Array<string[]>)=>void
}
export default class AbGraph extends React.Component<IAbGraphProps,{selected:string[]}>{
    private graph: any = null;
    constructor(props:IAbGraphProps){
        super(props);
        this.state = {
            selected: Array.from(props.selected)
        }
    }
    componentDidMount() {
        this.graph = new G6.Graph({
            container: 'mountNode', // String | HTMLElement，必须，在 Step 1 中创建的容器 id 或容器本身
            width: 800, // Number，必须，图的宽度
            height: 500, // Number，必须，图的高度
            layout: {
                type: 'random',
            }
        });
        const temp = convertJSONtoG6(graphFromJson,this.props.selected);
        this.graph.data(temp);
        this.graph.render();
    }
    shouldComponentUpdate(nextProps: Readonly<IAbGraphProps>, nextState: Readonly<{selected:string[]}>, nextContext: any): boolean {
        console.log(this.state.selected,nextProps.selected);
        if(this.state.selected.length !== nextProps.selected.length){
            return true;
        }
        for(let i = 0 ; i < this.state.selected.length ; i++){
            if(nextProps.selected[i] !== this.state.selected[i]){
                return true;
            }
        }
        return false;
    }
    componentDidUpdate() {
        this.graph.clear();
        const temp = convertJSONtoG6(graphFromJson, this.props.selected);
        const allPath = findAllPath(temp,this.props.selected[0],this.props.selected[1],false);
        if (this.props.mintree === false) {
            if (this.props.selected.length === 2) {

                const { length, path, allPath } = findShortestPath(temp, this.props.selected[0], this.props.selected[1], false, "weight");
                for (let i = 0; i < path.length - 1; i++) {
                    for (let j = 0; j < temp["edges"].length; j++) {
                        if (path[i] === temp["edges"][j]["source"] && path[i + 1] === temp["edges"][j]["target"]
                            || path[i + 1] === temp["edges"][j]["source"] && path[i] === temp["edges"][j]["target"]) {

                            temp["edges"][j].style = {
                                stroke: 'red'
                            }
                        }
                    }
                }
            }
        } else {
            temp["edges"] = msTree;
            for (let i = 0; i < temp["nodes"].length; i++){
                temp["nodes"][i]["style"] = undefined;
            }
        }
        this.setState({
            selected:Array.from(this.props.selected)
        })
        this.props.setSolutions(allPath);
        this.graph.data(temp);
        this.graph.render();
    }
    render() {
        return (
            <div id="mountNode"></div>
       ) 
    }
}