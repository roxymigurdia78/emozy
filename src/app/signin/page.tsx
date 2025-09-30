"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("ログイン:", { email, password });

    // 仮のログイン成功処理
    router.push("/home"); // ログイン後に /home へ遷移
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
            disabled={!isFormValid}
            className={`w-full py-3 rounded-lg font-semibold text-white shadow-md transform transition 
              ${
                isFormValid
                  ? "bg-gradient-to-r from-[#7ADAD5] to-[#2B9EA6] hover:scale-105 hover:shadow-lg"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
          >
            ログイン
          </button>
        </form>

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
