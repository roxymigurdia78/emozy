"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [message, setMessage] = useState("");

  const handleSignUp = async () => {
    if (!email.trim()) {
      alert("メールアドレスを入力して下さい。");
      return;
    }
    if (!password.trim()) {
      alert("パスワードを入力してください");
      return;
    }
    if (!name.trim()) {
      alert("名前を入力してください");
      return;
    }

    const body = {
      signup: {
        name,
        email,
        password,
      }
    };
    console.log("送信JSON:", body);
    try {
      const res = await fetch("http://localhost:3333/api/v1/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        throw new Error("登録失敗");
      }
      setMessage("登録が完了しました！");
      router.push("/make");
    } catch (e) {
      setMessage("登録に失敗しました");
      console.error(e);
    }
  };

  const isFormValid =
    name.trim() !== "" && email.trim() !== "";

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
          
          <input
            type="name"
            placeholder="名前"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
