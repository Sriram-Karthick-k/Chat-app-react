import React from "react"
import { Link } from "react-router-dom"
import Swal from "sweetalert2"
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
function Navbar() {
  return (
    <div className="navbar row">
      <div className="col col-12 col-lg-12 col-md-12 text-center">
        <Link to="#" onClick={logOut} className="">Log out</Link>
      </div>
    </div>
  )
}

export default Navbar