"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Toukou from "../components/toukou";
export default function page() {
  const router = useRouter();

  // 仮のパーツ画像や色データ
  const parts = {
  eyes: { label: "目", options: ["/images/eye1.png", "/images/eye2.png"] },
  mouth: { label: "口", options: ["/images/mouth1.png", "/images/mouth2.png"] },
  skin: { label: "肌", options: ["/images/skin1.png", "/images/skin2.png"] },
  frontHair: { label: "前髪", options: ["/images/front1.png", "/images/front2.png"] },
  backHair: { label: "後ろ髪", options: ["/images/back1.png", "/images/back2.png"] },
  eyebrow: { label: "眉", options: ["/images/eyebrow1.png", "/images/eyebrow2.png"] },
  eyeHighlight: { label: "ハイライト", options: ["/images/highlight1.png", "/images/highlight2.png"] },
  clothes: { label: "洋服", options: ["/images/clothes1.png", "/images/clothes2.png"] },
  accessory: { label: "装飾", options: ["/images/glasses.png", "/images/hairpin.png"] },
  background: { label: "背景", options: ["/images/bg1.png", "/images/bg2.png"] },
  };

  // 選択状態
  type PartKey = keyof typeof parts;
  const partKeys = Object.keys(parts) as PartKey[];
  const [activePart, setActivePart] = useState<PartKey>(partKeys[0]);
  const [selected, setSelected] = useState<Record<PartKey, string>>(
    Object.fromEntries(partKeys.map((key) => [key, parts[key].options[0]])) as Record<PartKey, string>
  );

  // パーツ画像選択ハンドラ
  const handleSelect = (part: PartKey, value: string) => {
    setSelected({ ...selected, [part]: value });
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f7faff 0%, #e3e6f5 100%)", position: "relative" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "48px 0 0 0" }}>
        {/* プレビュー枠 */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "30px" }}>
          <div style={{ width: 220, height: 220, background: "#fff", borderRadius: "50%", boxShadow: "0 4px 24px #d0eaff", display: "flex", alignItems: "center", justifyContent: "center", border: "4px solid #eaf4ff" }}>
            {/* 仮画像（アップロードされた画像や合成画像を表示する想定） */}
            <Image src="/images/title.png" alt="preview" width={160} height={160} style={{ borderRadius: "50%" }} />
          </div>
        </div>
        {/* 部位選択タブ */}
        <div style={{ display: "flex", gap: "16px", overflowX: "auto", marginBottom: "-5px", paddingBottom: "10px" }}>
          {partKeys.map((key) => (
            <button
              key={key}
              type="button"
              style={{
                padding: "10px 22px",
                fontSize: "16px",
                fontWeight: "bold",
                borderRadius: "16px",
                border: activePart === key ? "2px solid #4a90e2" : "2px solid #eee",
                background: activePart === key ? "#eaf4ff" : "#fafafa",
                color: activePart === key ? "#222" : "#555",
                cursor: "pointer",
                boxShadow: activePart === key ? "0 2px 8px #b3d8ff" : "0 1px 4px #eee",
                transition: "all 0.2s"
              }}
              onClick={() => setActivePart(key)}
            >
              {parts[key].label}
            </button>
          ))}
        </div>
        {/* 画像選択肢（横スクロール） */}
        <div style={{ padding: "32px 24px", marginBottom: "30px" }}>
          <div style={{ display: "flex", gap: "24px", overflowX: "auto", paddingBottom: "18px" }}>
            {parts[activePart].options.map((opt: string, idx: number) => (
              <Image
                key={opt}
                src={opt}
                alt=""
                width={72}
                height={72}
                style={{ border: selected[activePart] === opt ? "3px solid #4a90e2" : "2px solid #eee", borderRadius: "18px", cursor: "pointer", background: "#fafafa", boxShadow: selected[activePart] === opt ? "0 2px 8px #b3d8ff" : "0 1px 4px #eee", transition: "all 0.2s" }}
                onClick={() => handleSelect(activePart, opt)}
              />
            ))}
          </div>
        </div>
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
  )
}