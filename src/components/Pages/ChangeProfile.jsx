import React, { useState } from "react";
import { Card, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import { apiFetch, clearSession } from "../../utils/api";

export default function ChangeProfile() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    username: "",
    email: "",
    old_password: "",
    new_password: "",
  });

  const handleChange = (key, value) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async () => {
    // Validation
    if (!Object.values(data).every(Boolean)) {
      return message.error("All fields are required");
    }

    if (data.new_password.length < 6) {
      return message.error("Password must be at least 6 characters");
    }

    try {
      setLoading(true);

      await apiFetch("change-profile/", {
        method: "POST",
        body: JSON.stringify(data),
      });

      // ✅ REMOVE OLD LOGIN DATA
      clearSession();

      message.success("Profile updated successfully. Please login again.");

      // ✅ FORCE LOGOUT & RELOGIN WITH NEW CREDENTIALS
      navigate("/login", { replace: true });
    } catch (error) {
      message.error(
        error?.message || "Failed to update profile. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Change Profile" style={{ width: 360, margin: "100px auto" }}>
      <Input
        placeholder="New Username"
        value={data.username}
        onChange={(e) => handleChange("username", e.target.value)}
      />

      <Input
        placeholder="New Email"
        style={{ marginTop: 10 }}
        value={data.email}
        onChange={(e) => handleChange("email", e.target.value)}
      />

      <Input.Password
        placeholder="Old Password"
        style={{ marginTop: 10 }}
        value={data.old_password}
        onChange={(e) => handleChange("old_password", e.target.value)}
      />

      <Input.Password
        placeholder="New Password"
        style={{ marginTop: 10 }}
        value={data.new_password}
        onChange={(e) => handleChange("new_password", e.target.value)}
      />

      <Button
        type="primary"
        block
        style={{ marginTop: 15 }}
        loading={loading}
        onClick={submit}
      >
        Update Profile
      </Button>
    </Card>
  );
}
