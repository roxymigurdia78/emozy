"use client";
import Image from "next/image";
import { useState } from "react";

export type Post = {
  id: number;
  user: string; // ユーザー名
  userIconUrl: string; // ユーザーアイコン画像URL
  content: string; // 投稿内容
  imageUrl?: string; // 投稿画像（任意）
  smiles: number; // 絵文字リアクション
  sparkles: number;
};

export default function Toukou({ post }: { post: Post }) {
  const [hearted, setHearted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  return (
    <div style={{
      padding: "10px",
      marginBottom: "0px",
      width: "100%",
      background: "#fff",
      borderBottom: "1px solid #eeebebba",
      position: "relative"
    }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "8px", position: "relative" }}>
        <Image
          src={post.userIconUrl}
          alt="user icon"
          width={40}
          height={40}
          style={{ borderRadius: "50%", marginRight: "10px" }}
        />
        <span style={{ fontWeight: "bold", fontSize: "16px" }}>{post.user}</span>
        <img
          src="/images/3ten.png"
          alt="3ten"
          width={24}
          height={24}
          style={{ position: "absolute", right: 5, top: 0, cursor: "pointer" }}
          onClick={() => setShowMenu(!showMenu)}
        />
        {showMenu && (
          <div style={{ position: "absolute", right: 0, top: 28, background: "#fff", border: "1px solid #ccc", borderRadius: "6px", boxShadow: "0 2px 8px #0002", zIndex: 10 }}>
            <button style={{ padding: "8px 16px", border: "none", background: "#fff", color: "#222", fontWeight: "bold", cursor: "pointer", width: "100%" }} onClick={() => alert("通報しました")}>通報する</button>
          </div>
        )}
      </div>
      <p style={{ fontSize: "15px", margin: "8px 0" }}>{post.content}</p>
      {post.imageUrl && (
        <img src={post.imageUrl} alt="post" style={{ width: "100%", borderRadius: "6px", marginTop: "8px" }} />
      )}
      <div style={{ marginTop: "10px", fontSize: "18px", display: "flex", gap: "16px" }}>
        <span>😀 {post.smiles}</span>
        <span>✨ {post.sparkles}</span>
      </div>
        <div style={{ position: "absolute", right: "13px", bottom: "8px", cursor: "pointer" }} onClick={() => setHearted(!hearted)}>
          <img
            src="/images/heart.png"
            alt="heart"
            width={28}
            height={28}
            style={{ filter: hearted ? "invert(17%) sepia(99%) saturate(7491%) hue-rotate(-1deg) brightness(1.1)" : "grayscale(80%) brightness(1.2)" }}
          />
        </div>
    </div>
  );
}