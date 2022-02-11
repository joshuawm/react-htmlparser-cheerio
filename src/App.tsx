import { ChangeEvent, useState } from 'react'
// import './App.css'
import "./App.css"
import cheerio from "cheerio"
import {HtmlParser,ISelectEnv} from "./htmlparser"

interface response {
  status:boolean
  html:string
  err:string|null
  vars:object|string
}


const p = new HtmlParser("")
let originalFromLeft:ISelectEnv[]
let rightEnvArray:ISelectEnv[]|null =[] 
enum attrSelection{
  html="html",
  text="text"
}

function addNumForArray(arr:Array<object>){
  for(let index = 0;index<arr.length;index++){
    arr[index]=Object.assign({index:index},arr[index])
  }
  return arr
}

let interRegExpObj:RegExp

function App() {
  //dynamic Page
  const [dynaURl,setDynaURL] = useState(true)
  //后端页面的
  const [backURL,setBackURl]  = useState(()=>{
    let u = localStorage.getItem("backendurl")
    let t:string
    if(u==null){
      alert("no backend url, pls set first")
      t=""
    }else{
      t=u
    }
    return t
  })
  //网址URL
  const [URL,setURL]=useState("https://www.lucasentertainment.com/scenes/play/rudy-gram-slams-steven-angel-in-the-ass")
  //variableName
  const[variableString,setVariableString] = useState("")
  const[varDisable,setVarDisable] = useState(false)
  //selector
  const [selector,setSelector]=useState("")
  //左侧的数据展示页面
  const [seleed ,setSeleed]=useState("")
  //选择的范围处理
  const [selecNum,setSelectNum]=useState("")
  //选择的属性
  const [selectedAttr,setSelectedAttr]=useState("html")
  //正则表达式
  const [regexExp,setRegexExp]=useState("")
  //右侧结果展示
  const [toolDisplay,setToolDisplay]=useState("")
  //内部预制的regex
  const [interReg,setInterReg]=useState("imgFinder")
  //backend display change
  const [backendURLChangeClass,setBackendURLChangeClass] = useState("falsed")
  // let selected:Array<ISelectEnv>

  const reqHTML=async ()=>{
    let response:Response
    let tempURL= URL
    setURL("loading...........")
    if(dynaURl){
      if(variableString==""){
        response = await fetch(`${backURL}${URL}`)
      }else{
        response = await fetch(`${backURL}${URL}&varName=${variableString}`)
      }
    }else{
      response = await fetch(`${backURL}${URL}&dyna=fla`)
    }
    let result:response = await response.json() as response
    setURL(tempURL) 
    if(result.status){
      alert("Success!")
      if(result.vars==""){
        p.Change(result.html)
      }else if(typeof result.vars=="object"){
        p.Change(result.html,result.vars)
      }else{
        alert("failed to change,try again!")
      }}else{
      alert("fail!")
    }
       
  }
  const handleSelect=(e:ChangeEvent<HTMLInputElement>)=>{
    let pp = e.target.value
    setSelector(pp)
    let vars= p.vars
    if(/vars.*/.test(pp)){
      try{
        let j = JSON.stringify(eval(pp),null,2)
        setSeleed(j)
      }catch(e){
        setSeleed(JSON.stringify(e))
      }
    }else{
      let tr = p?.selector(e.target.value)
      let tt= addNumForArray(tr)
      originalFromLeft=tr
      setSeleed(JSON.stringify(tt,null,2))
    }
  }
  const selectFurther=(op:ISelectEnv[])=>{
    if(selecNum=="-1"){
      //nothing to do
    }else if(!isNaN(Number(selecNum))){
      op=[op[Number(selecNum)]]
    }else if(selecNum.split(",").length>0){
       let temp:ISelectEnv[]=[]
       let tt = selecNum.split(",")
       tt.map(x=>{
        let yy= Number(x)
        if(isNaN(yy)){
          alert(`${x}不是一个数字，执行停止`)
          return null
        }
        temp.push(op[yy])
       })
       op=temp
    }else if(selecNum.split("-").length==2){
      let temp:ISelectEnv[]=[]
      let ouou = selecNum.split("-")
      let inn:number[] = []
      if(isNaN(Number(ouou[0]))){
        alert(`${ouou[0]}不是数字`)
        return null
      }else{
        inn[0]=Number(ouou[0])
      }
      if(isNaN(Number(ouou[1]))){
        alert(`${ouou[1]}不是数字`)
        return null
      }else{
        inn[1]=Number(ouou[1])
      }
      if(ouou[0]>ouou[1]){
        alert("将数字从大到小排列")
        return null
      }
      for(let ind=inn[0];ind<=inn[1];ind=ind+1){
        temp.push(op[ind])
      }
      op=temp
    }else{
      alert(`检查表达式，一个都不匹配`)
      return null
    }
    return op
  }
  const regexProcess =(pattern:string|RegExp,attr:string)=>{
    if(rightEnvArray==null){
      return
    }
    if(pattern===""){
      pattern=interRegExpObj
    }
    let interlude =rightEnvArray.map(x=>{
      if(attr==="html"){
        let owild =HtmlParser.RegExpReplace(pattern,x.html as string)
        console.log(owild==null)
        return owild
      }else if(attr==="text"){
        return HtmlParser.RegExpReplace(pattern,x[attr])
      }
      
    })
    let ppppp= JSON.stringify(interlude,null,2)
    setToolDisplay(ppppp)
  }
  const optoionsGener=()=>{
    let readyReturn=[]
    for (let key in HtmlParser){
      readyReturn.push(<option value={key} >{key}</option>)
    }
    internalRegExpChange(interReg)
    return readyReturn
  }
  const changeBackendURL=()=>{
    let y = document.querySelector("input.back") as HTMLInputElement
    setBackURl(y.value)
    localStorage.setItem("backendurl",y.value)
    alert("sucess")
  }
  const internalRegExpChange=(v:string,rerender?:boolean)=>{
    if(rerender){
      setInterReg(v)
    }
    switch(v){
      case "imgFinder":
        interRegExpObj=HtmlParser.imgFinder
        break;
      case "videoFinder":
        interRegExpObj=HtmlParser.videoFinder
        break;
      case "textFinder":
        interRegExpObj=HtmlParser.textFinder
        break
      case "keyValueFinder":
        interRegExpObj=HtmlParser.keyValueFinder
        break
      case "imgTagFinder":
        interRegExpObj=HtmlParser.imgTagFinder
        break
      case "dateRegex":
        interRegExpObj=HtmlParser.dateRegex
        break
    }
  }

  const varDiability=()=>{
    setDynaURL(!dynaURl)
    if(dynaURl){
      setVarDisable(true)
    }else{
      setVarDisable(false)
    }
  }

  return (
    <div className="App">
      <div className={backendURLChangeClass}  >
        <input className='back' value={backURL} onChange={e=>setBackURl(e.target.value)} pattern="https://.+=$"></input>
        <button onClick={changeBackendURL} >change back URL</button>
        <button onClick={()=>setBackendURLChangeClass("falsed")}>x</button>
      </div>

      <div className='GetHtml'>
        <input className='url' value={URL} onChange={e=>setURL(e.target.value)} placeholder="url to be scrpaed" ></input>
        <input className='vari' value={variableString} onChange={e=>setVariableString(e.target.value)} disabled={varDisable} placeholder="varibaleName" ></input>
        <input type="radio" checked={dynaURl} className='dyna' name='dynamicStatus'onClick={varDiability}  value="dynamicEnhanced"></input>
        <label htmlFor='dynamicEnhanced' >动态页面抓取增强</label>
        <button onClick={reqHTML}>Ok</button> 
        <button onClick={()=>setBackendURLChangeClass("trued")} className="backendURLButton" >changeBackendURL</button>
      </div>

        <div className='leftWorld'>
          <div className='selector'>
              <input name='selector' value={selector} onChange={handleSelect}></input>
          </div>
          <div className='dataDisplay'>
              <pre className='preRender left'>{seleed}</pre>
            </div>
        </div>

        <div className='rightWord '>
          <span>当前的第几个被选中</span>
          <input value={selecNum} onChange={e=>setSelectNum(e.target.value)}></input>
          <button onClick={()=>{rightEnvArray = selectFurther(originalFromLeft);if(rightEnvArray===null){setToolDisplay("")}else{setToolDisplay(JSON.stringify(rightEnvArray,undefined,2))}}}>select</button>
          
          <div className='regexExtrac'>
            <span>regexExp    </span>
            <select value={selectedAttr} onChange={(e)=>setSelectedAttr(e.target.value)}>
              <option value="html">html</option>
              <option value="text">text</option>
              {/* <option value="attrs">attrs不要选</option> */}
            </select>
            <select name='internalRegExp' onChange={e=>{internalRegExpChange(e.target.value,true)}}>
              {optoionsGener()}
            </select>
            
            <input name='regexExp' value={regexExp} onChange={(e)=>{setRegexExp(e.target.value)}}></input>
            <button onClick={()=>{regexProcess(regexExp,selectedAttr)}}>regex</button>
          </div>
          <ToDate></ToDate>
          <ToRuntime></ToRuntime>
          <div className='toolDisplay'>
            <pre className='preRender right'>
              {toolDisplay}
            </pre>
          </div>

        </div>

      </div>
  )
}

function ToDate(){
  const [year,setYear] = useState("")
  const [month,setMonth]=useState("")
  const [day,setDay] = useState("")
  const [result,setResult] = useState("")
  const resultHandle=()=>{
    if(isNaN(Number(year))){
      setResult(`${year} NaN`)
      return
    }
    // if(isNaN(Number(month))){
    //   setResult(`${month} NaN`)
    //   return
    // }
    if(isNaN(Number(day))){
      setResult(`${day} NaN`)
      return
    }

    let p =HtmlParser.ToDate(year,month,day)
    if(isNaN(p)){
      setResult("NaN,check again")
    }else{
      let op = new Date(p)
      setResult(op.toDateString())
    }
  }
  return(
    <div className='toDate'>

      <input name='year' placeholder='year' value={year} onChange={e=>setYear(e.target.value)} ></input>
      <input name='month' placeholder='month' value={month} onChange={e=>setMonth(e.target.value)} ></input>
      <input name='day' placeholder='day' value={day} onChange={e=>setDay(e.target.value)} ></input>
      <button onClick={resultHandle}>toDate</button>
      <span>{result}</span>
    </div>
  )
}

function ToRuntime(){
  const [hour,setHour] = useState("")
  const [min,setMin] =useState("")
  const [sec,setSec]= useState("")
  const [result,setResult] = useState("")
  const resultHandle=()=>{
  
    if(isNaN(Number(hour))){
      setResult(`${hour} NaN`)
      return
    }
    if(isNaN(Number(min))){
      setResult(`${min} NaN`)
      return
    }
    if(isNaN(Number(sec))){
      setResult(`${sec} NaN`)
      return
    }
    
    let op = HtmlParser.TimeCaculate(hour,min,sec)
    if(isNaN(op)){
      alert("failed to exec timeCalculate")
      return
    }else{
      let mins = op%3600
      let h = (op-mins)/3600
      let sec = mins%60
      let min = (mins-sec)/60
      setResult(`${h} hour(s) ${min} mins ${sec} secs`)
    }

  }
  return(
    <div className='toRuntime'>
      <input name='hour' placeholder='hour' value={hour} onChange={e=>setHour(e.target.value)} ></input>
      <input name='min' placeholder='min' value={min} onChange={e=>setMin(e.target.value)}></input>
      <input name='sec' placeholder='sec' value={sec} onChange={e=>setSec(e.target.value)}></input>
      <button onClick={resultHandle}>time calculation</button>
      <span>
        {result}
      </span>
    </div>
  )
}

export default App
