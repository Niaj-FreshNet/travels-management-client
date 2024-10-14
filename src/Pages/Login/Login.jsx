import React from "react";
import { Form, Input, Button, notification } from "antd";
import { useNavigate, Link, useLocation } from "react-router-dom";
import useAuth from "../../Hooks/useAuth";

const Login = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";
  console.log("state in the location login page", location.state);

  const handleLogin = (values) => {
    console.log(values.email, values.password);

    signIn(values.email, values.password)
      .then((result) => {
        const user = result.user;
        console.log(user);
        notification.success({
          message: "Login Successful",
          description: "You have successfully logged in!",
          placement: "topRight",
        });
        navigate(from, { replace: true });
      })
      .catch((error) => {
        notification.error({
          message: "Login Failed",
          description: "There was an error logging in.",
          placement: "topRight",
        });
        console.error(error);
      });
  };

  return (
    <div className="hero bg-base-200 min-h-screen flex items-center justify-center">
      <div className="hero-content flex-col w-full">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white">Login First</h1>
        </div>
        <div className="card w-full bg-white max-w-sm shadow-2xl px-8 pt-6 pb-0">
          <Form onFinish={handleLogin} layout="vertical">
            <div>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ required: true, message: "Please input your email!" }]}
              >
                <Input type="email" placeholder="Email" />
              </Form.Item>
              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Please input your password!" },
                  { min: 6, message: "Password must be at least 6 characters long!" },
                  {
                    pattern: /^(?=.*[0-9])(?=.*[a-zA-Z]).{6,}$/,
                    message: "Password must contain at least 1 letter and 1 digit!",
                  },
                ]}
              >
                <Input.Password placeholder="Password" />
              </Form.Item>
            </div>
            <Form.Item>
              <Button size="large" type="primary" htmlType="submit" className="w-full mt-2">
                Login
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
