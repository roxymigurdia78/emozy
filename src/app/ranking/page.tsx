"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import Toukou from "../components/toukou";
import type { Post } from "../components/toukou";

export default function Page() {
    const [currentUserId, setCurrentUserId] = useState("");
    const [selectedEmotion, setSelectedEmotion] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [posts, setPosts] = useState<any[]>([]);

    // ユーザーIDを localStorage から取得
    useEffect(() => {
        const storedId = window.localStorage.getItem("emozyUserId") || "";
        setCurrentUserId(storedId);
    }, []);

    // currentUserId を使ってランキング取得（IDが取れてから）
    useEffect(() => {
        if (!currentUserId) return;

        const fetchRanking = async () => {
        try {
            const res = await fetch(`http://localhost:3333/api/v1/ranking?user_id=${currentUserId}`, { cache: "no-store" });
            const json = await res.json();
            console.log("GETランキングレスポンス:", json);

            const list = Array.isArray(json) ? json : json.ranking || json.posts || [];
            const posts = list.map((item: any) => {
            const reaction_ids = item.num_reactions
                ? Object.keys(item.num_reactions).map((id) => Number(id))
                : [1, 2, 3];
            const reaction_counts = item.num_reactions
                ? Object.values(item.num_reactions)
                : [0, 0, 0];
            return {
                id: item.id,
                user: item.name || `user${item.user_id}`,
                userIconUrl: item?.icon_image_url ?? "/images/syoki2.png",
                content: item.content,
                imageUrl: item.image_url,
                reaction_ids,
                reaction_counts,
                reacted_reaction_ids: item.reacted_reaction_ids || [],
                num_reactions: item.num_reactions || {},
                is_favorited: !!item.is_favorited,
            };
            });
            setPosts(posts);
        } catch (e) {
            console.error("ランキング取得失敗", e);
            setPosts([]);
        }
        };

        fetchRanking();
    }, [currentUserId]);

    const emotions = ["😎", "😭", "😃", "😤", "🤣", "😩", "☹️", "😊", "😜", "😡", "😆", "😘"];

    // 絵文字選択時のPOST処理
    const handleEmotionSelect = async (emotion: string) => {
        setSelectedEmotion(emotion);
        setShowPopup(false);
        if (!currentUserId) return; // ← 保険

        const emotionId = emotions.indexOf(emotion) + 1;
        try {
        if (!currentUserId) {
            console.warn("⚠️ currentUserId が空なので POST 中止");
            return;
        }
        const body = {
            ranking: { reaction_id: emotionId, limit: 10 },
            user_id: currentUserId,
        };
        console.log("送信JSON:", body);
        const res = await fetch(`http://localhost:3333/api/v1/ranking?user_id=${currentUserId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        console.log("POSTレスポンス:", data);

        const posts = Array.isArray(data)
            ? data.map((item: any) => {
                const reaction_ids = item.num_reactions
                ? Object.keys(item.num_reactions).map((id) => Number(id))
                : [1, 2, 3];
                const reaction_counts = item.num_reactions
                ? Object.values(item.num_reactions)
                : [0, 0, 0];
                return {
                id: item.id,
                user: item.name || `user${item.user_id}`,
                userIconUrl: item?.icon_image_url ?? "/images/syoki2.png",
                content: item.content,
                imageUrl: item.image_url,
                reaction_ids,
                reaction_counts,
                reacted_reaction_ids: item.reacted_reaction_ids || [],
                num_reactions: item.num_reactions || {},
                is_favorited: !!item.is_favorited,
                };
            })
            : [];
        setPosts(posts);
        } catch (e) {
        console.error("ランキング取得失敗", e);
        setPosts([]);
        }
    };

    // 投稿ごとのリアクション送信関数
    const handleReaction = async (postId: number, reactionId: number) => {
        if (!currentUserId) return;
        try {
            const res = await fetch(`http://localhost:3333/api/v1/posts/${postId}/reactions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: currentUserId, reaction_id: reactionId }),
            });
            const data = await res.json();
            console.log("リアクション送信成功:", data);

            // 再取得して最新状態を反映
            const refresh = await fetch(`http://localhost:3333/api/v1/ranking?user_id=${currentUserId}`);
            const refreshedJson = await refresh.json();
            const list = Array.isArray(refreshedJson) ? refreshedJson : refreshedJson.ranking || [];
            setPosts(list.map((item: any) => ({
            id: item.id,
            user: item.name || `user${item.user_id}`,
            userIconUrl: item?.icon_image_url ?? "/images/syoki2.png",
            content: item.content,
            imageUrl: item.image_url,
            reaction_ids: item.num_reactions ? Object.keys(item.num_reactions).map(Number) : [1,2,3],
            reaction_counts: item.num_reactions ? Object.values(item.num_reactions) : [0,0,0],
            reacted_reaction_ids: item.reacted_reaction_ids || [],
            })));
        } catch (err) {
            console.error("リアクション送信失敗:", err);
        }
    };

    return (
        <div>
            <header style={{
                backgroundColor: "#7ADAD5",
                height: "100px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
            }}>
                <div style={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                    <div style={{ minWidth: "150px", maxWidth: "150px", display: "flex", alignItems: "center" }}>
                        <Link href="/home" >
                            <Image 
                                src="/images/emozy_logo.png"
                                alt="title"
                                width={150}
                                height={150}
                                style={{ marginLeft: "5%" }}
                            />
                        </Link>
                    </div>
                    <div style={{ marginRight: "32px", display: "flex", alignItems: "center", position: "relative" }}>
                        <div style={{ position: "relative", width: "200px", height: "200px" }}>
                            <Image
                                src="/images/kumo.png"
                                alt="kumo"
                                width={300}
                                height={200}
                                style={{ cursor: "pointer", position: "absolute", top: "0px", left: 20, zIndex: 1 }}
                                onClick={() => setShowPopup(true)}
                            />
                            {selectedEmotion && (
                                <span style={{
                                    position: "absolute",
                                    top: "52%",
                                    left: "62%",
                                    transform: "translate(-50%, -50%)",
                                    fontSize: "24px",
                                    color: "#040404ff",
                                    fontWeight: "bold",
                                    zIndex: 2,
                                    pointerEvents: "none",
                                    textShadow: "0 0 4px #fff, 0 0 2px #fff"
                                }}>{selectedEmotion}</span>
                            )}
                        </div>
                        {showPopup && (
                            <div style={{ position: "absolute", top: "90px", right: "0", background: "#fff", border: "1px solid #ccc", borderRadius: "8px", boxShadow: "0 2px 8px #aaa", zIndex: 10, padding: "16px", minWidth: "180px" }}>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                    {emotions.map((emotion) => (
                                        <button
                                            key={emotion}
                                            style={{ padding: "6px 16px", borderRadius: "20px", border: selectedEmotion === emotion ? "2px solid #7ADAD5" : "1px solid #ccc", background: selectedEmotion === emotion ? "#e0f7fa" : "#fff", fontSize: "16px", cursor: "pointer" }}
                                            onClick={() => handleEmotionSelect(emotion)}
                                        >{emotion}</button>
                                    ))}
                                </div>
                                <button style={{ marginTop: "20px", width: "100%", borderRadius: "4px", border: "none", background: "#7ADAD5", color: "#fff", padding: "8px", cursor: "pointer" }} onClick={() => setShowPopup(false)}>閉じる</button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "0", paddingBottom: "90px" }}>
                {posts.length === 0 ? (
                    <div style={{ color: "#888", marginTop: "32px" }}>絵文字を選択してください。</div>
                ) : (
                    posts.map((post, index) => (
                        // ★★★ Toukouをdivで囲み、順位の数字を表示 ★★★
                        <div key={post.id} style={{ display: 'flex', alignItems: 'center', width: '100%', borderBottom: '1px solid #e2e8f0' }}>
                            <div style={{
                                flexShrink: 0,
                                width: '50px',
                                textAlign: 'center',
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                color: '#718096',
                            }}>
                                {index + 1}
                            </div>
                            <div style={{ flexGrow: 1 }}>
                                <Toukou post={post} />
                            </div>
                        </div>
                    ))
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
