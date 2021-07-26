import React, { useEffect, useState, useRef } from "react"
import Input from "./utilities/Input"
import Button from "./utilities/Button"
import { Link } from "react-router-dom"
import LogoimageswithText from "./utilities/LogoimageswithText"
import Error from "./utilities/Error"
import Axios from "axios"
import Swal from "sweetalert2"
import Searchinput from "./utilities/Search"
import io from "socket.io-client"

function Index() {
  const [error, setError] = useState({ verification: [0, ""] })
  const [body, setBody] = useState({ verification: "" })
  const [visible, setVisible] = useState({ sidebar: "", content: "content content-invisible" })
  const [userImage, setUserImage] = useState({ path: "" })
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [receiver, setreceiver] = useState("")
  const [receiverImage, setReceiverImage] = useState("")
  const socketRef = useRef();
  const [chatList, setChatList] = useState([])
  const [lastOnline, setLastOnline] = useState("")
  useEffect(() => {
    var userDetails = JSON.parse(localStorage.getItem("userData"))
    Axios
      .get("/profileImage?mail=" + userDetails.mail)
      .then(res => {
        if (res.data.image !== "false") {
          setUserImage({ path: "data:image/png;base64," + res.data.image })
        } else {
          setUserImage({ path: "./images/user.png" })
        }
      })
      .catch(err => { console.log(err) })
  }, [])


  function update(event) {
    if (event.target.name === "verification") {
      setBody({ verification: event.target.value })
    }
  }

  function verification() {
    var data = JSON.parse(localStorage.getItem("userData"))
    if (String(data.verification[0]) === String(body.verification)) {
      Axios
        .post("/verification", JSON.parse(localStorage.getItem("userData")))
        .then(res => {
          setError({ verification: [0, ""] })
          localStorage.setItem("userData", JSON.stringify(res.data))
          window.location = "/"
        })
        .catch(err => {
          console.log(err)
        })
    } else {
      setError({ verification: [1, "Invalid verification number"] })
    }
  }

  function visibilityContentOff() {
    if (visible.content === "content") {
      setVisible({ sidebar: "", content: "content content-invisible" })
    }
    setreceiver("")
  }

  function logOut() {
    Swal.fire({
      title: 'Are you sure do you want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2b2881',
      cancelButtonColor: '#e53935',
      confirmButtonText: 'Yes, Logout!'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear()
        window.location = "/sign-in"
      }
    })
  }


  useEffect(() => {
    const userDetails = JSON.parse(localStorage.getItem("userData"))
    socketRef.current = io.connect("/?userName=" + userDetails.userName);
    socketRef.current.emit("login", { userName: userDetails.userName })

    socketRef.current.on("message", (message) => {
      if (message.to === userDetails.userName) {
        receivedMessage(message);
      }
    })

    socketRef.current.on("isOnline", result => {
      if (result === "Online") {
        console.log(result)
        setLastOnline(result)
      }
    })
    socketRef.current.on("disconnect", { userName: userDetails.userName })
  }, []);

  useEffect(() => {
    const userDetails = JSON.parse(localStorage.getItem("userData"))
    Axios
      .get("/chat-list?userName=" + userDetails.userName)
      .then(res => {
        setChatList(res.data)
      })
      .catch(err => { console.log(err) })
  }, [])
  function visibilityContentOn(event) {
    var index = event.target.id.split("-")[1]
    var from = JSON.parse(localStorage.getItem("userData"))
    const userName = document.getElementById("sideBarUser-" + index).innerHTML
    const image = document.getElementById("sideBarImg-" + index).src
    setVisible({ sidebar: "sidebar-invisible", content: "content" })
    setMessages([])
    Axios
      .get("/chat-details?from=" + from.userName + "&to=" + userName)
      .then(res => {
        if (res.data.exist) {
          setreceiver(userName)
          setReceiverImage(image)
          setMessages(res.data.chat)
          setLastOnline(res.data.lastOnline)
          var objDiv = document.getElementById("your_div");
          objDiv.scrollTop = objDiv.scrollHeight
        } else {
          setreceiver(userName)
          setReceiverImage(image)
          setLastOnline(res.data.lastOnline)
        }
      })
      .catch(err => { console.log(err) })
    Axios
      .get("/clearUnseen?from=" + from.userName + "&to=" + userName)
      .then(res => {
        console.log(res.data)
      })
      .catch(err => { console.log(err) })
    updateChatList()
  }

  function receivedMessage(message) {
    var userDetails = JSON.parse(localStorage.getItem("userData"))
    if (message.from === userDetails.userName || message.to === userDetails.userName) {
      setMessages(oldMsgs => [...oldMsgs, message]);
      updateChatList()
      var activeUser = document.getElementById("activeUser").innerHTML
      if (activeUser == message.from) {
        Axios
          .get("/clearUnseen?from=" + userDetails.userName + "&to=" + message.from)
          .then(res => {
            console.log(res.data)
          })
          .catch(err => { console.log(err) })
        updateChatList()
        var objDiv = document.getElementById("your_div");
        objDiv.scrollTop = objDiv.scrollHeight
      }
    }
    var objDiv = document.getElementById("your_div");
    objDiv.scrollTop = objDiv.scrollHeight
  }
  function updateChatList() {
    const userDetails = JSON.parse(localStorage.getItem("userData"))
    Axios
      .get("/chat-list?userName=" + userDetails.userName)
      .then(res => {
        setChatList(res.data)
      })
      .catch(err => { console.log(err) })
  }

  //sending messages
  function sendMessage(e) {
    var userDetails = JSON.parse(localStorage.getItem("userData"))
    const messageObject = {
      from: userDetails.userName,
      to: receiver,
      message: message,
      time: new Date().toLocaleTimeString()
    };
    setMessage("");
    socketRef.current.emit("send message", messageObject);
    receivedMessage(messageObject)
    var objDiv = document.getElementById("your_div");
    objDiv.scrollTop = objDiv.scrollHeight
    updateChatList()
  }

  //onclick of suggestions
  function updateInput(event) {
    var index = event.target.id.split("-")[1]
    var from = JSON.parse(localStorage.getItem("userData"))
    const userName = document.getElementById("userName-" + index).innerHTML
    const image = document.getElementById("img-" + index).src
    setVisible({ sidebar: "sidebar-invisible", content: "content" })
    Axios
      .get("/chat-details?from=" + from.userName + "&to=" + userName)
      .then(res => {
        if (res.data.exist) {
          setreceiver(userName)
          setReceiverImage(image)
          setMessages(res.data.chat)
          setLastOnline(res.data.lastOnline)
          var objDiv = document.getElementById("your_div");
          objDiv.scrollTop = objDiv.scrollHeight
        } else {
          setreceiver(userName)
          setReceiverImage(image)
          setLastOnline(res.data.lastOnline)
        }
      })
      .catch(err => { console.log(err) })
    Axios
      .get("/clearUnseen?from=" + from.userName + "&to=" + userName)
      .then(res => {
        // sideBarUnSeen-
        document.getElementById("sideBarUnSeen-" + index).innerHTML = 0
      })
      .catch(err => { console.log(err) })
  }
  function handleChange(e) {
    setMessage(e.target.value);
  }
  if (localStorage.getItem("userData")) {
    return (
      (JSON.parse(localStorage.getItem("userData")).verification[1] === "NO") ?
        <div className="sign-in row ">
          <form className="form page-center copy-text col-lg-10 col-md-10 col-10">
            <LogoimageswithText class="logo-container" src="./images/chat-logo.png" name="Chat Verification" />
            <Input onchange={update} type="number" class="" name="verification" autofocus="false" placeHolder="Enter the verification code" autocomplete="off" />
            <Error text={error.verification[0] === 0 ? "" : error.verification[1]} />
            <Button text="Verify" class="Button-big" type="button" onclick={verification} />
          </form>
        </div>
        :
        <div className="container copy-text">
          <sidebar className={visible.sidebar}>
            <div className="header">
              <div className="header-top-layer">
                <Link to="/profile"><img src={userImage.path} alt="" /></Link>
                <div className="header-logo">
                  <p className="header-text">Chat App</p>
                </div>
                <div className="dropdown">
                  <span className="dropbtn" ><i className="fas fa-ellipsis-v"></i></span>
                  <div className="dropdown-content">
                    <Link to="/profile">Profile</Link>
                    <Link to="#" onClick={logOut} className="">Log out</Link>
                  </div>
                </div>
              </div>
            </div>
            <Searchinput id="search" onclick={updateInput} placeholder="Search" />
            <div className="list-wrap">
              {chatList.map((chat, index) => {
                var user = JSON.parse(localStorage.getItem("userData"))
                var lastMessage = ""
                if (user.userName === chat.lastMessage.from) {
                  lastMessage = "You: " + chat.lastMessage.message
                } else {
                  lastMessage = "" + chat.to + ": " + chat.lastMessage.message
                }
                return (
                  <div className="list" id={"sideBarList-" + index} onClick={visibilityContentOn} key={index}>
                    <img id={"sideBarImg-" + index} src={(chat.image) ? "data:image/png;base64," + chat.image : "./images/user.png"} alt="" />
                    <div id={"sideBarInfoDiv-" + index} className="info">
                      <p id={"sideBarUser-" + index} className="user">{chat.to}</p>
                      <span id={"sideBarLastMessage-" + index} className="text">{lastMessage}</span>
                    </div>
                    {chat.unSeenMessages == 0 ? "" : <span id={"sideBarUnSeen-" + index} className="count">{chat.unSeenMessages}</span>}
                    <span id={"sideBarTime-" + index} className="time">{chat.time}</span>
                  </div>
                )
              })}
            </div>
          </sidebar>
          <div className={visible.content} >
            <header>
              <img src={receiverImage} alt="user image" />
              <div className="info">
                <span id={"activeUser"} className="user">{receiver}</span>
                <span className="time">{lastOnline}</span>
              </div>
              <div className="open">
                <Link to="#" onClick={visibilityContentOff}><i className="fas fa-times"></i></Link>
              </div>
            </header>
            <div className="message-wrap" id="your_div">
              {messages.map((message, index) => {
                if (message.from === JSON.parse(localStorage.getItem("userData")).userName) {
                  return (
                    <div className="message-list me" key={index}>
                      <div className="msg">
                        <p>{message.message}</p>
                      </div>
                      <div className="time">{message.time}</div>
                    </div>
                  )
                } else if (message.from === receiver) {
                  return (
                    <div className="message-list" key={index} >
                      <div className="msg">
                        <p>{message.message}</p>
                      </div>
                      <div className="time">{message.time}</div>
                    </div>
                  )
                }
              })}

            </div>
            <form className="message-footer">
              <input type="text" value={message} className="chat" name="message" onChange={handleChange} placeholder="Message" />
              <button className="button" type="button" onClick={sendMessage}>Send</button>
            </form>
          </div>

        </div>
    )
  }
}

export default Index