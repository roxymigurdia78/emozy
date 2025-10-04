"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

export type Post = {
  id: number;
  user: string; // ユーザー名
  userIconUrl: string; // ユーザーアイコン画像URL
  content: string; // 投稿内容
  imageUrl?: string; // 投稿画像（任意）
  reaction_ids: number[];
  reaction_counts?: number[]; // 各絵文字のリアクション数
  reacted_reaction_ids?: number[];
  is_favorited?: boolean;
};

export default function Toukou({ post }: { post: Post }) {
  const [isFavorited, setIsFavorited] = useState(post.is_favorited || false);
  const [showMenu, setShowMenu] = useState(false);
  // 絵文字ボタンの押下状態（複数選択可）
  const [selectedIdx, setSelectedIdx] = useState<number[]>([]);
  // 投稿ID（API用）
  const postId = post.id;
  // リアクション数のローカル状態（初期値はprops reaction_counts）
  const [reactionCounts, setReactionCounts] = useState(
    post.reaction_counts || Array(post.reaction_ids.length).fill(0)
  );
  const [userId, setUserId] = useState("");

  useEffect(() => {
    // ローカルストレージからユーザーIDを取得
      if (typeof window === "undefined") {
      return;
    }
    const storedId = window.localStorage.getItem("emozyUserId");
    if (storedId) {
      setUserId(storedId);
    }
    setIsFavorited(post.is_favorited || false);

    // reacted_reaction_ids の初期選択状態
    const reactedIds = post.reacted_reaction_ids || [];
    const initialSelected = post.reaction_ids
      .map((id, idx) => reactedIds.includes(id) ? idx : null)
      .filter((idx): idx is number => idx !== null);
    setSelectedIdx(initialSelected);
  }, [post.reacted_reaction_ids, post.reaction_ids, post.is_favorited]); 

  // お気に入り登録/解除を行う関数
  const handleFavorite = async () => {
    if (!userId) {
      alert("ユーザー情報が見つかりません。");
      return;
    }

    const endpoint = isFavorited ? "/api/v1/favorites/delete" : "/api/v1/favorites";
    
    // UIを即時反映（オプティミスティックUI）
    setIsFavorited(!isFavorited);

    try {
      const res = await fetch(`http://localhost:3333${endpoint}`, {
        method: "POST", // deleteもPOSTで送るAPI仕様のため
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          favorite: {
            user_id: Number(userId),
            post_id: postId,
          },
        }),
      });

      if (!res.ok) {
        // エラー時はUIを元に戻す
        setIsFavorited(isFavorited);
        throw new Error("お気に入り操作に失敗しました");
      }
      
      console.log("お気に入り操作成功");

    } catch (error) {
      console.error(error);
      alert("お気に入り操作に失敗しました。");
    }
  };

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
        <Image
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
        <Image src={post.imageUrl} alt="post" width={400} height={300} style={{ width: "100%", borderRadius: "6px", marginTop: "8px" }} />
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
            if (!userId) {
              alert("ユーザー情報が見つかりません。ログインし直してください。");
              return;
            }

            // UIを更新する前に、現在の状態を退避しておく
            const originalSelectedIdx = [...selectedIdx];
            const originalCounts = [...reactionCounts];

            const numericUserId = Number(userId);
            if (Number.isNaN(numericUserId)) {
              alert("ユーザーIDが正しく取得できませんでした。再度ログインしてください。");
              return;
            }
            // トグル: 押してなければ+1, 押してたら-1
            setSelectedIdx(prev =>
              alreadySelected
                ? prev.filter(i => i !== idx)
                : [...prev, idx]
            );
            setReactionCounts(currentCounts => {
              const newCounts = [...currentCounts];
              newCounts[idx] = alreadySelected ? newCounts[idx] - 1 : newCounts[idx] + 1;
              return newCounts;
            });
            try {
              const putBody = {
                post: {
                  user_id: numericUserId,
                  reaction_id: Number(id),
                  increment: !alreadySelected
                }
              };
              console.log("PUT送信JSON:", putBody);
              await fetch(`http://localhost:3333/api/v1/posts/${postId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(putBody)
              });

            } catch (e: any) {
              if (e.name === 'AbortError' || e.name === 'TypeError') {
                console.log('Fetch was aborted by user action (e.g., reload).');
                return; 
              }

              console.error("リアクション送信失敗", e);
              alert("リアクション送信失敗");

              // 本当のエラーが起きた場合、UIを退避しておいた元の状態に戻す
              setSelectedIdx(originalSelectedIdx);
              setReactionCounts(originalCounts);
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
               {/* 表示に state を使う */}
              <span style={{ marginLeft: "7px", fontSize: "15px", color: "#333" }}>{reactionCounts[idx]}</span>
            </button>
          );
        })}
      </div>
        <div style={{ position: "absolute", right: "13px", bottom: "8px", cursor: "pointer" }} onClick={handleFavorite}>
          <Image
            src="/images/heart.png"
            alt="heart"
            width={28}
            height={28}
            style={{ 
            filter: isFavorited 
              ? "invert(17%) sepia(99%) saturate(7491%) hue-rotate(330deg) brightness(1.1)" // 赤色っぽくする
              : "grayscale(80%) brightness(1.2)" 
          }}
          />
        </div>
    </div>
  );
}