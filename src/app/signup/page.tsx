"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

// サインアップAPIのレスポンスで想定されるID候補を網羅した型定義
type SignupResponsePayload = {
  user_id?: number | string;
  userId?: number | string;
  id?: number | string;
  user?: { id?: number | string };
  signup?: { user_id?: number | string; id?: number | string };
  data?: { user?: { id?: number | string } };
  [key: string]: unknown;
};

export default function SignUpPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const [message, setMessage] = useState("");

  // サインアップAPIレスポンスからユーザーIDを抽出するユーティリティ
  const extractUserId = (payload: unknown): string | null => {
    if (!payload || typeof payload !== "object") {
      return null;
    }

    const parsed = payload as SignupResponsePayload;

    const candidate =
      parsed.user?.id ??
      parsed.user_id ??
      parsed.userId ??
      parsed.id ??
      parsed.signup?.user_id ??
      parsed.signup?.id ??
      parsed.data?.user?.id;

    if (candidate === null || candidate === undefined) {
      return null;
    }

    return String(candidate);
  };

  const rememberUserId = (id: string) => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      window.localStorage.setItem('emozyUserId', id);
    } catch (storageError) {
      console.warn('ユーザーIDの保存に失敗しました', storageError);
    }
  };

  const handleSignUp = async () => {
    if (!email.trim()) {
      alert("メールアドレスを入力して下さい。");
      return;
    }
    if (!password.trim()) {
      alert("パスワードを入力してください");
      return;
    }


    // APIに渡すサインアップパラメータを生成
    const body = {
      signup: {
        email,
        password,
      }
    };
    console.log("送信JSON:", body);
    try {
      // サインアップAPIにリクエストを送信
      const res = await fetch("http://localhost:3333/api/v1/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await res
        .json()
        .catch((error) => {
          console.warn("レスポンスJSONの解析に失敗しました", error);
          return null;
        });

      if (!res.ok) {
        console.error("登録失敗レスポンス:", data ?? res.statusText);
        throw new Error("登録失敗");
      }

      const userId = extractUserId(data);

      setMessage("登録が完了しました！");

      if (userId) {  // ユーザーIDが取得できたらクエリに付与して/makeへ遷移
        rememberUserId(userId);
        router.push(`/make?userId=${encodeURIComponent(userId)}`);
      } else {
        console.warn("ユーザーIDがレスポンスに含まれていません", data);
        router.push("/make");
      }
    } catch (e) {
      setMessage("登録に失敗しました");
      console.error(e);
    }
  };

  const isFormValid =
    email.trim() !== "" && password.trim() !== "";

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen
      bg-gradient-to-br from-[#7ADAD5] via-[#4FC3B3] to-[#2B9EA6] px-4"
    >
      <div className="w-full max-w-sm bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30">
        {/* ロゴ */}
        <div className="flex justify-center mb-6">
          <Link href="/">
            <Image
              src="/images/emozy_logo.png"
              alt="アプリタイトル"
              width={180}
              height={60}
              priority
              className="drop-shadow-md"
            />
          </Link>
        </div>

        {/* サインアップフォーム */}
        <h1 className="text-2xl font-bold text-center text-white mb-6">
          サインアップ
        </h1>

        <div className="flex flex-col space-y-5">
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/70 focus:bg-white border border-gray-200
              focus:border-[#7ADAD5] focus:ring-2 focus:ring-[#7ADAD5]/60 outline-none transition"
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/70 focus:bg-white border border-gray-200
              focus:border-[#7ADAD5] focus:ring-2 focus:ring-[#7ADAD5]/60 outline-none transition"
          />




          <button
            onClick={handleSignUp}
            disabled={!isFormValid}
            className={`w-full py-3 rounded-lg font-semibold text-white shadow-md transform transition
              ${
                isFormValid
                  ? "bg-gradient-to-r from-[#7ADAD5] to-[#2B9EA6] hover:scale-105 hover:shadow-lg"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
          >
            登録
          </button>
        </div>

        {message && (
          <p className="text-green-100 mt-4 text-center">{message}</p>
        )}

        <div className="mt-6 text-center text-sm text-white/90">
          <p>すでにアカウントをお持ちですか？</p>
          <Link
            href="/signin"
            className="font-medium underline underline-offset-2 hover:text-yellow-200 transition"
          >
            ログインする
          </Link>
        </div>
      </div>
    </div>
  );
}
