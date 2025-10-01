"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import style from "./search.module.css";

type Post = {
  id: number;
  userId: string;
  userName: string;
  type: "photo" | "text";
  content: string;
  photoUrl?: string;
  emotions: { emoji: string; count: number }[];
};

const emotionMap: Record<string, string> = {
  "かっこいい": "😎",
  "かなしい": "😭",
  "うれしい": "😃",
  "いらいら": "😤",
  "おもしろい": "🤣",
  "がっかり": "😩",
  "こわい": "☹️",
  "しあわせ": "😊",
  "ふざけたい": "😜",
  "おこる": "😡",
  "たのしい": "😆",
  "かわいい": "😘",
};

const suggestions = Object.keys(emotionMap);

const dummyPosts: Post[] = [
  {
    id: 1,
    userId: "yamada01",
    userName: "山田太郎",
    type: "photo",
    content: "今日は楽しかった！",
    photoUrl: "/images/sample1.jpg",
    emotions: [{ emoji: "😭", count: 1229 }, { emoji: "✨", count: 448 }],
  },
  {
    id: 2,
    userId: "suzuki22",
    userName: "鈴木花子",
    type: "text",
    content: "ちょっと悲しい気分",
    emotions: [{ emoji: "😘", count: 300 }, { emoji: "💧", count: 200 }],
  },
  {
    id: 3,
    userId: "tanaka33",
    userName: "田中一郎",
    type: "photo",
    content: "猫が可愛すぎる",
    photoUrl: "/images/sample2.jpg",
    emotions: [{ emoji: "😎", count: 800 }],
  },
];

export default function SearchPage() {
  const [nameOrId, setNameOrId] = useState("");
  const [emotionQuery, setEmotionQuery] = useState("");
  const [results, setResults] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [showEmotionSuggestions, setShowEmotionSuggestions] = useState(false);
  const [showEmotionPopup, setShowEmotionPopup] = useState(false);

  const filteredEmotionSuggestions = suggestions.filter(
    (word) => word.startsWith(emotionQuery) && emotionQuery !== ""
  );

  const handleSearch = () => {
    let filtered = [...dummyPosts];

    if (nameOrId) {
      filtered = filtered.filter(
        (post) =>
          post.userId.includes(nameOrId) || post.userName.includes(nameOrId)
      );
    }

    if (emotionQuery) {
      const targetEmoji = emotionMap[emotionQuery] || emotionQuery;
      filtered = filtered.filter((post) =>
        post.emotions.some((emo) => emo.emoji === targetEmoji)
      );
    }

    const pageSize = 10;
    const pagePosts = filtered.slice(0, pageSize);

    setResults(pagePosts);
    setPage(1);
    setHasMore(pagePosts.length < filtered.length);
    setShowEmotionSuggestions(false);
    setShowEmotionPopup(false);
  };

  const handleLoadMore = () => {
    const pageSize = 10;
    const nextPage = page + 1;

    let filtered = [...dummyPosts];

    if (nameOrId) {
      filtered = filtered.filter(
        (post) =>
          post.userId.includes(nameOrId) || post.userName.includes(nameOrId)
      );
    }

    if (emotionQuery) {
      const targetEmoji = emotionMap[emotionQuery] || emotionQuery;
      filtered = filtered.filter((post) =>
        post.emotions.some((emo) => emo.emoji === targetEmoji)
      );
    }

    const nextResults = filtered.slice(0, nextPage * pageSize);
    setResults(nextResults);
    setPage(nextPage);
    setHasMore(nextResults.length < filtered.length);
  };

  return (
    <div style={{ background: "#f7f9fa", minHeight: "100vh" }}>
      {/* ヘッダー（色は変えない） */}
      <header
        style={{
          backgroundColor: "#7ADAD5",
          height: "100px",
          display: "flex",
          alignItems: "center",
          paddingLeft: "5%",
        }}
      >
        <Link href="/home">
          <Image
            src="/images/emozy_logo.png"
            alt="title"
            width={150}
            height={150}
          />
        </Link>
      </header>

      {/* メイン */}
      <main style={{ padding: "24px", marginBottom: "120px", maxWidth: "800px", marginInline: "auto" }}>
        <h1 style={{ marginBottom: "16px", color: "#333", fontSize: "22px" }}>
          検索ページ
        </h1>

        {/* 検索カード */}
        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            marginBottom: "20px",
          }}
        >
          <input
            type="text"
            value={nameOrId}
            onChange={(e) => setNameOrId(e.target.value)}
            placeholder="名前またはIDで検索"
            style={{
              border: "1px solid #ccc",
              padding: "12px",
              borderRadius: "8px",
              width: "100%",
              marginBottom: "12px",
              fontSize: "15px",
            }}
          />

          <div style={{ position: "relative", display: "flex", gap: "8px" }}>
            <input
              type="text"
              value={emotionQuery}
              onChange={(e) => {
                setEmotionQuery(e.target.value);
                setShowEmotionSuggestions(true);
              }}
              placeholder="感情で検索"
              style={{
                border: "1px solid #ccc",
                padding: "12px",
                borderRadius: "8px",
                flex: 1,
                fontSize: "15px",
              }}
            />
            <button
              type="button"
              style={{
                padding: "0 14px",
                fontSize: "22px",
                cursor: "pointer",
                border: "none",
                borderRadius: "50%",
                background: "#eee",
              }}
              onClick={() => setShowEmotionPopup(!showEmotionPopup)}
            >
              ☺
            </button>

            {/* サジェスト */}
            {showEmotionSuggestions &&
              filteredEmotionSuggestions.length > 0 && (
                <ul
                  style={{
                    position: "absolute",
                    top: "48px",
                    left: 0,
                    width: "100%",
                    background: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    listStyle: "none",
                    padding: "0",
                    margin: "0",
                    zIndex: 10,
                    boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  {filteredEmotionSuggestions.map((s, idx) => (
                    <li
                      key={idx}
                      style={{
                        padding: "10px",
                        cursor: "pointer",
                        borderBottom:
                          idx !== filteredEmotionSuggestions.length - 1
                            ? "1px solid #eee"
                            : "none",
                      }}
                      onClick={() => {
                        setEmotionQuery(s);
                        setShowEmotionSuggestions(false);
                      }}
                    >
                      {s} {emotionMap[s]}
                    </li>
                  ))}
                </ul>
              )}

            {/* ポップアップ */}
            {showEmotionPopup && (
              <div
                style={{
                  position: "absolute",
                  top: "48px",
                  right: 0,
                  width: "280px",
                  background: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "12px",
                  padding: "16px",
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "10px",
                  zIndex: 20,
                  boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                {Object.entries(emotionMap).map(([name, emoji]) => (
                  <button
                    key={name}
                    type="button"
                    style={{
                      fontSize: "24px",
                      cursor: "pointer",
                      padding: "8px",
                      border: "none",
                      background: "transparent",
                      borderRadius: "8px",
                    }}
                    onClick={() => {
                      setEmotionQuery(name);
                      setShowEmotionPopup(false);
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleSearch}
            style={{
              marginTop: "16px",
              padding: "10px 16px",
              background: "#7ADAD5",
              color: "#fff",
              fontWeight: "bold",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
            className={style.typeButton}
          >
            検索
          </button>
        </div>

        {/* 結果 */}
        <div style={{ marginTop: "20px" }}>
          {results.length === 0 ? (
            <p style={{ textAlign: "center", color: "#666" }}>
              検索結果はありません
            </p>
          ) : (
            results.map((post) => (
              <div
                key={post.id}
                style={{
                  borderBottom: "1px solid #eee", // ✅ 区切り線だけ
                  padding: "12px 0",              // ✅ 余白を上下につける
                }}
              >
              <div style={{ display: "flex", alignItems: "center", paddingBottom: "6px" }}>
                <Image
                  src="/images/mitei.png"
                  alt="usericon"
                  width={32}
                  height={32}
                  style={{ borderRadius: "50%" }}
                />
                <span style={{ marginLeft: "8px", fontWeight: "bold" }}>
                  {post.userName}
                </span>
              </div>

                {post.type === "photo" ? (
                  <Image
                    src={post.photoUrl!}
                    alt="post"
                    width={500}
                    height={300}
                    style={{ width: "100%", height: "auto" }}
                  />
                ) : (
                  <p style={{ padding: "16px", fontSize: "16px" }}>
                    {post.content}
                  </p>
                )}

                <div style={{ display: "flex", padding: "12px", gap: "16px" }}>
                  {post.emotions.map((emo, idx) => (
                    <span key={idx} style={{ fontSize: "18px" }}>
                      {emo.emoji} {emo.count}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}

          {hasMore && (
            <button
              onClick={handleLoadMore}
              style={{
                marginTop: "12px",
                padding: "10px 16px",
                background: "#eee",
                border: "1px solid #ccc",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              もっと見る
            </button>
          )}
        </div>
      </main>

      {/* フッターは変更しない */}
      <footer
        style={{
          backgroundColor: "#f3f2f2ac",
          height: "75px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "fixed",
          bottom: 0,
          width: "100%",
          padding: "0 32px",
        }}
      >
        <Link href="/home">
          <Image src="/images/homeicon.png" alt="homeicon" width={60} height={60} />
        </Link>
        <Link href="/ranking">
          <Image src="/images/rankingicon.png" alt="rankingicon" width={60} height={60} />
        </Link>
        <Link href="/post">
          <Image src="/images/toukouicon.png" alt="posticon" width={60} height={60} />
        </Link>
        <Link href="/search">
          <Image src="/images/searchicon.png" alt="searchicon" width={60} height={60} />
        </Link>
        <Link href="/profile">
          <Image src="/images/toukouicon.png" alt="profileicon" width={60} height={60} />
        </Link>
      </footer>
    </div>
  );
}
