import React from "react"

function Input(props) {
  var classname = "input border-bottom " + props.class
  if (props.autofocus === "true") {
    return (
      <div className="Input">
        <input autoComplete={props.autocomplete} value={props.value} onBlur={props.onblur} placeholder={props.placeHolder} onClose={props.onClose} id={props.id} className={classname} onChange={props.onchange} name={props.name} onClick={props.onclick} type={props.type} required autoFocus />
        <span className="border-bottom-animation center"></span>
      </div>
    )
  }
  if (props.autofocus === "false") {
    return (
      <div className="Input">
        <input autoComplete={props.autocomplete} value={props.value} onBlur={props.onblur} placeholder={props.placeHolder} onClose={props.onClose} id={props.id} className={classname} onChange={props.onchange} name={props.name} onClick={props.onclick} type={props.type} required />
        <span className="border-bottom-animation center"></span>
      </div>
    )
  }
}
export default Input
