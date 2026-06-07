import React, { useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8000/api/";

export default function RequestAccessForm({ onAccessGranted }) {
  const [form, setForm] = useState({
    student_id: "",
    full_name: "",
    email: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}request-access/`, form);
      alert("✅ Request sent to admin. Wait for approval.");
    } catch (err) {
      alert(err.response?.data?.message || "❌ Error sending request.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Request Clearance Form Access</h2>
      <input name="full_name" placeholder="Full Name" onChange={handleChange} required />
      <input name="student_id" placeholder="Student ID" onChange={handleChange} required />
      <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
      <button type="submit">Request Access</button>
    </form>
  );
}
