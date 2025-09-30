"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Toukou from "../components/toukou";
import { useEffect } from "react";
import type { Post } from "../components/toukou";
export default function Page() {
    // 初期表示で全ランキング取得
    useEffect(() => {
        const fetchRanking = async () => {
            try {
                const res = await fetch("http://localhost:3333/api/v1/ranking");
                const data = await res.json();
                const posts = Array.isArray(data) ? data.map((item: any) => {
                    const reaction_ids = item.num_reactions ? Object.keys(item.num_reactions).map(id => Number(id)) : [1,2,3];
                    const reaction_counts = item.num_reactions ? Object.values(item.num_reactions) : [0,0,0];
                    return {
                        id: item.id,
                        user: `user${item.user_id}`,
                        userIconUrl: "/images/title.png",
                        content: item.content,
                        imageUrl: item.image_url,
                        reaction_ids,
                        reaction_counts,
                    };
                }) : [];
                setPosts(posts);
            } catch (e) {
                console.error("ランキング取得失敗", e);
                setPosts([]);
            }
        };
        fetchRanking();
    }, []);
    const emotions = [
        "😎", "😭", "😃", "😤", "🤣", "😩", "☹️", "😊", "😜", "😡", "😆", "😘"
    ];
    const [selectedEmotion, setSelectedEmotion] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [posts, setPosts] = useState<any[]>([]);

    // 絵文字選択時にAPIから投稿取得（POST）
    const handleEmotionSelect = async (emotion: string) => {
        setSelectedEmotion(emotion);
        setShowPopup(false);
        const emotionId = emotions.indexOf(emotion) + 1;
        try {
            const body = {
                ranking: {  reaction_id: emotionId, limit: 50 }
            };
            console.log("送信JSON:", body);
            const res = await fetch("http://localhost:3333/api/v1/ranking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            console.log("POSTレスポンス:", data);
            // Toukou用データに変換（/homeのロジック流用）
            const posts = Array.isArray(data) ? data.map((item: any) => {
                const reaction_ids = item.num_reactions ? Object.keys(item.num_reactions).map(id => Number(id)) : [1,2,3];
                const reaction_counts = item.num_reactions ? Object.values(item.num_reactions) : [0,0,0];
                return {
                    id: item.id,
                    user: `user${item.user_id}`,
                    userIconUrl: "/images/title.png", // 仮アイコン
                    content: item.content,
                    imageUrl: item.image_url,
                    reaction_ids,
                    reaction_counts,
                };
            }) : [];
            setPosts(posts);
        } catch (e) {
            console.error("ランキング取得失敗", e);
            setPosts([]);
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
                                src="/images/title.png"
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

            <main style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "0" }}>
                {posts.length === 0 ? (
                    <div style={{ color: "#888", marginTop: "32px" }}>絵文字を選択してください。</div>
                ) : (
                    posts.map((post: Post, index: number) => (
                        <Toukou key={`${post.id}-${index}`} post={post} />
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
