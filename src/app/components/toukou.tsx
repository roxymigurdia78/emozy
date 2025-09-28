"use client";
import Image from "next/image";
import { useState } from "react";

export type Post = {
  id: number;
  user: string; // ユーザー名
  userIconUrl: string; // ユーザーアイコン画像URL
  content: string; // 投稿内容
  imageUrl?: string; // 投稿画像（任意）
  reaction_ids: string[];
  reaction_counts?: number[]; // 各絵文字のリアクション数
};

export default function Toukou({ post }: { post: Post }) {
  const [hearted, setHearted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  // 絵文字ボタンの押下状態（複数選択可）
  const [selectedIdx, setSelectedIdx] = useState<number[]>([]);
  // 投稿ID（API用）
  const postId = post.id;
  // リアクション数のローカル状態（初期値はprops reaction_counts）
  const [counts, setCounts] = useState<number[]>(post.reaction_counts || Array(post.reaction_ids.length).fill(1));
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
  <div style={{ marginTop: "6px", fontSize: "18px", display: "flex", gap: "16px" }}>
        {post.reaction_ids?.map((id, idx) => {
          // 絵文字ID→絵文字変換
          const emojiList = [
            "😎", "😭", "😃", "😤", "🤣", "😩", "☹️", "😊", "😜", "😡", "😆", "😘"
          ];
          const emoji = emojiList[Number(id) - 1];
          const isSelected = selectedIdx.includes(idx);
          // PUTリクエスト
          const handleReaction = async () => {
            const alreadySelected = selectedIdx.includes(idx);
            // トグル: 押してなければ+1, 押してたら-1
            setSelectedIdx(prev =>
              alreadySelected
                ? prev.filter(i => i !== idx)
                : [...prev, idx]
            );
            try {
              await fetch(`http://localhost:3333/api/v1/posts/${postId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  "post": {
                    user_id: 1, // 仮
                    reaction_id: Number(id),
                    increment: !alreadySelected
                  }
                })
              });
              // 成功時にローカルのcountを+1/-1
              setCounts(prev => prev.map((c, i) => i === idx ? c + (!alreadySelected ? 1 : -1) : c));
            } catch (e) {
              console.error("リアクション送信失敗", e);
              alert("リアクション送信失敗");
            }
          };
          return (
            <button
              key={idx}
              onClick={handleReaction}
              style={{
                background: isSelected ? "#7adad563" : "#EEEEEF",
                border: "none",
                borderRadius: "10px",
                width: "60px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                fontSize: "22px",
                cursor: "pointer",
                transition: "background 0.2s",
                paddingLeft: "8px",
                marginRight: "-10px"
              }}
            >
              <span style={{ zIndex: 1 }}>{emoji}</span>
              <span style={{ marginLeft: "7px", fontSize: "15px", color: "#333" }}>{counts[idx]}</span>
            </button>
          );
        })}
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