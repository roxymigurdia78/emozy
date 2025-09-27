"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Toukou from "../components/toukou";
export default function profile() {
    const emotions = [
        "楽しい", "寒い", "暑い", "悲しい", "眠い", "嬉しい", "疲れた", "びっくり", "怒り", "感謝"
    ];
    const [selectedEmotion, setSelectedEmotion] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const posts = [
    {
      id: 1,
      user: "roxymigurdia78",
      userIconUrl: "/images/title.png",
      content: "ああ",
      imageUrl: "/images/title.png",
      smiles: 5,
      sparkles: 2,
    },
    {
      id: 2,
      user: "Saaaaa",
      userIconUrl: "/images/title.png",
      content: "今日のぶどうは甘かったわー",
      smiles: 3,
      sparkles: 1,
    },
    // ...他の投稿
    
  ];
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
                                    color: "#1976d2",
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
                                            onClick={() => { setSelectedEmotion(emotion); setShowPopup(false); }}
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
                    {posts.map((post) => (
                                <Toukou key={post.id} post={post} />
                    ))}
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
