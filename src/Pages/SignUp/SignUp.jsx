import useAxiosUser from "../../Hooks/useAxiosUser";


const SignUp = () => {
  const axiosUser = useAxiosUser();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { createUser, updateUserProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  const onSubmit = (data) => {
    createUser(data.email, data.password)
      .then(result => {
        const loggedUser = result.user;
        Swal.fire({
          title: "Sign up successful",
          showClass: { popup: 'animate__animated animate__fadeInUp animate__faster' },
          hideClass: { popup: 'animate__animated animate__fadeOutDown animate__faster' }
        });

        updateUserProfile(data.name, data.age)
          .then(() => {
            const userInfo = {
              name: data.name,
              email: data.email
            };
            axiosPublic.post('/users', userInfo)
              .then(res => {
                if (res.data.insertedId) {
                  reset();
                  Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Profile created successfully",
                    showConfirmButton: false,
                    timer: 1500
                  });
                  navigate('/');
                }
              });
          })
          .catch(error => console.error(error));
      });
  };

  return (
    <>
      <Helmet>
        <title>Sign up - Bistro Boss Restaurant</title>
      </Helmet>
      <div className="hero bg-base-200 min-h-screen">
        <div className="hero-content flex-col lg:flex-row-reverse">
          <div className="text-center lg:text-left">
            <h1 className="text-5xl font-bold">Sign Up now!</h1>
          </div>
          <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
            <Form
              onFinish={handleSubmit(onSubmit)}
              className="card-body"
              layout="vertical"
            >
              <Form.Item
                label="Name"
                validateStatus={errors.name ? "error" : ""}
                help={errors.name && "Name field is required"}
              >
                <Input
                  {...register("name", { required: true })}
                  placeholder="name"
                  className="input input-bordered"
                />
              </Form.Item>
              <Form.Item
                label="Email"
                validateStatus={errors.email ? "error" : ""}
                help={errors.email && "Email field is required"}
              >
                <Input
                  type="email"
                  {...register("email", { required: true })}
                  placeholder="email"
                  className="input input-bordered"
                />
              </Form.Item>
              <Form.Item
                label="Password"
                validateStatus={errors.password ? "error" : ""}
                help={errors.password && (
                  errors.password.type === 'required' ? "Password is required" :
                  errors.password.type === 'minLength' ? "At least 4 digits required" :
                  errors.password.type === 'maxLength' ? "Maximum 8 digits allowed" :
                  errors.password.type === 'pattern' && "Minimum 1 uppercase, 1 lowercase, 1 digit, and 1 special character required"
                )}
              >
                <Input.Password
                  {...register("password", {
                    required: true,
                    minLength: 4,
                    maxLength: 8,
                    pattern: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$&*]).{4,8}$/
                  })}
                  placeholder="password"
                  className="input input-bordered"
                />
              </Form.Item>
              <Form.Item>
                <a href="#" className="label-text-alt link link-hover">Forgot password?</a>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" className="btn btn-primary w-full">
                  Sign Up
                </Button>
              </Form.Item>
            </Form>
            <p className="ml-8">
              <small>Already have an account? <Link to="/login" className="text-blue-600 underline">Login</Link></small>
            </p>
            {/* <SocialLogin /> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;
