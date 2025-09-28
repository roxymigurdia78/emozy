"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import style from "./search.module.css";

// 投稿データ型
type Post = {
  id: number;
  userId: string;
  userName: string;
  type: "photo" | "text"; // 投稿タイプ
  content: string; // テキスト本文
  photoUrl?: string; // 写真（type=photo の時だけ）
  emotions: { emoji: string; count: number }[];
};

// 疑似データ
const dummyPosts: Post[] = [
  {
    id: 1,
    userId: "yamada01",
    userName: "山田太郎",
    type: "photo",
    content: "今日は楽しかった！",
    photoUrl: "/images/sample1.jpg",
    emotions: [
      { emoji: "😀", count: 1229 },
      { emoji: "✨", count: 448 },
      { emoji: "🦋", count: 448 },
    ],
  },
  {
    id: 2,
    userId: "suzuki22",
    userName: "鈴木花子",
    type: "text",
    content: "ちょっと悲しい気分",
    emotions: [
      { emoji: "😢", count: 300 },
      { emoji: "💧", count: 200 },
    ],
  },
  {
    id: 3,
    userId: "tanaka33",
    userName: "田中一郎",
    type: "photo",
    content: "猫が可愛すぎる",
    photoUrl: "/images/sample2.jpg",
    emotions: [{ emoji: "😍", count: 800 }],
  },
  {
    id: 4,
    userId: "ai001",
    userName: "AIくん",
    type: "text",
    content: "かっこよく決めたい！",
    emotions: [{ emoji: "😎", count: 500 }],
  },
];

// 入力補完用辞書
const suggestions = ["うれしい", "かなしい", "おこる", "かわいい", "かっこいい", "たのしい"];

// 感情ワード → 絵文字変換表
const emotionMap: Record<string, string> = {
  "うれしい": "😀",
  "たのしい": "😀",
  "かなしい": "😢",
  "おこる": "😡",
  "かわいい": "😍",
  "かっこいい": "😎",
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // サジェスト候補
  const filteredSuggestions = suggestions.filter(
    (word) => word.startsWith(query) && query !== ""
  );

  // 検索処理
  const handleSearch = () => {
    let filtered = dummyPosts.filter(
      (post) =>
        post.userId.includes(query) ||
        post.userName.includes(query) ||
        post.content.includes(query)
    );

    // 感情ワード検索対応
    if (emotionMap[query]) {
      const targetEmoji = emotionMap[query];
      filtered = dummyPosts.filter((post) =>
        post.emotions.some((emo) => emo.emoji === targetEmoji)
      );
    }

    setResults(filtered.slice(0, 10)); // 10件ずつ
    setPage(1);
    setShowSuggestions(false); // 候補閉じる
  };

  // ページネーション
  const handleLoadMore = () => {
    let filtered = dummyPosts.filter(
      (post) =>
        post.userId.includes(query) ||
        post.userName.includes(query) ||
        post.content.includes(query)
    );

    if (emotionMap[query]) {
      const targetEmoji = emotionMap[query];
      filtered = dummyPosts.filter((post) =>
        post.emotions.some((emo) => emo.emoji === targetEmoji)
      );
    }

    const nextPage = page + 1;
    setResults(filtered.slice(0, nextPage * 10));
    setPage(nextPage);
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
        <Link href="/home">
          <Image
            src="/images/emozy_logo.png"
            alt="title"
            width={150}
            height={150}
            style={{ marginLeft: "5%" }}
          />
        </Link>
      </header>

      {/* 検索エリア */}
      <main style={{ padding: "16px", marginBottom: "120px" }}>
        <h1>検索ページ</h1>
        <div style={{ position: "relative", width: "80%" }}>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            placeholder="ID, 名前, 感情で検索"
            style={{ border: "1px solid #ccc", padding: "8px", width: "100%" }}
          />
          {showSuggestions && filteredSuggestions.length > 0 && (
            <ul
              style={{
                listStyle: "none",
                padding: "0",
                margin: "4px 0 0 0",
                border: "1px solid #ccc",
                borderRadius: "4px",
                background: "white",
                position: "absolute",
                width: "100%",
                zIndex: 10,
              }}
            >
              {filteredSuggestions.map((s, idx) => (
                <li
                  key={idx}
                  onClick={() => {
                    setQuery(s);
                    setShowSuggestions(false);
                  }}
                  style={{ padding: "8px", cursor: "pointer" }}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>



        <button
          onClick={handleSearch}
          style={{ marginLeft: "8px", padding: "8px 12px" }}
          className={style.typeButton}
        >
          検索
        </button>

        {/* 検索結果 */}
        <div style={{ marginTop: "20px" }}>
          {results.length === 0 ? (
            <p>検索結果はありません</p>
          ) : (
            results.map((post) => (
              <div
                key={post.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  background: "#fff",
                }}
              >
                {/* ユーザー情報 */}
                <div style={{ display: "flex", alignItems: "center", padding: "8px" }}>
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

                {/* 投稿内容 */}
                {post.type === "photo" ? (
                  <Image
                    src={post.photoUrl!}
                    alt="post"
                    width={500}
                    height={300}
                    style={{ width: "100%", height: "auto" }}
                  />
                ) : (
                  <p style={{ padding: "12px", fontSize: "16px" }}>{post.content}</p>
                )}

                {/* 感情スタンプ */}
                <div style={{ display: "flex", padding: "8px", gap: "12px" }}>
                  {post.emotions.map((emo, idx) => (
                    <span key={idx} style={{ fontSize: "18px" }}>
                      {emo.emoji} {emo.count}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}

          {results.length > 0 && results.length < dummyPosts.length && (
            <button onClick={handleLoadMore} style={{ marginTop: "12px", padding: "8px 12px" }}>
              もっと見る
            </button>
          )}
        </div>
      </main>

      {/* フッター */}
          <footer style={{
        backgroundColor: "#f3f2f2ac",
        height: "75px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "fixed",
        bottom: "0",
        width: "100%",
        padding: "0 32px"
    }}>
    <Link href="/home" style={{ display: "flex", alignItems: "flex-end", height: "100px", flexShrink: 0, flexGrow: 0 }}>
        <Image
            src="/images/homeicon.png"
            alt="homeicon"
            width={60}
            height={60}
            style={{ marginLeft: "-30px", marginTop: "10px", marginBottom: "15px", marginRight: "3px", minWidth: "65px", minHeight: "65px" }}
        />
    </Link>
    <Link href="/ranking" style={{ display: "flex", alignItems: "flex-end", height: "100px", flexShrink: 0, flexGrow: 0 }}>
        <Image
            src="/images/rankingicon.png"
            alt="rankingicon"
            width={60}
            height={60}
            style={{ marginLeft: "0px", marginTop: "10px", marginBottom: "15px", marginRight: "0px", minWidth: "65px", minHeight: "65px" }}
        />
    </Link>
    <Link href="post" style={{ display: "flex", alignItems: "flex-end", height: "100px", flexShrink: 0, flexGrow: 0 }}>
        <Image
            src="/images/toukouicon.png"
            alt="posticon"
            width={60}
            height={60}
            style={{ marginLeft: "0px", marginTop: "10px", marginBottom: "19px", marginRight: "0px", minWidth: "65px", minHeight: "65px" }}
        />
    </Link>
    <Link href="/search" style={{ display: "flex", alignItems: "flex-end", height: "100px", flexShrink: 0, flexGrow: 0 }}>
        <Image
            src="/images/searchicon.png"
            alt="searchicon"
            width={60}
            height={60}
            style={{ marginLeft: "0px", marginTop: "10px", marginBottom: "22px", marginRight: "-5px", minWidth: "65px", minHeight: "65px" }}
        />
    </Link>
    <Link href="/profile" style={{ display: "flex", alignItems: "flex-end", height: "100px", flexShrink: 0, flexGrow: 0 }}>
        <Image
            src="/images/toukouicon.png"
            alt="profileicon"
            width={60}
            height={60}
            style={{ marginLeft: "-8px", marginTop: "10px", marginBottom: "19px", marginRight: "-24px", minWidth: "65px", minHeight: "65px" }}
        />
    </Link>
    </footer>
    </div>
  );
}
