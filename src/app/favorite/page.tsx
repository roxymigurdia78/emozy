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
                const res = await fetch(`http://localhost:3333/api/v1/favorites/${currentUserId}`, {
                    cache: "no-store",
                });
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
            <header style={{
                backgroundColor:"#7ADAD5",
                height:"100px",
                display:"flex",
                alignItems: "center"      
            }}>
                <Link href="/home" >
                    <Image 
                        src="/images/emozy_logo.png"
                        alt="title"
                        width={150}
                        height={150}
                        style={{marginLeft: "5%"}}
                    />
                </Link>    
            </header>

            <main style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "0", paddingBottom: "90px" }}>
                {posts.length > 0 ? (
                    <div style={{ width: '100%' }}>
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
                <Link
                    href={currentUserId ? `/post?userId=${encodeURIComponent(currentUserId)}` : "/post"}
                    style={{ display: "flex", alignItems: "flex-end", height: "100px", flexShrink: 0, flexGrow: 0 }}
                >
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