"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type SigninResponsePayload = {
  user_id?: number | string;
  userId?: number | string;
  id?: number | string;
  user?: { id?: number | string };
  data?: { user?: { id?: number | string } };
  [key: string]: unknown;
};

const rememberUserId = (id: string) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem('emozyUserId', id);
  } catch (error) {
    console.warn('ユーザーIDの保存に失敗しました', error);
  }
};

const extractUserId = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  const parsed = payload as SigninResponsePayload;
  const candidate =
    parsed.user?.id ??
    parsed.user_id ??
    parsed.userId ??
    parsed.id ??
    parsed.data?.user?.id;
  if (candidate === null || candidate === undefined) {
    return null;
  }
  return String(candidate);
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert('メールアドレスとパスワードを入力してください。');
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const body = {
        signin: {
          email,
          password,
        },
      };

      const res = await fetch('http://localhost:3333/api/v1/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch((error) => {
        console.warn('レスポンスJSONの解析に失敗しました', error);
        return null;
      });

      if (!res.ok) {
        console.error('ログイン失敗レスポンス:', data ?? res.statusText);
        throw new Error('ログインに失敗しました');
      }

      const userId = extractUserId(data);
      if (userId) {
        rememberUserId(userId);
      } else {
        console.warn('レスポンスにユーザーIDが含まれていません', data);
      }

      setMessage('ログインしました！');
      router.push('/home');
    } catch (error) {
      console.error(error);
      setMessage('ログインに失敗しました。時間をおいて再度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = email.trim() !== "" && password.trim() !== "";

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen 
      bg-gradient-to-br from-[#7ADAD5] via-[#4FC3B3] to-[#2B9EA6] px-4"
    >
      <div className="w-full max-w-sm bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30 animate-fadeIn">
        {/* ロゴ */}
        <div className="flex justify-center mb-6">
          <Image
            src="/images/emozy_logo.png"
            alt="アプリタイトル"
            width={180}
            height={60}
            priority
            className="drop-shadow-md"
          />
        </div>

        {/* フォーム */}
        <form onSubmit={handleLogin} className="flex flex-col space-y-5">
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/70 focus:bg-white border border-gray-200 focus:border-[#7ADAD5] focus:ring-2 focus:ring-[#7ADAD5]/60 outline-none transition"
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/70 focus:bg-white border border-gray-200 focus:border-[#7ADAD5] focus:ring-2 focus:ring-[#7ADAD5]/60 outline-none transition"
          />

          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className={`w-full py-3 rounded-lg font-semibold text-white shadow-md transform transition 
              ${
                isFormValid && !isLoading
                  ? "bg-gradient-to-r from-[#7ADAD5] to-[#2B9EA6] hover:scale-105 hover:shadow-lg"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
          >
            {isLoading ? '送信中...' : 'ログイン'}
          </button>
        </form>

        {message && (
          <p className="text-green-100 mt-4 text-center">{message}</p>
        )}

        {/* サインアップ遷移 */}
        <div className="mt-6 text-center text-sm text-white/90">
          <p
            className="text-white cursor-pointer font-medium underline underline-offset-2 hover:text-yellow-200 transition"
            onClick={() => router.push("/signup")}
          >
            アカウントをお持ちでないですか？
          </p>
        </div>
      </div>
    </div>
  );
}
