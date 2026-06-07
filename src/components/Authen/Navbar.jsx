import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const raw = sessionStorage.getItem("ucs_current");
  const user = raw ? JSON.parse(raw) : null;

}
