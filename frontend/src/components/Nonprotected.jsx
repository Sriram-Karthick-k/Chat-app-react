import React, { useEffect } from "react"
import {
  Redirect
} from "react-router-dom";
import axios from "axios"
function Protected(props) {
  const auth = JSON.parse(localStorage.getItem("userData"))
  useEffect(() => {
    axios
      .get("http://localhost:3001/isAuth", { headers: { "x-access-token": localStorage.getItem("token") } })
      .then(res => {
        if (res.data.loggedIn === true) {
          window.location = "/"
        }
      })
  }, [])
  return <div>{auth ? <Redirect to="/" /> : <props.component />}</div>
}
export default Protected