"use client";
import Image from "next/image";
import Link from "next/link";
import Toukou from "../components/toukou";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useRouter } from "next/navigation";

type IconPart = {
  id: number;
  icon_parts_type_id: number;
  image: string;
  created_at: string;
  updated_at: string;
  owned?: boolean;
};

type OwnedAsset = {
  id: number;
  image: string;
  point: number;
  created_at: string;
  updated_at: string;
  owned: boolean;
};

type IconPartsResponse = {
  icon_parts: Record<string, IconPart[]>;
  frame_images?: OwnedAsset[];
};

type UserProfile = {
  id: number;
  name: string;
  email: string;
  profile: string | null;
  point: number;
  background_id: number | null;
  frame_id: number | null;
  created_at: string;
  updated_at: string;
};

const ICON_PARTS_ENDPOINT = "http://localhost:3333/api/v1/icon_parts";
const FRAME_ACQUIRE_ENDPOINT = "http://localhost:3333/api/v1/frame_list/acquire";
const USER_ENDPOINT = "http://localhost:3333/api/v1/users";
const ASSET_BASE_URL = "http://localhost:3333";

const formatPoint = (point?: number | null) => {
  if (typeof point !== "number") return "-";
  return `${point.toLocaleString()} pt`;
};

const resolveImageSrc = (imagePath: string, updatedAt?: string) => {
  if (!imagePath) return "";
  const timestamp = updatedAt ? new Date(updatedAt).getTime() : undefined;
  const versionSuffix = typeof timestamp === "number" && !Number.isNaN(timestamp) ? `?t=${timestamp}` : "";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return `${imagePath}${versionSuffix}`;
  }
  const normalized = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
  const base = `${ASSET_BASE_URL}/${normalized}`;
  return `${base}${versionSuffix}`;
};

export default function page() {
    const router = useRouter();

    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [frameOptions, setFrameOptions] = useState<IconPart[]>([]);
    const [frameAssets, setFrameAssets] = useState<OwnedAsset[]>([]);
    const [frameOwnership, setFrameOwnership] = useState<Record<string, boolean>>({});
    const [selectedFrameId, setSelectedFrameId] = useState<number | null>(null);
    const [isFrameLoading, setIsFrameLoading] = useState(false);
    const [frameError, setFrameError] = useState<string | null>(null);
    const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);
    const [purchaseError, setPurchaseError] = useState<string | null>(null);
    const [acquiringFrameId, setAcquiringFrameId] = useState<number | null>(null);
    const [userPoint, setUserPoint] = useState<number | null>(null);
    const [isUserLoading, setIsUserLoading] = useState(false);

    useEffect(() => {
        const storedId = window.localStorage.getItem("emozyUserId");
        setCurrentUserId(storedId ?? "");
    }, []);

    const normalizeImageKey = useCallback((imagePath: string) => {
        if (!imagePath) return "";
        return imagePath
            .replace(/^rails\/?public\/?/i, "")
            .replace(/^public\/?/i, "")
            .replace(/^\//, "");
    }, []);

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
    // 表示コンテンツのモード
    const [selectMode, setSelectMode] = useState<'icon' | 'illust' | 'frame'>('icon');
    // プレビューのベース画像種別
    const [basePreviewMode, setBasePreviewMode] = useState<'icon' | 'illust'>('icon');

    useEffect(() => {
        if (currentUserId === null) {
            return;
        }
        if (!currentUserId) {
            setIsFrameLoading(false);
            setFrameOptions([]);
            setFrameAssets([]);
            setFrameOwnership({});
            setFrameError("ユーザー情報が見つかりません。ログインしてください。");
            return;
        }

        const fetchFrameParts = async () => {
            setIsFrameLoading(true);
            setFrameError(null);
            setPurchaseMessage(null);
            setPurchaseError(null);
            setAcquiringFrameId(null);
            try {
                const response = await fetch(`${ICON_PARTS_ENDPOINT}?user_id=${encodeURIComponent(currentUserId)}`, {
                    cache: "no-store",
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch frame parts: ${response.status}`);
                }
                const data = (await response.json()) as IconPartsResponse;
                const framePartList = data.icon_parts?.frame ?? [];
                const ownedEntries: Record<string, boolean> = {};
                const assets = data.frame_images ?? [];
                assets.forEach((asset) => {
                    const key = normalizeImageKey(asset.image);
                    if (key) {
                        ownedEntries[key] = asset.owned;
                    }
                });
                const enrichedFrames = framePartList.map((item) => {
                    const key = normalizeImageKey(item.image);
                    const ownedValue = key ? ownedEntries[key] : item.owned;
                    return { ...item, owned: typeof ownedValue === "boolean" ? ownedValue : item.owned };
                });
                setFrameOptions(enrichedFrames);
                setFrameAssets(assets);
                setFrameOwnership(ownedEntries);
                if (enrichedFrames.length === 0) {
                    setSelectedFrameId(null);
                } else if (selectedFrameId !== null) {
                    const stillExists = enrichedFrames.some((item) => item.id === selectedFrameId);
                    if (!stillExists) {
                        setSelectedFrameId(null);
                    }
                }
            } catch (err) {
                const message = err instanceof Error ? err.message : "フレーム情報の取得に失敗しました。";
                setFrameError(message);
            } finally {
                setIsFrameLoading(false);
            }
        };

        void fetchFrameParts();
    }, [currentUserId, normalizeImageKey, selectedFrameId]);

    useEffect(() => {
        if (currentUserId === null) {
            return;
        }
        if (!currentUserId) {
            setIsUserLoading(false);
            setUserPoint(null);
            setPurchaseError("ユーザー情報が見つかりません。ログインしてください。");
            return;
        }

        const fetchUserProfile = async () => {
            setIsUserLoading(true);
            setPurchaseError(null);
            try {
                const response = await fetch(`${USER_ENDPOINT}/${encodeURIComponent(currentUserId)}`, {
                    cache: "no-store",
                });
                if (!response.ok) {
                    throw new Error(`ユーザー情報の取得に失敗しました: ${response.status}`);
                }
                const data = (await response.json()) as UserProfile;
                setUserPoint(typeof data.point === "number" ? data.point : 0);
            } catch (err) {
                const message = err instanceof Error ? err.message : "ユーザー情報を取得できませんでした。";
                setPurchaseError(message);
            } finally {
                setIsUserLoading(false);
            }
        };

        void fetchUserProfile();
    }, [currentUserId]);

    const isFrameOwned = useCallback(
        (option: IconPart) => {
            if (typeof option.owned === "boolean") {
                return option.owned;
            }
            const key = normalizeImageKey(option.image);
            if (!key) return true;
            if (Object.prototype.hasOwnProperty.call(frameOwnership, key)) {
                return frameOwnership[key];
            }
            return true;
        },
        [frameOwnership, normalizeImageKey]
    );

    const getFrameCost = useCallback(
        (option: IconPart) => {
            const key = normalizeImageKey(option.image);
            if (!key) return null;
            const asset = frameAssets.find((item) => normalizeImageKey(item.image) === key);
            return asset?.point ?? null;
        },
        [frameAssets, normalizeImageKey]
    );

    const acquireFrame = useCallback(
        async (option: IconPart) => {
            if (!currentUserId) {
                setPurchaseError("ユーザー情報が見つかりません。ログインしてください。");
                return false;
            }

            const numericUserId = Number(currentUserId);
            if (!Number.isFinite(numericUserId) || numericUserId <= 0) {
                setPurchaseError("ユーザー情報が不正です。ログインし直してください。");
                return false;
            }

            const normalizedKey = normalizeImageKey(option.image);
            if (!normalizedKey) {
                setPurchaseError("購入対象の画像パスが不正です。");
                return false;
            }

            const targetAsset = frameAssets.find(
                (asset) => normalizeImageKey(asset.image) === normalizedKey
            );
            if (!targetAsset) {
                setPurchaseError("該当するフレームが見つかりません。");
                return false;
            }

            if (isUserLoading) {
                setPurchaseError("ユーザー情報を取得しています。少し待ってから再度お試しください。");
                return false;
            }

            if (userPoint === null) {
                setPurchaseError("ユーザーの所持ポイントを取得できませんでした。");
                return false;
            }

            const cost = targetAsset.point ?? 0;
            const remainingPoints = userPoint - cost;
            if (remainingPoints < 0) {
                setPurchaseError(`ポイントが不足しています。（所持: ${userPoint} / 必要: ${cost}）`);
                return false;
            }

            const confirmMessage = [
                "フレームを購入しますか？",
                "",
                `所持ポイント: ${formatPoint(userPoint)}`,
                `消費ポイント: ${formatPoint(cost)}`,
                `購入後ポイント: ${formatPoint(remainingPoints)}`,
            ].join("\n");

            const confirmed = window.confirm(confirmMessage);
            if (!confirmed) {
                setPurchaseMessage("購入をキャンセルしました。");
                return false;
            }

            setAcquiringFrameId(option.id);
            setPurchaseError(null);
            setPurchaseMessage(null);
            try {
                const response = await fetch(FRAME_ACQUIRE_ENDPOINT, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        user_id: numericUserId,
                        frame_image_id: targetAsset.id,
                    }),
                });
                if (!response.ok) {
                    let message = `フレームを取得できませんでした: ${response.status}`;
                    const rawBody = await response.text();
                    if (rawBody) {
                        try {
                            const errorJson = JSON.parse(rawBody);
                            if (typeof errorJson?.message === "string") {
                                message = errorJson.message;
                            }
                        } catch {
                            message = rawBody;
                        }
                    }
                    throw new Error(message);
                }

                setFrameOwnership((prev) => ({
                    ...prev,
                    [normalizedKey]: true,
                }));
                setFrameAssets((prev) =>
                    prev.map((asset) =>
                        normalizeImageKey(asset.image) === normalizedKey ? { ...asset, owned: true } : asset
                    )
                );
                setFrameOptions((prev) =>
                    prev.map((item) =>
                        item.id === option.id ? { ...item, owned: true } : item
                    )
                );
                setUserPoint(remainingPoints);
                setSelectedFrameId(option.id);
                setPurchaseMessage("フレームを取得しました。");
                return true;
            } catch (err) {
                const message = err instanceof Error ? err.message : "フレームの取得に失敗しました。";
                setPurchaseError(message);
                return false;
            } finally {
                setAcquiringFrameId(null);
            }
        },
        [currentUserId, frameAssets, isUserLoading, normalizeImageKey, userPoint]
    );

    const handleFrameClick = useCallback(
        async (option: IconPart) => {
            const owned = isFrameOwned(option);
            if (owned) {
                setSelectedFrameId((prev) => (prev === option.id ? null : option.id));
                setPurchaseMessage(null);
                setPurchaseError(null);
                return;
            }
            await acquireFrame(option);
        },
        [acquireFrame, isFrameOwned]
    );

    const selectedFrame = useMemo(() => {
        if (selectedFrameId === null) return null;
        return frameOptions.find((item) => item.id === selectedFrameId) ?? null;
    }, [frameOptions, selectedFrameId]);

    const selectedFrameSrc = useMemo(() => {
        if (!selectedFrame) return "";
        return resolveImageSrc(selectedFrame.image, selectedFrame.updated_at);
    }, [selectedFrame]);

    const canUseSelectedFrame = useMemo(() => {
        if (!selectedFrame) return false;
        return isFrameOwned(selectedFrame);
    }, [isFrameOwned, selectedFrame]);

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
            <div style={{ maxWidth: "960px", margin: "0 auto", padding: "48px 24px 0" }}>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "30px" }}>
                    <div
                        style={{
                            width: 180,
                            height: 180,
                            position: "relative",
                            background: "#fff",
                            borderRadius: "50%",
                            boxShadow: "0 4px 24px #d0eaff",
                            border: "4px solid #eaf4ff",
                            overflow: "hidden"
                        }}
                    >
                        <Image
                            src={basePreviewMode === 'icon' ? selectedIcon : selectedIllust}
                            alt="preview"
                            fill
                            sizes="180px"
                            style={{ objectFit: "cover" }}
                        />
                        {selectedFrame && canUseSelectedFrame && selectedFrameSrc && (
                            <Image
                                src={selectedFrameSrc}
                                alt="frame"
                                fill
                                sizes="180px"
                                priority
                                style={{ objectFit: "contain", pointerEvents: "none" }}
                            />
                        )}
                    </div>
                </div>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
                    <div
                        style={{
                            width: "100%",
                            maxWidth: "760px",
                            background: "rgba(255,255,255,0.95)",
                            borderRadius: "28px",
                            padding: "28px 32px",
                            boxShadow: "0 20px 45px rgba(148,163,184,0.25)",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "28px", flexWrap: "wrap" }}>
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectMode('icon');
                                    setBasePreviewMode('icon');
                                }}
                                style={{
                                    padding: "12px 32px",
                                    fontSize: "17px",
                                    fontWeight: "bold",
                                    borderRadius: "18px",
                                    border: selectMode === 'icon' ? "2px solid #4a90e2" : "2px solid #e2e8f0",
                                    background: selectMode === 'icon' ? "linear-gradient(90deg, #eaf4ff 0%, #e0e7ff 100%)" : "#f8fafc",
                                    color: selectMode === 'icon' ? "#1f2937" : "#475569",
                                    cursor: "pointer",
                                    boxShadow: selectMode === 'icon' ? "0 4px 14px rgba(74,144,226,0.35)" : "0 2px 6px rgba(148,163,184,0.25)",
                                    transition: "all 0.2s",
                                }}
                            >
                                アイコン
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectMode('illust');
                                    setBasePreviewMode('illust');
                                }}
                                style={{
                                    padding: "12px 32px",
                                    fontSize: "17px",
                                    fontWeight: "bold",
                                    borderRadius: "18px",
                                    border: selectMode === 'illust' ? "2px solid #50c9c3" : "2px solid #e2e8f0",
                                    background: selectMode === 'illust' ? "linear-gradient(90deg, #dbfbff 0%, #c8eff6 100%)" : "#f8fafc",
                                    color: selectMode === 'illust' ? "#115e59" : "#475569",
                                    cursor: "pointer",
                                    boxShadow: selectMode === 'illust' ? "0 4px 14px rgba(16,185,129,0.3)" : "0 2px 6px rgba(148,163,184,0.25)",
                                    transition: "all 0.2s",
                                }}
                            >
                                イラスト
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectMode('frame')}
                                style={{
                                    padding: "12px 32px",
                                    fontSize: "17px",
                                    fontWeight: "bold",
                                    borderRadius: "18px",
                                    border: selectMode === 'frame' ? "2px solid #f59e0b" : "2px solid #e2e8f0",
                                    background: selectMode === 'frame' ? "linear-gradient(90deg, #fff7ed 0%, #fef3c7 100%)" : "#f8fafc",
                                    color: selectMode === 'frame' ? "#92400e" : "#475569",
                                    cursor: "pointer",
                                    boxShadow: selectMode === 'frame' ? "0 4px 14px rgba(245,158,11,0.3)" : "0 2px 6px rgba(148,163,184,0.25)",
                                    transition: "all 0.2s",
                                }}
                            >
                                フレーム
                            </button>
                        </div>

                        {selectMode === 'icon' && (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "24px" }}>
                                {iconImages.map((img) => (
                                    <div key={img} style={{ display: "flex", justifyContent: "center" }}>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedIcon(img)}
                                            style={{
                                                width: 78,
                                                height: 78,
                                                borderRadius: "50%",
                                                border: selectedIcon === img ? "3px solid #4a90e2" : "2px solid #e2e8f0",
                                                background: selectedIcon === img ? "linear-gradient(120deg, #e0e7ff 60%, #f7faff 100%)" : "#f8fafc",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                cursor: "pointer",
                                                transition: "all 0.2s",
                                                boxShadow: selectedIcon === img ? "0 4px 16px rgba(74,144,226,0.35)" : "0 2px 8px rgba(148,163,184,0.15)",
                                            }}
                                        >
                                            <Image
                                                src={img}
                                                alt="icon"
                                                width={54}
                                                height={54}
                                                style={{ borderRadius: "50%", filter: selectedIcon === img ? "none" : "grayscale(30%) brightness(1.1)", transition: "all 0.2s" }}
                                            />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {selectMode === 'illust' && (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "24px" }}>
                                {illustImages.map((img) => (
                                    <div key={img} style={{ display: "flex", justifyContent: "center" }}>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedIllust(img)}
                                            style={{
                                                width: 78,
                                                height: 78,
                                                borderRadius: "50%",
                                                border: selectedIllust === img ? "3px solid #50c9c3" : "2px solid #e2e8f0",
                                                background: selectedIllust === img ? "linear-gradient(120deg, #d1fae5 60%, #ecfeff 100%)" : "#f8fafc",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                cursor: "pointer",
                                                transition: "all 0.2s",
                                                boxShadow: selectedIllust === img ? "0 4px 16px rgba(16,185,129,0.3)" : "0 2px 8px rgba(148,163,184,0.15)",
                                            }}
                                        >
                                            <Image
                                                src={img}
                                                alt="illust"
                                                width={54}
                                                height={54}
                                                style={{ borderRadius: "50%", filter: selectedIllust === img ? "none" : "grayscale(30%) brightness(1.1)", transition: "all 0.2s" }}
                                            />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {selectMode === 'frame' && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1f3247" }}>フレーム一覧</h3>
                                    <span style={{ fontSize: "14px", fontWeight: 600, color: "#475569" }}>
                                        {isUserLoading ? "ポイント読み込み中..." : `所持ポイント: ${formatPoint(userPoint)}`}
                                    </span>
                                </div>
                                {isFrameLoading && (
                                    <p style={{ fontSize: "14px", color: "#475569" }}>フレームを読み込み中です...</p>
                                )}
                                {!isFrameLoading && frameError && (
                                    <p style={{ fontSize: "14px", color: "#dc2626" }}>読み込みに失敗しました: {frameError}</p>
                                )}
                                {!isFrameLoading && !frameError && frameOptions.length === 0 && (
                                    <p style={{ fontSize: "14px", color: "#475569" }}>表示できるフレームがありません。</p>
                                )}
                                {!isFrameLoading && !frameError && frameOptions.length > 0 && (
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "18px" }}>
                                        {frameOptions.map((option) => {
                                            const owned = isFrameOwned(option);
                                            const optionSrc = resolveImageSrc(option.image, option.updated_at);
                                            const isSelected = selectedFrameId === option.id;
                                            const isAcquiring = acquiringFrameId === option.id;
                                            const cost = getFrameCost(option);
                                            const cursorStyle = isAcquiring ? "wait" : "pointer";
                                            const borderColor = isSelected ? "#f59e0b" : owned ? "#94a3b8" : "#cbd5f5";
                                            const borderWidth = isSelected ? "3px" : "2px";
                                            const boxShadow = isSelected ? "0 6px 20px rgba(245,158,11,0.35)" : "0 3px 12px rgba(15,23,42,0.15)";
                                            return (
                                                <button
                                                    type="button"
                                                    key={option.id}
                                                    onClick={() => {
                                                        if (isAcquiring) return;
                                                        void handleFrameClick(option);
                                                    }}
                                                    style={{
                                                        position: "relative",
                                                        width: "100%",
                                                        paddingTop: "100%",
                                                        borderRadius: "22px",
                                                        border: `${borderWidth} solid ${borderColor}`,
                                                        background: "#ffffff",
                                                        boxShadow,
                                                        cursor: cursorStyle,
                                                        overflow: "hidden",
                                                        transition: "all 0.2s",
                                                        outline: "none",
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            position: "absolute",
                                                            inset: 0,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            padding: "12px",
                                                        }}
                                                    >
                                                        {optionSrc && (
                                                            <Image
                                                                src={optionSrc}
                                                                alt="frame-option"
                                                                fill
                                                                sizes="110px"
                                                                style={{ objectFit: "contain" }}
                                                            />
                                                        )}
                                                        {!owned && (
                                                            <span
                                                                style={{
                                                                    position: "absolute",
                                                                    inset: 0,
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    background: "rgba(15,23,42,0.55)",
                                                                    color: "#f8fafc",
                                                                    fontSize: "12px",
                                                                    fontWeight: 700,
                                                                    letterSpacing: "0.05em",
                                                                }}
                                                            >
                                                                {isAcquiring ? "購入中..." : "未所持"}
                                                            </span>
                                                        )}
                                                    </span>
                                                    {cost !== null && (
                                                        <span
                                                            style={{
                                                                position: "absolute",
                                                                left: "12px",
                                                                right: "12px",
                                                                bottom: "12px",
                                                                display: "inline-flex",
                                                                justifyContent: "center",
                                                                alignItems: "center",
                                                                padding: "5px 8px",
                                                                borderRadius: "999px",
                                                                fontSize: "11px",
                                                                fontWeight: 700,
                                                                background: owned ? "rgba(255,255,255,0.88)" : "rgba(250,204,21,0.25)",
                                                                color: owned ? "#1f2937" : "#b45309",
                                                                backdropFilter: "blur(2px)",
                                                            }}
                                                        >
                                                            {owned ? `購入済み ${formatPoint(cost)}` : `購入 ${formatPoint(cost)}`}
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {purchaseMessage && (
                                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#166534", background: "#dcfce7", borderRadius: "12px", padding: "12px 16px" }}>
                                        {purchaseMessage}
                                    </p>
                                )}
                                {purchaseError && (
                                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#b91c1c", background: "#fee2e2", borderRadius: "12px", padding: "12px 16px" }}>
                                        {purchaseError}
                                    </p>
                                )}
                            </div>
                        )}
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
    );
}
