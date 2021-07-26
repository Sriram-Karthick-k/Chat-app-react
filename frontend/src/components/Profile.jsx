import React, { useEffect, useState } from "react"
import Axios from "axios"
import Button from "./utilities/Button"
import PrifileImage from "./utilities/ProfileImage"
import Lable from './utilities/Lable';

function Profile() {
  const [userDetails, setUserDetails] = useState({ userName: '', mail: "", image: "" })
  const [file, setFile] = useState({})
  useEffect(() => {
    var userDetails = JSON.parse(localStorage.getItem("userData"))
    Axios
      .get("/profile?mail=" + userDetails.mail)
      .then(res => {
        setUserDetails(res.data)
      })
      .catch(err => { console.log(err) })
  }, [])
  function upload() {
    var userDetails = JSON.parse(localStorage.getItem("userData"))
    const data = new FormData()
    data.append("file", file)
    data.append("mail", userDetails.mail)
    Axios
      .post("/upload", data)
      .then(res => {
        if (res.data.status === true) {
          window.location = "/"
        }
      })
      .catch(err => console.log(err))
  }
  if (localStorage.getItem("userData")) {
    return (
      <div className="Profile row ">
        <form className="form page-center copy-text col-lg-10 col-md-10 col-10">
          <PrifileImage></PrifileImage>
          <input type="file" name="image" accept=".png" className="text-center image-upload" onChange={event => { setFile(event.target.files[0]) }}></input>
          <Lable text={"User Name : " + userDetails.userName}></Lable>

          {/* {
            inputVisible.userName ?
              <div className="row">
                <div className="col col-lg-6 col-md-6 col-6">
                </div>
                <div className="col col-lg-5 col-md-6 col-6">
                  <Button text="Edit" class="Button-small" type="button" />
                </div>
              </div>
              :
              <Input type="text" class="" name="profile" autofocus="false" placeHolder="User Name" autocomplete="off" />
          } */}
          <Lable text={"Mail : " + userDetails.mail}></Lable>
          <Button text="Save Changes" class="Button-big" onclick={upload} type="button" />
        </form >
      </div >
    )
  }
}
export default Profile