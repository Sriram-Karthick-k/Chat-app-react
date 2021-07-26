import React, { useState } from "react"
import axios from "axios"
import Index from "../Index";

function Searchinput(props) {
  var [display, setDisplay] = useState(false)
  var [option, setOptions] = useState([{ userName: "", userProfileImage: "" }]);
  function autocomplete(event) {
    if (event.target.value.length >= 1) {
      setDisplay(true)
      axios
        .get("/search?userName=" + event.target.value)
        .then(res => {
          setOptions(res.data)
        })
        .catch(err => {
          console.log(err)
        })
    } else {
      setDisplay(false)
      setOptions([{ lable: "" }])
    }
  }

  function focusOut() {
    setDisplay(false)
    setOptions([{ lable: "" }])
  }
  function hide() {
    setDisplay(false)
    setOptions([{ lable: "" }])
    document.getElementById(props.id).value = ""
  }
  return (
    <div className="searchContainer" onFocus={focusOut}>
      <div className="SearchInputContainer">
        <i className="fas fa-search searchLogo"></i>
        <input placeholder={props.placeholder} value={props.value} required="required" id={props.id} onChange={event => { autocomplete(event); }} name={props.name} className="SearchInput" type="text" autoFocus={props.autofocus} />
      </div>
      {
        display ?
          <div className="searched-item-container">
            {option.length !== 0 ?
              option.map((info, i) => {
                return (<div className="search-item row" id={"searchdiv-" + i} onClick={event => { props.onclick(event); hide(); }} key={i} >
                  <img className="search-image col-lg-2 col-md-2 col-2" id={"img-" + i} src={info.userProfileImage === "false" ? "./images/user.png" : "data:image/png;base64," + info.userProfileImage} alt="" />
                  <p className="search-text col-lg-10 col-md-10 col-10" id={"userName-" + i}>{info.userName}</p>
                </div>)
              })
              :
              ""
            }
          </div>
          :
          ""
      }
    </div>
  )
}
export default Searchinput