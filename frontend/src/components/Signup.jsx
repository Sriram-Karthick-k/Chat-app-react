import React, { useState } from "react"
import Input from "./utilities/Input"
import Button from "./utilities/Button"
import { Link } from "react-router-dom"
import LogoimageswithText from "./utilities/LogoimageswithText"
import Error from "./utilities/Error"
import Axios from "axios"

function Signup() {
  var initial = { mail: [0, ""], userName: [0, ""], password: [0, ""], confirmPassword: [0, ""] }
  const [error, setError] = useState(initial)
  const [body, setBody] = useState({ mail: "", userName: "", password: "", confirmPassword: "" })
  function update(event) {
    if (event.target.name === "mail") {
      setBody({ mail: event.target.value, userName: body.userName, password: body.password, confirmPassword: body.confirmPassword })
    } else if (event.target.name === "userName") {
      setBody({ mail: body.mail, userName: event.target.value, password: body.password, confirmPassword: body.confirmPassword })
    } else if (event.target.name === "password") {
      setBody({ mail: body.mail, userName: body.userName, password: event.target.value, confirmPassword: body.confirmPassword })
    } else if (event.target.name === "confirmPassword") {
      setBody({ mail: body.mail, userName: body.userName, password: body.password, confirmPassword: event.target.value })
    }
  }
  function signUn(event) {
    event.preventDefault()
    Axios
      .post("/sign-up", body)
      .then(res => {
        if (res.data.valid) {
          setBody(initial)
          window.location = "/sign-in"
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
          <LogoimageswithText class="logo-container" src="./images/chat-logo.png" name="Chat Signup" />
          <Input type="mail" name="mail" autofocus="false" placeHolder="Email Address" autocomplete="off" onchange={update} />
          <Error text={error.mail[0] === 0 ? "" : error.mail[1]} />
          <Input type="text" name="userName" autofocus="false" placeHolder="User Name" autocomplete="off" onchange={update} />
          <Error text={error.userName[0] === 0 ? "" : error.userName[1]} />
          <Input type="password" name="password" autofocus="false" placeHolder="Password" autocomplete="off" onchange={update} />
          <Error text={error.password[0] === 0 ? "" : error.password[1]} />
          <Input type="password" name="confirmPassword" autofocus="false" placeHolder="Confirm Password" autocomplete="off" onchange={update} />
          <Error text={error.confirmPassword[0] === 0 ? "" : error.confirmPassword[1]} />
          <Button text="Sign up" class="Button-big" type="button" onclick={signUn} />
          <Link to="/sign-in" className="nav-link text-center">Already having an account ?</Link>
        </form>
      </div>
    )
  }
}

export default Signup 