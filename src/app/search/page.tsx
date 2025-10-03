"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import style from "./search.module.css";
import Toukou from "../components/toukou";

type Post = {
  id: number;
  user: string;
  userIconUrl: string;
  content: string;
  imageUrl?: string;
  reaction_ids: number[];
  reaction_counts: number[];
  reacted_reaction_ids: number[];
};

const emotionMap: Record<string, [string, number]> = {
  "かっこいい": ["😎", 1],
  "かなしい": ["😭", 2],
  "うれしい": ["😃", 3],
  "いらいら": ["😤", 4],
  "おもしろい": ["🤣", 5],
  "がっかり": ["😩", 6],
  "こわい": ["☹️", 7],
  "しあわせ": ["😊", 8],
  "ふざけたい": ["😜", 9],
  "おこる": ["😡", 10],
  "たのしい": ["😆", 11],
  "かわいい": ["😘", 1],
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

  const handleSearch = async () => {
    try {
      const reactionId = emotionMap[emotionQuery]?.[1] || null;

      const res = await fetch("http://localhost:3333/api/v1/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          search: {
            keyword: nameOrId || "",
            reaction_id: reactionId,
          },
        }),
      });

      if (!res.ok) throw new Error("検索APIに失敗しました");
      const data = await res.json();

      console.log("APIレスポンス:", data);
      // ユーザー検索結果をカード化
      const usersFromApi = (data.users || []).map((u: any) => {
        const reaction_ids: number[] = [];
        const reaction_counts: number[] = [];

        // 投稿と同じように 1〜12 をチェック
        for (let i = 1; i <= 12; i++) {
          const key = `is_set_reaction_${i}`;
          if (u[key] === true) {
            reaction_ids.push(i);
            reaction_counts.push(1);
          }
        }

        return {
          id: u.id,
          user: u.name,
          userIconUrl: "/images/mitei.png",
          content: u.profile || "",
          imageUrl: undefined,
          reaction_ids,
          reaction_counts,
          reacted_reaction_ids: [],
        };
      });

      // 投稿検索結果を整形
      const postsFromApi = (data.posts || []).map((p: any) => {
        // リアクションIDと件数を boolean から変換
        const reaction_ids: number[] = [];
        const reaction_counts: number[] = [];

        for (let i = 1; i <= 12; i++) {
          const key = `is_set_reaction_${i}`;
          if (p[key] === true) {
            reaction_ids.push(i);
            // APIが件数を返していないので「true=1件 / false=0件」として仮で扱う
            reaction_counts.push(p[key] ? 1 : 0);
          }
        }

        return {
          id: p.id,
          user: p.name,
          userIconUrl: "/images/mitei.png",
          content: p.content,
          imageUrl: p.image ? `/uploads/${p.image}` : undefined,
          reaction_ids,
          reaction_counts,
          reacted_reaction_ids: [], // ← あればここも boolean から導ける
        };
      });


      console.log("✅ postsFromApi:", postsFromApi);


      // 両方をまとめる
      const merged = [...usersFromApi, ...postsFromApi];
      setResults(merged.slice(0, 10));
      setHasMore(merged.length > 10);
    } catch (e) {
      console.error("❌ 検索失敗:", e);
    }
  };

  const handleLoadMore = async () => {
    try {
      const pageSize = 10;
      const nextPage = page + 1;
      const reactionId = emotionMap[emotionQuery]?.[1] || null;

      const res = await fetch("http://localhost:3333/api/v1/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          search: {
            keyword: nameOrId || "",
            reaction_id: reactionId,
          },
        }),
      });

      if (!res.ok) throw new Error("検索APIに失敗しました");
      const data = await res.json();

      // handleSearch と同じ整形処理を再利用
      const usersFromApi = (data.users || []).map((u: any) => {
        const reaction_ids: number[] = [];
        const reaction_counts: number[] = [];

        // 投稿と同じように 1〜12 をチェック
        for (let i = 1; i <= 12; i++) {
          const key = `is_set_reaction_${i}`;
          if (u[key] === true) {
            reaction_ids.push(i);
            reaction_counts.push(1);
          }
        }

        return {
          id: u.id,
          user: u.name,
          userIconUrl: "/images/mitei.png",
          content: u.profile || "",
          imageUrl: undefined,
          reaction_ids,
          reaction_counts,
          reacted_reaction_ids: [],
        };
      });

      console.log("📦 data.posts:", data.posts);

      const postsFromApi = (data.posts || []).map((p: any) => {
        const reaction_ids: number[] = [];
        const reaction_counts: number[] = [];

        for (let i = 1; i <= 12; i++) {
          const key = `is_set_reaction_${i}`;
          if (p[key] === true) {
            reaction_ids.push(i);
            reaction_counts.push(1); // 仮で1件として扱う
          }
        }

        return {
          id: p.id,
          user: p.name,
          userIconUrl: "/images/mitei.png",
          content: p.content,
          imageUrl: p.image ? `/uploads/${p.image}` : undefined,
          reaction_ids,
          reaction_counts,
          reacted_reaction_ids: [], // 必要ならここも true のIDを入れる
        };
      });

      const merged = [...usersFromApi, ...postsFromApi];
      const nextResults = merged.slice(0, nextPage * pageSize);

      setResults(nextResults);
      setPage(nextPage);
      setHasMore(nextResults.length < merged.length);
    } catch (e) {
      console.error(e);
      alert("もっと読む処理に失敗しました");
    }
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
                      {s} {emotionMap[s][0]}
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
                    {emoji[0]}
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

        <div style={{ marginTop: "20px" }}>
          {results.length === 0 ? (
            <p style={{ textAlign: "center", color: "#666" }}>
              検索結果はありません
            </p>
          ) : (
            results.map((post) => <Toukou key={post.id} post={post} />)
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
