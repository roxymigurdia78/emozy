"use client";
import Image from "next/image";
import Link from "next/link";
import Toukou, { Post } from "../components/toukou";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function FavoritePage() { // コンポーネント名を変更
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // ユーザーIDをlocalStorageから取得
    useEffect(() => {
        const storedId = window.localStorage.getItem("emozyUserId");
        setCurrentUserId(storedId);
    }, []);

    // ユーザーIDが取得できたら、お気に入り投稿を取得
    useEffect(() => {
        if (!currentUserId) return;

        const fetchFavorites = async () => {
            try {
                const res = await fetch(`http://localhost:3333/api/v1/favorites/${currentUserId}`);
                if (!res.ok) {
                    throw new Error("お気に入り投稿の取得に失敗しました");
                }
                const favoritePostsFromApi: any[] = await res.json();
                
                // APIから受け取ったデータを、Toukouコンポーネントが扱える形式(Post型)に変換する
                const formattedPosts = favoritePostsFromApi.map((item): Post => {
                    const reaction_ids = item.num_reactions
                        ? Object.keys(item.num_reactions).map(id => Number(id))
                        : [];
                    const reaction_counts = item.num_reactions
                        ? Object.values(item.num_reactions) as number[]
                        : [];

                    return {
                        id: item.id,
                        user: item.name,
                        userIconUrl: "/images/title.png", // 仮
                        content: item.content,
                        imageUrl: item.image_url,
                        reaction_ids,
                        reaction_counts,
                        reacted_reaction_ids: item.reacted_reaction_ids || [],
                        is_favorited: true, // お気に入りページなので常にtrue
                    };
                });

                setPosts(formattedPosts);
            } catch (error) {
                console.error(error);
                setPosts([]); // エラー時は空にする
            }
        };

        fetchFavorites();
    }, [currentUserId]);

    return (
        <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
            <header style={{ /* ... */ }}>
                {/* ... (ヘッダー部分は変更なし) ... */}
            </header>

            <main style={{ padding: "32px", maxWidth: "700px", margin: "0 auto", paddingBottom: "75px" }}>
                {posts.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", background: "#fff", borderRadius: "24px", padding: "16px", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
                        {posts.map((post) => (
                            <Toukou key={post.id} post={post} />
                        ))}
                    </div>
                ) : (
                    <p style={{ textAlign: "center", color: "#666", marginTop: "40px" }}>
                        お気に入りした投稿はありません。
                    </p>
                )}
            </main>
        </div>
    );
}