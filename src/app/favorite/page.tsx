"use client";
import Image from "next/image";
import Link from "next/link";
import Toukou, { Post } from "../components/toukou";
import { useEffect, useState } from "react";


import { useRouter } from "next/navigation";

export default function page() {
    const router = useRouter();
    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)", fontFamily: "'Noto Sans JP', sans-serif" }}>
            <header style={{ display: "flex", alignItems: "center", padding: "24px 32px 16px 32px", background: "rgba(255,255,255,0.85)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", borderRadius: "0 0 24px 24px" }}>
                <button
                    onClick={() => router.push("/setting")}
                    style={{
                        background: "none",
                        border: "none",
                        fontSize: "2rem",
                        color: "#6366f1",
                        cursor: "pointer",
                        marginRight: "16px",
                        transition: "color 0.2s"
                    }}
                    aria-label="戻る"
                >
                    &#60;
                </button>
                    <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", paddingRight: "95px" }}>
                        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#6366f1", letterSpacing: "0.05em", margin: 0 }}>
                            お気に入り
                        </h1>
                    </div>
            </header>
                        <main style={{ padding: "32px", maxWidth: "700px", margin: "0 auto" }}>
                                {/* ダミー投稿 */}
                                <div style={{ marginTop: "0px", display: "flex", flexDirection: "column", gap: "0px" }}>
                                    {/* 一番上の投稿: 上だけ丸く */}
                                    <div style={{ borderTopLeftRadius: "32px", borderTopRightRadius: "32px", borderBottomLeftRadius: "0px", borderBottomRightRadius: "0px", boxShadow: "0 4px 18px rgba(0,0,0,0.10)", border: "1px solid #e0e7ff", borderBottom: "none", padding: "32px", background: "#fff", marginBottom: "-34px" }}>
                                        <Toukou post={{
                                            id: 1,
                                            user: "ダミーユーザー",
                                            userIconUrl: "/images/emozy_logo.png",
                                            content: "a",
                                            imageUrl: "/images/heart.png",
                                            reaction_ids: [1, 2, 3],
                                            reaction_counts: [5, 2, 8]
                                        }} />
                                    </div>
                                    {/* 中間の投稿: 角丸なしでつなげる（今回は2件なので省略） */}
                                    {/* 一番下の投稿: 下だけ丸く */}
                                    <div style={{ borderTopLeftRadius: "0px", borderTopRightRadius: "0px", borderBottomLeftRadius: "32px", borderBottomRightRadius: "32px", boxShadow: "0 4px 18px rgba(0,0,0,0.10)", border: "1px solid #e0e7ff", padding: "32px", background: "#fff" }}>
                                        <Toukou post={{
                                            id: 2,
                                            user: "テストユーザー",
                                            userIconUrl: "/images/emozy_rogo.png",
                                            content: "b",
                                            imageUrl: "/images/kumo.png",
                                            reaction_ids: [4, 5, 6],
                                            reaction_counts: [1, 3, 0]
                                        }} />
                                    </div>
                                </div>
                        </main>
        </div>
    );
}