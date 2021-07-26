import React from "react"
import {
  BrowserRouter as Router,
  Route,
  Switch
} from "react-router-dom";
import Signup from "./Signup"
import Notfound from "./Notfound"
import Signin from "./Signin"
import Index from "./Index"
import Protected from "./Protected";
import Nonprotected from "./Nonprotected"
import Forgot from "./Forgot"
import Profile from "./Profile"
function Routes() {
  return (
    <Router >
      <Switch >
        <Route exact path="/sign-up" ><Nonprotected component={Signup} /></Route>
        <Route exact path="/sign-in" > <Nonprotected component={Signin} /></Route>
        <Route exact path="/forgot" component={Forgot} />
        <Route exact path="/" ><Protected component={Index} /></Route>
        <Route exact path="/profile" ><Protected component={Profile} /></Route>
        <Route component={Notfound} />
      </Switch >
    </Router>
  )
}
export default Routes