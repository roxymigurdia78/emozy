"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type IconPart = {
  id: number;
  icon_parts_type_id: number;
  image: string;
  created_at: string;
  updated_at: string;
};

type IconPartsResponse = {
  icon_parts: Record<string, IconPart[]>;
};

const ICON_PARTS_ENDPOINT = "http://localhost:3333/api/v1/icon_parts";
const ICON_SAVE_ENDPOINT = "http://localhost:3333/api/v1/icon_maker/save";
const ICON_MAKE_ENDPOINT = "http://localhost:3333/api/v1/icon_maker/make_icon";
const ASSET_BASE_URL = "http://localhost:3333";
const DEFAULT_USER_ID = 1;
const PART_ORDER = [
  "background",
  "skin",
  "back_hair",
  "clothing",
  "eyebrows",
  "eyes",
  "high_light",
  "front_hair",
  "mouth",
  "accessory",
  "frame",
];

const PART_LABELS: Record<string, string> = {
  eyes: "目",
  mouth: "口",
  skin: "肌",
  front_hair: "前髪",
  back_hair: "後ろ髪",
  eyebrows: "眉",
  high_light: "ハイライト",
  clothing: "洋服",
  accessory: "装飾",
  background: "背景",
  frame: "フレーム",
};

const resolveImageSrc = (imagePath: string) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  const normalized = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
  return `${ASSET_BASE_URL}/${normalized}`;
};

export default function Page() {
  const router = useRouter();
  const [parts, setParts] = useState<Record<string, IconPart[]>>({});
  const [activePart, setActivePart] = useState<string | null>(null);
  const [selectedPartIds, setSelectedPartIds] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const tabButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIconParts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(ICON_PARTS_ENDPOINT, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Failed to fetch icon parts: ${response.status}`);
        }

        const data = (await response.json()) as IconPartsResponse;
        if (data?.icon_parts) {
          setParts(data.icon_parts);
          setSelectedPartIds({});
          const keys = Object.keys(data.icon_parts);
          if (keys.length > 0) {
            setActivePart(keys[0]);
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchIconParts();
  }, []);

  const partKeys = useMemo(() => {
    const keys = Object.keys(parts);
    const prioritized = keys.sort((a, b) => {
      const indexA = PART_ORDER.indexOf(a);
      const indexB = PART_ORDER.indexOf(b);
      const normalizedA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
      const normalizedB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;
      if (normalizedA !== normalizedB) {
        return normalizedA - normalizedB;
      }
      return a.localeCompare(b);
    });
    return prioritized;
  }, [parts]);

  useEffect(() => {
    if (!activePart && partKeys.length > 0) {
      setActivePart(partKeys[0]);
    }
  }, [activePart, partKeys]);

  const updateTabScrollState = useCallback(() => {
    const container = tabsRef.current;
    if (!container) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  useEffect(() => {
    const container = tabsRef.current;
    if (!container) return;
    updateTabScrollState();
    const handleScroll = () => updateTabScrollState();
    container.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [updateTabScrollState]);

  useEffect(() => {
    updateTabScrollState();
  }, [partKeys, updateTabScrollState]);

  const scrollTabs = (direction: "left" | "right") => {
    const container = tabsRef.current;
    if (!container) return;
    const delta = container.offsetWidth * 0.8;
    container.scrollBy({
      left: direction === "left" ? -delta : delta,
      behavior: "smooth",
    });
  };

  const focusPartTab = useCallback((part: string) => {
    const targetButton = tabButtonRefs.current[part];
    if (targetButton) {
      targetButton.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      targetButton.focus({ preventScroll: true });
    }
  }, []);

  const handleSelect = (part: string, option: IconPart) => {
    setSelectedPartIds((prev) => ({ ...prev, [part]: option.id }));
  };

  const selectionPayload = useMemo(() => {
    const filteredIconParts = Object.fromEntries(
      Object.entries(selectedPartIds).filter(([, value]) => typeof value === "number" && value > 0)
    );

    return {
      user_id: DEFAULT_USER_ID,
      icon_parts: filteredIconParts,
    };
  }, [selectedPartIds]);

  const handleComplete = useCallback(async () => {
    setSaveError(null);
    const iconPartCount = Object.keys(selectionPayload.icon_parts).length;
    if (iconPartCount === 0) {
      setSaveError("パーツを選択してください。");
      return;
    }

    const missingPart = PART_ORDER.find((part) => !Object.prototype.hasOwnProperty.call(selectionPayload.icon_parts, part));
    if (missingPart) {
      const label = PART_LABELS[missingPart] ?? missingPart;
      setSaveError(`${label}を選択してください。`);
      setActivePart(missingPart);
      focusPartTab(missingPart);
      return;
    }

    setIsSaving(true);
    try {
      const payloadJson = JSON.stringify(selectionPayload);
      const requestInit: RequestInit = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: payloadJson,
      };

      const saveResponse = await fetch(ICON_SAVE_ENDPOINT, requestInit);
      if (!saveResponse.ok) {
        throw new Error(`icon_maker/save API でエラーが発生しました: ${saveResponse.status}`);
      }

      const makeResponse = await fetch(ICON_MAKE_ENDPOINT, {
        ...requestInit,
        body: payloadJson,
      });
      if (!makeResponse.ok) {
        throw new Error(`icon_maker/make_icon API でエラーが発生しました: ${makeResponse.status}`);
      }

      router.push("/profile");
    } catch (err) {
      const message = err instanceof Error ? err.message : "API 呼び出しに失敗しました";
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  }, [router, selectionPayload]);

  const activeOptions = activePart ? parts[activePart] ?? [] : [];
  const activeSelectionId = activePart ? selectedPartIds[activePart] : undefined;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f7faff 0%, #e3e6f5 100%)",
        position: "relative",
      }}
    >
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "48px 0 0 0" }}>
        {/* プレビュー枠 */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              width: 220,
              height: 220,
              background: "#fff",
              borderRadius: "50%",
              boxShadow: "0 4px 24px #d0eaff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "4px solid #eaf4ff",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "relative",
                width: 160,
                height: 160,
              }}
            >
              {PART_ORDER.map((part, index) => {
                const selectedId = selectedPartIds[part];
                if (!selectedId) return null;
                const matchedPart = parts[part]?.find((item) => item.id === selectedId);
                if (!matchedPart) return null;
                const src = resolveImageSrc(matchedPart.image);
                return (
                  <div
                    key={`${part}-${selectedId}`}
                    style={{
                      position: "absolute",
                      inset: 0,
                      zIndex: index,
                    }}
                  >
                    <Image
                      src={src}
                      alt={PART_LABELS[part] ?? part}
                      fill
                      sizes="160px"
                      style={{
                        objectFit: "contain",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* 部位選択タブ */}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "-5px",
            paddingBottom: "10px",
          }}
        >
        <button
          type="button"
          onClick={() => scrollTabs("left")}
            disabled={!canScrollLeft}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "1px solid #d0dcff",
              background: canScrollLeft ? "#f3f6ff" : "#fbfbfb",
              color: canScrollLeft ? "#4a5fc1" : "#b0b8d9",
              cursor: canScrollLeft ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 6px rgba(74, 144, 226, 0.15)",
              transition: "all 0.2s",
            }}
          >
            {"<"}
          </button>
          <div
            ref={tabsRef}
            style={{
              display: "flex",
              gap: "16px",
              overflowX: "auto",
              scrollBehavior: "smooth",
              padding: "0 4px",
              flex: 1,
            }}
          >
            {partKeys.map((key) => (
              <button
                key={key}
                type="button"
                ref={(el) => {
                  tabButtonRefs.current[key] = el;
                }}
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
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
                onClick={() => setActivePart(key)}
              >
                {PART_LABELS[key] ?? key}
              </button>
            ))}
          </div>
        <button
          type="button"
          onClick={() => scrollTabs("right")}
            disabled={!canScrollRight}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "1px solid #d0dcff",
              background: canScrollRight ? "#f3f6ff" : "#fbfbfb",
              color: canScrollRight ? "#4a5fc1" : "#b0b8d9",
              cursor: canScrollRight ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 6px rgba(74, 144, 226, 0.15)",
              transition: "all 0.2s",
            }}
          >
            {">"}
          </button>
        </div>
        {/* 画像選択肢（横スクロール） */}
        <div style={{ padding: "32px 24px", marginBottom: "30px" }}>
          <div style={{ display: "flex", gap: "24px", overflowX: "auto", paddingBottom: "18px" }}>
            {isLoading && <p style={{ color: "#555" }}>パーツを読み込み中です...</p>}
            {!isLoading && error && (
              <p style={{ color: "#d9534f" }}>読み込みに失敗しました: {error}</p>
            )}
            {!isLoading && !error && activeOptions.length === 0 && (
              <p style={{ color: "#555" }}>表示できるパーツがありません。</p>
            )}
            {!isLoading && !error &&
              activeOptions.map((option) => {
                const optionSrc = resolveImageSrc(option.image);
                const isSelected = activeSelectionId === option.id;
                return (
                  <Image
                    key={option.id}
                    src={optionSrc}
                    alt={PART_LABELS[activePart ?? ""] ?? ""}
                    width={72}
                    height={72}
                    style={{
                      border: isSelected ? "3px solid #4a90e2" : "2px solid #eee",
                      borderRadius: "18px",
                      cursor: "pointer",
                      background: "#fafafa",
                      boxShadow: isSelected ? "0 2px 8px #b3d8ff" : "0 1px 4px #eee",
                      transition: "all 0.2s",
                    }}
                    onClick={() => handleSelect(activePart ?? "", option)}
                  />
                );
              })}
          </div>
          <div
            style={{
              marginTop: "16px",
              fontSize: "14px",
              color: "#666",
              background: "#fff",
              padding: "12px 16px",
              borderRadius: "12px",
              boxShadow: "0 1px 4px #e0e7ff",
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: "4px" }}>選択データ</div>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{JSON.stringify(selectionPayload, null, 2)}</pre>
          </div>
          {saveError && (
            <p style={{ color: "#d9534f", marginTop: "12px" }}>{saveError}</p>
          )}
        </div>
      </div>
      {/* きせかえ完了ボタン */}
      <div
        style={{
          position: "fixed",
          left: 0,
          bottom: 0,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          padding: "24px 0",
          zIndex: 100,
        }}
      >
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
            transition: "all 0.2s",
          }}
          disabled={isSaving}
          onClick={() => {
            void handleComplete();
          }}
        >
          {isSaving ? "保存中..." : "きせかえ完了"}
        </button>
      </div>
    </div>
  );
}
