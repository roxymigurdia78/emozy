"use client";

import { useState, useEffect } from "react";
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
  is_favorited: boolean;
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
  "かわいい": ["😘", 12],
};

const suggestions = Object.keys(emotionMap);

export default function SearchPage() {
  const [nameOrId, setNameOrId] = useState("");
  const [emotionQuery, setEmotionQuery] = useState("");
  const [results, setResults] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [showEmotionSuggestions, setShowEmotionSuggestions] = useState(false);
  const [showEmotionPopup, setShowEmotionPopup] = useState(false);

  useEffect(() => {
    const storedId = window.localStorage.getItem("emozyUserId") || "";
    setCurrentUserId(storedId);
  }, []);

  const filteredEmotionSuggestions = suggestions.filter(
    (word) => word.startsWith(emotionQuery) && emotionQuery !== ""
  );

  // APIから受け取った投稿データをPost型に変換する共通関数
  const formatPost = (p: any, userName?: string): Post => {
    const reaction_ids = p.num_reactions
      ? Object.keys(p.num_reactions).map(id => Number(id))
      : [];
    const reaction_counts = p.num_reactions
      ? Object.values(p.num_reactions) as number[]
      : [];
    return {
      id: p.id,
      user: userName || p.name,
      userIconUrl: "/images/mitei.png",
      content: p.content,
      imageUrl: p.image_url,
      reaction_ids,
      reaction_counts,
      reacted_reaction_ids: p.reacted_reaction_ids || [],
      is_favorited: !!p.is_favorited,
    };
  };

  // 検索APIを呼び出す共通関数
  const executeSearch = async () => {
    if (!currentUserId) {
      alert("ユーザー情報が取得できません。");
      return null;
    }
    const reactionId = emotionMap[emotionQuery]?.[1] || null;
    const res = await fetch("http://localhost:3333/api/v1/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        search: {
          keyword: nameOrId || "",
          reaction_id: reactionId,
          user_id: currentUserId,
        },
      }),
    });
    if (!res.ok) throw new Error("検索APIに失敗しました");
    return res.json();
  };

  // 検索ボタンが押された時の処理
  const handleSearch = async () => {
    try {
      const data = await executeSearch();
      if (!data) return;

      const usersPostsFromApi: Post[] = (data.users || []).flatMap((u: any) =>
        (u.posts || []).map((p: any) => formatPost(p, u.name))
      );
      const postsFromApi: Post[] = (data.posts || []).map((p: any) => formatPost(p));

      // ユーザー検索結果と投稿検索結果をマージし、投稿IDで重複を削除
      const merged = [...usersPostsFromApi, ...postsFromApi];
      const uniquePosts = Array.from(new Map(merged.map(p => [p.id, p])).values());

      setResults(uniquePosts.slice(0, 10));
      setHasMore(uniquePosts.length > 10);
      setPage(1); // 新しい検索なのでページ番号を1にリセット
    } catch (e) {
      console.error("検索失敗:", e);
    }
  };

  // 「もっと見る」が押された時の処理
  const handleLoadMore = async () => {
    try {
      const pageSize = 10;
      const nextPage = page + 1;
      
      const data = await executeSearch();
      if (!data) return;

      const usersPostsFromApi: Post[] = (data.users || []).flatMap((u: any) =>
        (u.posts || []).map((p: any) => formatPost(p, u.name))
      );
      const postsFromApi: Post[] = (data.posts || []).map((p: any) => formatPost(p));

      const merged = [...usersPostsFromApi, ...postsFromApi];
      const uniquePosts = Array.from(new Map(merged.map(p => [p.id, p])).values());

      const nextResults = uniquePosts.slice(0, nextPage * pageSize);

      setResults(nextResults);
      setPage(nextPage);
      setHasMore(nextResults.length < uniquePosts.length);
    } catch (e) {
      console.error("もっと読む処理に失敗:", e);
    }
  };

  return (
    <div style={{ background: "#f7f9fa", minHeight: "100vh" }}>
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

      <main style={{ padding: "24px", marginBottom: "120px", maxWidth: "800px", marginInline: "auto" }}>
        <h1 style={{ marginBottom: "16px", color: "#333", fontSize: "22px" }}>
          検索ページ
        </h1>

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
            placeholder="名前または投稿内容で検索"
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