import * as cheerio from "cheerio"
import { CheerioAPI } from "cheerio"

interface INode extends cheerio.Node{
    attribs:object
}

export interface ISelectEnv{
    html:string|null
    text:string
    attrs:Iattrs
}

interface Iattrs{
    [key:string]:any
}

export interface Imetadata{
    [key:string]:any
}

interface IRegExpExec{
    group?:Iattrs
    content:Array<any>
}

//首字母大写的为专门的方法
export class HtmlParser{
    public parser:CheerioAPI
    public metadata:Imetadata
    public vars:object|null

    //regexp
    static imgFinder:RegExp = /("|')(?<link>https:\/\/[^\s'"]+(jpg|jpeg|bmp|gif|png|webp)[^\s'"]*)\1/gm
    static videoFinder:RegExp = /("|')(?<link>https:\/\/[^\s'\"]+(mp4|webm)[^ '"]*)\1/gm
    static textFinder:RegExp = /<a.*href="(?<link>[^"]+)"[.*<\s\S]*>(?<text>[^<]+)[>\s\S]*<\/a>/gm
    static keyValueFinder:RegExp = /^(?<key>[A-z0-9\s\.'"]+):\s*(?<value>[A-z0-9\s\.'"]+)$/gm
    static imgTagFinder:RegExp = /<img.*src="(?<link>[^"]+)".*>"/gm
    static dateRegex:RegExp = /(?<month>\S+)(\/|-|\.| )(?<day>[0-9]+).*(\/|-|\.| )(?<year>[0-9]+)/gm;


    constructor(content:string,vars?:object,previousData?:Imetadata){
        this.parser=cheerio.load(content)
        if(vars){
            this.vars=vars
        }else{
            this.vars=null
        }
        if(previousData){
            this.metadata=previousData
        }else{
            this.metadata={}
        }
    }

    Change(content:string,vars?:object,previousData?:Imetadata){
        this.parser=cheerio.load(content)
        if(vars){
            this.vars=vars
        }else{
            this.vars=null
        }
        if(previousData){
            this.metadata=previousData
        }else{
            this.metadata={}
        }
    }
    selector(selector:string):Array<ISelectEnv> {
        let selectorArray =  this.parser(selector).toArray()
        let result = selectorArray.map(nod=>{
            let node = nod as INode //cheerio node  doesn't have this attribute, but it exists
            let html = this.parser(nod).html()
            let text = this.parser(nod).text().trim()
            let attrs = node.attribs
            return {
                html,text,attrs
            }
        })
        return result
    }

    static RegExpReplace(pattern:string|RegExp,text:string):IRegExpExec|null{
        if(typeof pattern == "string"){
            pattern=new RegExp(pattern,"gm")   
        }
        let temp = pattern.exec(text)
        if(temp==null){
            return null
        }else{
            let content=temp.map(x=>x)
            let tempp:IRegExpExec={
                content
            }
            if(temp.groups){
                tempp.group=temp.groups
            }
            return tempp
        }
    }
    //!!对于number返回值，出错的一律返回NaN (Not a Number)
    static TimeCaculate(hour:string|number,min:string|number,sec:string|number):number{
       let hourt=this.toNum(hour)
       let mint=this.toNum(min)
       let sect=this.toNum(sec)
       let result:number
       if(!isNaN(hourt)&&!isNaN(mint)&&!isNaN(sect)){
            result=hourt*3600+mint*60+sect
       }else{
           result=NaN
       }
       return result
    }

    static toNum(text:string|number):number{
        if(typeof text=="number"){
            return text
        }
        let result:number
        try{
            result=Number(text)
            return result
        }catch(e){
            return NaN
        }
    }    

    static string2numMonth(mon:string):number{
        let temp = Date.parse(mon+"1,2021")
        if(!isNaN(temp)){
            let mon = new Date(temp).getMonth()
            return mon+1 
        }
        return NaN
    }

    static ToDate(year:string|number,month:string|number,day:number|string):number{
        let y = this.toNum(year)
        let m = this.toNum(month)
        let d = this.toNum(day)
        if(isNaN(m)&& typeof month == "string"){
            m=this.string2numMonth(month)
        }
        if(!isNaN(y)&&!isNaN(m)&&!isNaN(d)){
            let dd = new Date(`${y}-${m}-${d}`)
            let result = dd.getTime()
            return result
        }else{
            return NaN
        }

    }
    static ReplaceTandN(text:string):string{
        return text.replace(`\t\t\t\t\t\t`,"")
    }
    Parse(key:string,selector:string|string[],callback:(para:ISelectEnv[])=>any){
        let envs:ISelectEnv[]=[]
        if(typeof selector == "string"){
            let envs = this.selector(selector)
            
        }else{
            selector.forEach(se=>{
                let temp = this.selector(se)
                envs.push(...temp)
            })

        }
        this.metadata[key]=callback(envs)
    }
    ParseVars(key:string,VarKey:string){
        let vars = this.vars
        let result:any
        try{
            result= eval(VarKey)
        }catch(e){
            result=null
        }
        if(result!=null){
            this.metadata[key]=result
        }
        
    }
}
