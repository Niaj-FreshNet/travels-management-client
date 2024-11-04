import React, { useState } from "react";
import { Form, Input, Button, notification, Card, Checkbox } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../Hooks/useAuth";

const Login = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (values) => {
    signIn(values.email, values.password)
      .then(() => {
        notification.success({
          message: "Login Successful",
          description: "Welcome!",
          placement: "top",
        });
        setIsLoggedIn(true);
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 1000);
      })
      .catch((error) => {
        notification.error({
          message: "Login Failed",
          description: "Check your credentials and try again.",
          placement: "top",
        });
        console.error(error);
      });
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #26a69a 100%)",
      }}
    >
      {!isLoggedIn ? (
        <Card
          bordered={false}
          style={{
            width: 360,
            padding: "40px 30px",
            backgroundColor: "#12283a",
            borderRadius: 10,
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "#2a5298",
              margin: "0 auto",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UserOutlined style={{ fontSize: 40, color: "#fff" }} />
          </div>
          <h2 className="text-2xl font-semibold text-gray-200 mb-6">Login</h2>
          <Form onFinish={handleLogin} layout="vertical">
            <Form.Item
              name="email"
              rules={[{ required: true, message: "Please enter your email!" }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: "#888" }} />}
                type="email"
                placeholder="Email"
                style={{
                  backgroundColor: "#374151",
                  border: "none",
                  color: "#D1D5DB",
                }}
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please enter your password!" },
                {
                  pattern: /^(?=.*[0-9])(?=.*[a-zA-Z]).{6,}$/,
                  message: "Password must contain at least 6 characters with 1 letter and 1 digit!",
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "#888" }} />}
                placeholder="Password"
                style={{
                  backgroundColor: "#374151",
                  border: "none",
                  color: "#D1D5DB",
                }}
              />
            </Form.Item>
            <div className="flex justify-between items-center mb-4">

            </div>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full bg-blue-700 hover:bg-blue-800 border-none text-white font-bold"
                style={{
                  transition: "background-color 0.3s ease", // Smooth transition for hover effect
                }}
              >
                LOGIN
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ) : (
        <div className="text-center">
          <Card
            style={{
              width: 360,
              backgroundColor: "#111827",
              color: "#D1D5DB",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
              borderRadius: 10,
            }}
            className="p-8"
          >
            <h2 className="text-2xl font-semibold mb-2">Welcome Back!</h2>
            <p className="text-md">You have successfully logged in.</p>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Login;
