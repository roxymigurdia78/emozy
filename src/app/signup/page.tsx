"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function SignUpPage(){
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSignUp = async () => {
    if(!password.trim()){
        alert("パスワードを入力してください。");
        return;
    }
    if(!email.trim()){
        alert("メールアドレスを入力して下さい。");
        return;
    }
    if(!name.trim()){
        alert("名前を入力して下さい。");
        return;
    }
  const signupData = { name, email, password };

  console.log("送信予定のデータ:", signupData);

  // 仮の fetch（将来的にバックエンドに接続）
  // const res = await fetch("/api/signup", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(signupData),
  // });
  // const data = await res.json();

  setMessage(
    "登録用メールを送信しました（バックエンド完成後に実際のメール送信が行われます）"
  );
};

  // 入力フォームの共通スタイル
  const inputStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "1rem",
    width: "300px",
    padding: "0.5rem",
    border: "2px solid #7ADAD5",
    borderRadius: "6px",
    outline: "none",
    fontSize: "16px",
  };

  const inputFocusStyle: React.CSSProperties = {
    borderColor: "#4BBFCF",
    boxShadow: "0 0 5px #4BBFCF",
  };

  return (
    <div>
      {/* ヘッダー */}
      <header
        style={{
          backgroundColor: "#7ADAD5",
          height: "100px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Link href="/signup">
          <Image
            src="/images/title.png"
            alt="title"
            width={150}
            height={150}
            style={{ marginLeft: "5%" }}
          />
        </Link>
      </header>

      {/* サインアップフォーム */}
      <main style={{ padding: "2rem" }}>
        <h1>サインアップ</h1>

        <input
          type="text"
          placeholder="名前"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
          onFocus={(e) => (e.target.style.border = "2px solid #4BBFCF")}
          onBlur={(e) => (e.target.style.border = "2px solid #7ADAD5")}
        />

        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          onFocus={(e) => (e.target.style.border = "2px solid #4BBFCF")}
          onBlur={(e) => (e.target.style.border = "2px solid #7ADAD5")}
        />

        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
          onFocus={(e) => (e.target.style.border = "2px solid #4BBFCF")}
          onBlur={(e) => (e.target.style.border = "2px solid #7ADAD5")}
        />

        <button
          onClick={handleSignUp}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#7ADAD5",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          登録
        </button>

        {message && (
          <p style={{ color: "green", marginTop: "1rem" }}>{message}</p>
        )}
      </main>
    </div>
  );
}
