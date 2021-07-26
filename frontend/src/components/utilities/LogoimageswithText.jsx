import React from "react"

function LogoimageswithText(props) {
  var classname = "text-center " + props.class
  return (
    <div className={classname}>
      <img src={props.src} alt="images" className="logo-image" />
      <h1 className="logo-text">{props.name}</h1>
    </div>
  )
}
export default LogoimageswithText;
