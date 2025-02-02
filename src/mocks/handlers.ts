import { http, HttpResponse } from "msw";
import * as jose from "jose";
import testResponseBody from "./samples/testResponseBody.json";

const JWT_SECRET = new TextEncoder().encode("your_jwt_secret_key");

async function generateToken(userId: string) {
  const jwt = await new jose.SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(JWT_SECRET);

  return jwt;
}

interface User {
  email: string;
  password: string;
}

interface SignupUser {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const handlers = [
  http.post("/edupi_visualize/v1/python", () => {
    return HttpResponse.json(testResponseBody);
  }),

  http.get("/edupi_user/v1/member/login/info", async () => {
    // Get the token from the cookies

    // 쿠키에서 토큰을 확인
    // const cookies = request.headers.get("Cookie");
    // const hasToken = cookies && cookies.includes("token=");
    const hasToken = true;
    if (hasToken) {
      return HttpResponse.json(
        {
          success: true,
          user: { id: "test@test.com", name: "테스트 사용자" },
        },
        {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true",
          },
        }
      );
    } else {
      return HttpResponse.json(
        {
          success: false,
          message: "인증되지 않은 사용자",
        },
        {
          status: 401,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true",
          },
        }
      );
    }
  }),

  http.post("/edupi_user/v1/member/login", async ({ request }) => {
    try {
      const { email, password } = (await request.json()) as User;

      if (email === "test@test.com" && password === "test") {
        // JWT 토큰 생성을 기다립니다.
        const token = await generateToken(email);

        const expirationDate = new Date(new Date().getTime() + 60 * 60 * 1000);

        return HttpResponse.json(
          {
            success: true,
            message: "로그인 성공",
          },
          {
            status: 200,
            headers: {
              "Set-Cookie": `token=${token}; Secure;SameSite=Strict; Expires=${expirationDate.toUTCString()}`,
            },
          }
        );
      } else {
        return HttpResponse.json(
          {
            success: false,
            message: "아이디 또는 비밀번호가 잘못되었습니다",
          },
          { status: 401 }
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      return HttpResponse.json(
        {
          success: false,
          message: "서버 오류가 발생했습니다.",
        },
        { status: 500 }
      );
    }
  }),

  http.post("/edupi_user/v1/member/signup", async ({ request }) => {
    const { username } = (await request.json()) as SignupUser;
    if (username === "error") return HttpResponse.json({ success: false, message: "회원가입 실패" }, { status: 500 });
    return HttpResponse.json(
      {
        success: true,
        message: "회원가입 성공",
      },
      { status: 200 }
    );
  }),
];
