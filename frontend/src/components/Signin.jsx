import React, { useState } from "react"
import Input from "./utilities/Input"
import Button from "./utilities/Button"
import { Link } from "react-router-dom"
import LogoimageswithText from "./utilities/LogoimageswithText"
import Error from "./utilities/Error"
import Axios from "axios"
function Signup() {
  var initial = { mail: "", password: "" }
  var errorInitial = { mail: [0, ""], password: [0, ""] }
  const [error, setError] = useState(errorInitial)
  const [body, setBody] = useState(initial)
  function update(event) {
    if (event.target.name === "mail") {
      setBody({ mail: event.target.value, password: body.password })
    } else {
      setBody({ mail: body.mail, password: event.target.value })
    }
  }
  function signIn(event) {
    event.preventDefault()
    Axios
      .post("/sign-in", body)
      .then(res => {
        if (res.data.auth) {
          setError(errorInitial)
          setBody(initial)
          localStorage.setItem("userData", JSON.stringify(res.data.user))
          localStorage.setItem("token", (res.data.token))
          window.location = "/"
        } else {
          setError(res.data)
        }
      })
      .catch((error) => { console.log(error) })
  }
  if (!localStorage.getItem("userData")) {
    return (
      <div className="sign-in row ">
        <form className="form page-center copy-text col-lg-10 col-md-10 col-10">
          <LogoimageswithText class="logo-container" src="./images/chat-logo.png" name="Chat Signin" />
          <Input type="text" class="" name="mail" autofocus="false" placeHolder="Email Address or User Name" autocomplete="off" onchange={update} />
          <Error text={error.mail[0] === 0 ? "" : error.mail[1]} />
          <Input type="password" class="" name="password" autofocus="false" placeHolder="Password" autocomplete="off" onchange={update} />
          <Error text={error.password[0] === 0 ? "" : error.password[1]} />
          <Button text="Sign in" class="Button-big" type="button" onclick={signIn} />
          <Link to="/sign-up" className="nav-link text-center">Create a new account.</Link>
          <Link to="/forgot" className="nav-link text-center">forgot password.</Link>
        </form>
      </div>
    )
  }
}

export default Signup 