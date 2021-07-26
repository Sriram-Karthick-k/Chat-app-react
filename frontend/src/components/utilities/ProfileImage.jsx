import React, { useState, useEffect } from "react"
import Axios from "axios"
function ProfileImage(props) {
  const [image, setImage] = useState({ path: "" })
  useEffect(() => {
    var userDetails = JSON.parse(localStorage.getItem("userData"))
    Axios
      .get("/profileImage?mail=" + userDetails.mail)
      .then(res => {
        if (res.data.image !== "false") {
          setImage({ path: "data:image/png;base64," + res.data.image })
        } else {
          setImage({ path: "./images/user.png" })
        }
      })
      .catch(err => { console.log(err) })
  }, [])
  return (
    <img src={image.path} className="profileImage text-center" alt="./images/user.png" />
  )
}
export default ProfileImage