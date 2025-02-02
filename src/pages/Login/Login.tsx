import { useState, FormEvent, ChangeEvent, Fragment } from "react";
import axios from "axios";
import PublicHeader from "../components/PublicHeader";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/store/user";

const Login = () => {
  const [userId, setUserId] = useState<string>("");
  const [userPassword, setUserPassword] = useState<string>("");
  const setLoggedInUserEmail = useUserStore((state) => state.setLoggedInUserEmail);
  const setLoggedInUserName = useUserStore((state) => state.setLoggedInUserName);
  const setLoggedInUserRole = useUserStore((state) => state.setLoggedInUserRole);
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: async ({ userId, userPassword }: { userId: string; userPassword: string }) => {
      const req = { email: userId, password: userPassword };
      return axios.post("http://localhost:8080/edupi_user/v1/member/login", req, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
    },
    onSuccess(data) {
      const { email, name, role } = data.data;
      setLoggedInUserEmail(email);
      setLoggedInUserName(name);
      setLoggedInUserRole(role);
      navigate("/");
    },
    onError(error) {
      alert("아이디 또는 비밀번호가 틀렸습니다.");
      console.error("Login error:", error);
    },
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate({ userId, userPassword });
  };
  const handleUserIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserId(e.target.value);
  };
  const handleUserPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserPassword(e.target.value);
  };
  return (
    <Fragment>
      <div className={"bg-gray"}>
        <PublicHeader />
        <div className="login-wrap">
          <img className="mb20" src="/image/img_logo2.png" alt="로고" />
          <p className="mb40">
            아직 회원이 아니신가요?
            <a className="color-blue" href="">
              회원가입
            </a>
          </p>
          <form onSubmit={handleSubmit}>
            <div className="login-box">
              <input
                className="mb12"
                type="email"
                placeholder="이메일"
                value={userId}
                onChange={(e) => handleUserIdChange(e)}
              />
              <input
                className="mb12"
                type="password"
                placeholder="비밀번호"
                value={userPassword}
                onChange={(e) => {
                  handleUserPasswordChange(e);
                }}
              />

              <a className="color-blue mb24 fz14" href="">
                비밀번호를 잊어버리셨나요?
              </a>
              <button className="blue-btn" type="submit">
                로그인
              </button>
              <img className="mt24 mb24" src="/image/img_or.png" alt="" />
              <button className="sns-btn kakao mb8" type="submit">
                <img src="/image/icon_kakao.svg" alt="" />
                <p>카카오로 로그인</p>
              </button>
              <button className="sns-btn goggle" type="submit">
                <img src="/image/icon_goggle.svg" alt="" />
                <p>구글로 로그인</p>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Fragment>
  );
};
export default Login;
