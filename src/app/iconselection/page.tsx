"use client";
import Image from "next/image";
import Link from "next/link";
import Toukou from "../components/toukou";
import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

export default function page() {
    const router = useRouter();

    // アイコン・イラスト画像データ
    const iconImages = [
        "/images/emozy_logo.png",
        "/images/emozy_rogo.png",
        "/images/homeicon.png",
        "/images/iconmaker.png",
        "/images/kigou.png"
    ];
    const illustImages = [
        "/images/title.png",
        "/images/heart.png",
        "/images/kumo.png",
        "/images/rankingicon.png",
        "/images/searchicon.png"
    ];

    // 選択状態
    const [selectedIcon, setSelectedIcon] = useState(iconImages[0]);
    const [selectedIllust, setSelectedIllust] = useState(illustImages[0]);
    // 選択モード: "icon" or "illust"
    const [selectMode, setSelectMode] = useState<'icon' | 'illust'>('icon');

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f7faff 0%, #e3e6f5 100%)", position: "relative" }}>
           
            <button
                onClick={() => router.push('/setting')}
                style={{
                    position: 'fixed',
                    top: 18,
                    left: 18,
                    zIndex: 200,
                    background: 'rgba(255,255,255,0.85)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    fontSize: '1.7rem',
                    color: '#64748b',
                    boxShadow: '0 2px 8px #b3d8ff33',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s'
                }}
                aria-label="閉じる"
            >
                &#10005;
            </button>
            <div style={{ maxWidth: "600px", margin: "0 auto", padding: "48px 0 0 0" }}>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "30px" }}>
                    <div style={{ width: 180, height: 180, background: "#fff", borderRadius: "50%", boxShadow: "0 4px 24px #d0eaff", display: "flex", alignItems: "center", justifyContent: "center", border: "4px solid #eaf4ff" }}>
                        <Image src={selectMode === 'icon' ? selectedIcon : selectedIllust} alt="preview" width={120} height={120} style={{ borderRadius: "50%" }} />
                    </div>
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginBottom: "32px" }}>
                    <button
                        type="button"
                        style={{
                            padding: "12px 32px",
                            fontSize: "17px",
                            fontWeight: "bold",
                            borderRadius: "18px",
                            border: selectMode === 'icon' ? "2px solid #4a90e2" : "2px solid #eee",
                            background: selectMode === 'icon' ? "linear-gradient(90deg, #eaf4ff 0%, #e0e7ff 100%)" : "#fafafa",
                            color: selectMode === 'icon' ? "#222" : "#555",
                            cursor: "pointer",
                            boxShadow: selectMode === 'icon' ? "0 2px 8px #b3d8ff" : "0 1px 4px #eee",
                            transition: "all 0.2s"
                        }}
                        onClick={() => setSelectMode('icon')}
                    >
                        アイコン
                    </button>
                    <button
                        type="button"
                        style={{
                            padding: "12px 32px",
                            fontSize: "17px",
                            fontWeight: "bold",
                            borderRadius: "18px",
                            border: selectMode === 'illust' ? "2px solid #50c9c3" : "2px solid #eee",
                            background: selectMode === 'illust' ? "linear-gradient(90deg, #eaf4ff 0%, #e0e7ff 100%)" : "#fafafa",
                            color: selectMode === 'illust' ? "#222" : "#555",
                            cursor: "pointer",
                            boxShadow: selectMode === 'illust' ? "0 2px 8px #b3d8ff" : "0 1px 4px #eee",
                            transition: "all 0.2s"
                        }}
                        onClick={() => setSelectMode('illust')}
                    >
                        イラスト
                    </button>
                </div>
                {/* 選択したモードの画像一覧 */}
                {selectMode === 'icon' ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px", paddingBottom: "12px", marginBottom: "32px" }}>
                        {iconImages.map((img, idx) => (
                            <div key={img} style={{ display: "flex", justifyContent: "center" }}>
                                <div
                                    style={{
                                        width: 72,
                                        height: 72,
                                        borderRadius: "50%",
                                        background: selectedIcon === img ? "linear-gradient(120deg, #e0e7ff 60%, #f7faff 100%)" : "#f7faff",
                                        boxShadow: selectedIcon === img ? "0 4px 16px #b3d8ff" : "0 1px 4px #eee",
                                        border: selectedIcon === img ? "3px solid #4a90e2" : "2px solid #eee",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                        overflow: "hidden"
                                    }}
                                    onClick={() => setSelectedIcon(img)}
                                >
                                    <Image
                                        src={img}
                                        alt="icon"
                                        width={48}
                                        height={48}
                                        style={{ borderRadius: "50%", filter: selectedIcon === img ? "none" : "grayscale(30%) brightness(1.1)", transition: "all 0.2s" }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px", paddingBottom: "12px", marginBottom: "32px" }}>
                        {illustImages.map((img, idx) => (
                            <div key={img} style={{ display: "flex", justifyContent: "center" }}>
                                <div
                                    style={{
                                        width: 72,
                                        height: 72,
                                        borderRadius: "50%",
                                        background: selectedIllust === img ? "linear-gradient(120deg, #e0e7ff 60%, #f7faff 100%)" : "#f7faff",
                                        boxShadow: selectedIllust === img ? "0 4px 16px #b3d8ff" : "0 1px 4px #eee",
                                        border: selectedIllust === img ? "3px solid #50c9c3" : "2px solid #eee",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                        overflow: "hidden"
                                    }}
                                    onClick={() => setSelectedIllust(img)}
                                >
                                    <Image
                                        src={img}
                                        alt="illust"
                                        width={48}
                                        height={48}
                                        style={{ borderRadius: "50%", filter: selectedIllust === img ? "none" : "grayscale(30%) brightness(1.1)", transition: "all 0.2s" }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* きせかえ完了ボタン */}
            <div style={{ position: "fixed", left: 0, bottom: 0, width: "100%", display: "flex", justifyContent: "center", padding: "24px 0", zIndex: 100 }}>
                <button
                    type="button"
                    style={{
                        minWidth: "220px",
                        padding: "18px 0",
                        fontSize: "20px",
                        fontWeight: "bold",
                        borderRadius: "32px",
                        border: "none",
                        background: "linear-gradient(90deg, #4a90e2 0%, #50c9c3 100%)",
                        color: "#fff",
                        boxShadow: "0 4px 24px #b3d8ff",
                        cursor: "pointer",
                        letterSpacing: "2px",
                        transition: "all 0.2s"
                    }}
                    onClick={() => router.push("/profile")}
                >
                    きせかえ完了
                </button>
            </div>
        </div>
    );
}