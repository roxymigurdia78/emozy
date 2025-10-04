"use client";
import Image from "next/image";
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

type ApiIconImage = {
  id: number;
  image: string;
  point: number;
  created_at: string;
  updated_at: string;
  image_url?: string;
  icon_image_list_id?: number;
  owned?: boolean;
};

type IconImage = {
  id: number;
  image: string;
  point: number;
  created_at: string;
  updated_at: string;
  owned?: boolean;
};

type IconImageApiResponse = {
  owned_icon_images?: ApiIconImage[];
  unowned_icon_images?: ApiIconImage[];
  generated_icon_images?: ApiIconImage[];
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
const ICON_IMAGES_ENDPOINT = "http://localhost:3333/api/v1/icon_image";
const ICON_IMAGE_ACQUIRE_ENDPOINT = "http://localhost:3333/api/v1/icon_image_list/acquire";
const ICON_SAVE_ENDPOINT = "http://localhost:3333/api/v1/icon_maker/save";
const USER_FRAME_UPDATE_ENDPOINT = "http://localhost:3333/api/v1/make";
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
  const normalized = imagePath
    .replace(/^rails\/?public\/?/i, "")
    .replace(/^public\/?/i, "")
    .replace(/^\/+/, "");
  if (!normalized) {
    return "";
  }
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

    // アイコン一覧と所持状態
    const [iconOptions, setIconOptions] = useState<IconImage[]>([]);
    const [iconOwnership, setIconOwnership] = useState<Record<number, boolean>>({});
    const [selectedIconImageId, setSelectedIconImageId] = useState<number | null>(null);
    const [isIconLoading, setIsIconLoading] = useState(false);
    const [iconError, setIconError] = useState<string | null>(null);
    const [acquiringIconId, setAcquiringIconId] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // 選択状態
    // 表示コンテンツのモード
    const [selectMode, setSelectMode] = useState<'icon' | 'frame'>('icon');

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
            setIsIconLoading(false);
            setIconOptions([]);
            setIconOwnership({});
            setSelectedIconImageId(null);
            setIconError("ユーザー情報が見つかりません。ログインしてください。");
            return;
        }

        const fetchIconImages = async () => {
            setIsIconLoading(true);
            setIconError(null);
            setAcquiringIconId(null);
            try {
                const iconResponse = await fetch(`${ICON_IMAGES_ENDPOINT}?user_id=${encodeURIComponent(currentUserId)}`, { cache: "no-store" });
                if (!iconResponse.ok) {
                    throw new Error(`アイコン画像の取得に失敗しました: ${iconResponse.status}`);
                }

                const iconData = (await iconResponse.json()) as IconImageApiResponse;

                const ownedMap: Record<number, boolean> = {};

                const ownedIcons = iconData.owned_icon_images ?? [];
                const unownedIcons = iconData.unowned_icon_images ?? [];
                const generatedIcons = iconData.generated_icon_images ?? [];

                const allIcons = [...ownedIcons, ...unownedIcons, ...generatedIcons];

                allIcons.forEach((icon) => {
                    if (typeof icon.icon_image_list_id === "number") {
                        ownedMap[icon.id] = true;
                    }
                });

                const normalizedIcons: IconImage[] = allIcons.map((icon) => ({
                    id: icon.id,
                    image: icon.image,
                    point: icon.point,
                    created_at: icon.created_at,
                    updated_at: icon.updated_at,
                    owned: ownedMap[icon.id] ?? false,
                }));

                const filteredIcons = normalizedIcons.filter((icon) => {
                    if (typeof icon.point === "number" && icon.point === 0) {
                        return icon.owned === true;
                    }
                    return true;
                });

                setIconOptions(filteredIcons);
                setIconOwnership(ownedMap);

                setSelectedIconImageId((prev) => {
                    if (prev !== null) {
                        const existing = filteredIcons.find((item) => item.id === prev);
                        if (existing && (existing.owned ?? ownedMap[prev])) {
                            return prev;
                        }
                    }
                    const firstOwned = filteredIcons.find((item) => item.owned);
                    return firstOwned ? firstOwned.id : null;
                });
            } catch (err) {
                const message = err instanceof Error ? err.message : "アイコン画像を取得できませんでした";
                setIconError(message);
                setIconOptions([]);
                setIconOwnership({});
                setSelectedIconImageId(null);
            } finally {
                setIsIconLoading(false);
            }
        };

        void fetchIconImages();
    }, [currentUserId]);

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

    const isIconOwned = useCallback(
        (option: IconImage) => {
            if (typeof option.owned === "boolean") {
                return option.owned;
            }
            return iconOwnership[option.id] ?? false;
        },
        [iconOwnership]
    );

    const getIconCost = useCallback((option: IconImage) => {
        return typeof option.point === "number" ? option.point : null;
    }, []);

    const sortedIconOptions = useMemo(() => {
        return iconOptions
            .map((option, index) => ({ option, index }))
            .sort((a, b) => {
                const ownedDiff = (isIconOwned(b.option) ? 1 : 0) - (isIconOwned(a.option) ? 1 : 0);
                if (ownedDiff !== 0) {
                    return ownedDiff;
                }
                return a.index - b.index;
            })
            .map(({ option }) => option);
    }, [iconOptions, isIconOwned]);

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
                setPurchaseMessage(null);
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

    const acquireIconImage = useCallback(
        async (option: IconImage) => {
            if (!currentUserId) {
                setPurchaseError("ユーザー情報が見つかりません。ログインしてください。");
                return false;
            }

            const numericUserId = Number(currentUserId);
            if (!Number.isFinite(numericUserId) || numericUserId <= 0) {
                setPurchaseError("ユーザー情報が不正です。ログインし直してください。");
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

            const cost = typeof option.point === "number" ? option.point : 0;
            const remainingPoints = userPoint - cost;
            if (remainingPoints < 0) {
                setPurchaseMessage(null);
                setPurchaseError(`ポイントが不足しています。（所持: ${userPoint} / 必要: ${cost}）`);
                return false;
            }

            const confirmMessage = [
                "アイコンを購入しますか？",
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

            setAcquiringIconId(option.id);
            setPurchaseError(null);
            setPurchaseMessage(null);
            try {
                const response = await fetch(ICON_IMAGE_ACQUIRE_ENDPOINT, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        user_id: numericUserId,
                        icon_image_id: option.id,
                    }),
                });

                if (!response.ok) {
                    let message = `アイコンを取得できませんでした: ${response.status}`;
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

                setIconOwnership((prev) => ({
                    ...prev,
                    [option.id]: true,
                }));
                setIconOptions((prev) =>
                    prev.map((item) => (item.id === option.id ? { ...item, owned: true } : item))
                );
                setUserPoint(remainingPoints);
                setSelectedIconImageId(option.id);
                setPurchaseMessage("アイコンを取得しました。");
                return true;
            } catch (err) {
                const message = err instanceof Error ? err.message : "アイコンの取得に失敗しました。";
                setPurchaseError(message);
                return false;
            } finally {
                setAcquiringIconId(null);
            }
        },
        [currentUserId, isUserLoading, userPoint]
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

    const handleIconClick = useCallback(
        async (option: IconImage) => {
            if (acquiringIconId === option.id) {
                return;
            }
            if (isIconOwned(option)) {
                setSelectedIconImageId(option.id);
                setPurchaseMessage(null);
                setPurchaseError(null);
                return;
            }
            await acquireIconImage(option);
        },
        [acquireIconImage, acquiringIconId, isIconOwned]
    );

    const selectedIconOption = useMemo(() => {
        if (selectedIconImageId === null) return null;
        return iconOptions.find((item) => item.id === selectedIconImageId) ?? null;
    }, [iconOptions, selectedIconImageId]);

    const selectedIconSrc = useMemo(() => {
        if (!selectedIconOption) return "";
        return resolveImageSrc(selectedIconOption.image, selectedIconOption.updated_at);
    }, [selectedIconOption]);

    const numericUserId = useMemo(() => {
        if (!currentUserId) return null;
        const parsed = Number(currentUserId);
        if (!Number.isFinite(parsed) || parsed <= 0) return null;
        return parsed;
    }, [currentUserId]);

    const selectedFrame = useMemo(() => {
        if (selectedFrameId === null) return null;
        return frameOptions.find((item) => item.id === selectedFrameId) ?? null;
    }, [frameOptions, selectedFrameId]);

    const canUseSelectedFrame = useMemo(() => {
        if (!selectedFrame) return false;
        return isFrameOwned(selectedFrame);
    }, [isFrameOwned, selectedFrame]);

    const selectedFrameAsset = useMemo(() => {
        if (!selectedFrame || !canUseSelectedFrame) return null;
        const key = normalizeImageKey(selectedFrame.image);
        if (!key) return null;
        return frameAssets.find((asset) => normalizeImageKey(asset.image) === key) ?? null;
    }, [frameAssets, normalizeImageKey, selectedFrame, canUseSelectedFrame]);

    const selectedFrameAssetId = selectedFrameAsset?.id ?? null;

    const selectedFrameSrc = useMemo(() => {
        if (!selectedFrame) return "";
        return resolveImageSrc(selectedFrame.image, selectedFrame.updated_at);
    }, [selectedFrame]);

    const sortedFrameOptions = useMemo(() => {
        return frameOptions
            .map((option, index) => ({ option, index }))
            .sort((a, b) => {
                const ownedDiff = (isFrameOwned(b.option) ? 1 : 0) - (isFrameOwned(a.option) ? 1 : 0);
                if (ownedDiff !== 0) {
                    return ownedDiff;
                }
                return a.index - b.index;
            })
            .map(({ option }) => option);
    }, [frameOptions, isFrameOwned]);

    const handleComplete = useCallback(async () => {
        setSaveError(null);
        if (numericUserId === null) {
            setSaveError("ユーザー情報が見つかりません。ログインしてください。");
            return;
        }
        if (selectedIconImageId === null) {
            setSaveError("アイコンを選択してください。");
            setSelectMode('icon');
            return;
        }
        if (selectedIconOption && !isIconOwned(selectedIconOption)) {
            setSaveError("未所持のアイコンは使用できません。購入後に選択してください。");
            setSelectMode('icon');
            return;
        }

        const payload: Record<string, unknown> = {
            user_id: numericUserId,
            icon_image_id: selectedIconImageId,
        };

        if (selectedFrameAssetId && canUseSelectedFrame) {
            payload.frame_image_id = selectedFrameAssetId;
        }

        setIsSaving(true);
        try {
            const payloadJson = JSON.stringify(payload);
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

            if (selectedFrameAssetId && canUseSelectedFrame) {
                try {
                    const frameResponse = await fetch(`${USER_FRAME_UPDATE_ENDPOINT}/${numericUserId}`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ frame_id: selectedFrameAssetId }),
                    });
                    if (!frameResponse.ok) {
                        const body = await frameResponse.text();
                        console.warn(`Failed to update frame_id: ${frameResponse.status} ${body}`);
                    }
                } catch (err) {
                    console.warn("ユーザーの frame_id 更新に失敗しました", err);
                }
            }

            router.push("/profile");
        } catch (err) {
            const message = err instanceof Error ? err.message : "保存処理に失敗しました";
            setSaveError(message);
        } finally {
            setIsSaving(false);
        }
    }, [numericUserId, selectedIconImageId, selectedIconOption, isIconOwned, canUseSelectedFrame, selectedFrameAssetId, router]);

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
                        {selectedIconSrc ? (
                            <Image
                                src={selectedIconSrc}
                                alt="selected icon"
                                fill
                                sizes="180px"
                                style={{ objectFit: "contain" }}
                            />
                        ) : (
                            <div
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "16px",
                                    textAlign: "center",
                                    color: "#94a3b8",
                                    fontSize: "13px",
                                    lineHeight: 1.5,
                                }}
                            >
                                アイコンを選択または購入してください
                            </div>
                        )}
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
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1f3247" }}>アイコン一覧</h3>
                                    <span style={{ fontSize: "14px", fontWeight: 600, color: "#475569" }}>
                                        {isUserLoading ? "ポイント読み込み中..." : `所持ポイント: ${formatPoint(userPoint)}`}
                                    </span>
                                </div>
                                {isIconLoading && (
                                    <p style={{ fontSize: "14px", color: "#475569" }}>アイコンを読み込み中です...</p>
                                )}
                                {!isIconLoading && iconError && (
                                    <p style={{ fontSize: "14px", color: "#dc2626" }}>{iconError}</p>
                                )}
                                {!isIconLoading && !iconError && iconOptions.length === 0 && (
                                    <p style={{ fontSize: "14px", color: "#475569" }}>表示できるアイコンがありません。</p>
                                )}
                                {!isIconLoading && !iconError && iconOptions.length > 0 && (
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: "20px" }}>
                                        {sortedIconOptions.map((option) => {
                                            const owned = isIconOwned(option);
                                            const optionSrc = resolveImageSrc(option.image, option.updated_at);
                                            const isSelected = selectedIconImageId === option.id;
                                            const isAcquiring = acquiringIconId === option.id;
                                            const cost = getIconCost(option);
                                            const cursorStyle = isAcquiring ? "wait" : "pointer";
                                            const borderColor = isSelected ? "#4a90e2" : owned ? "#94a3b8" : "#cbd5f5";
                                            const borderWidth = isSelected ? "3px" : "2px";
                                            const boxShadow = isSelected ? "0 6px 18px rgba(74,144,226,0.35)" : "0 3px 12px rgba(15,23,42,0.12)";
                                            return (
                                                <button
                                                    type="button"
                                                    key={option.id}
                                                    onClick={() => {
                                                        if (isAcquiring) return;
                                                        void handleIconClick(option);
                                                    }}
                                                    style={{
                                                        position: "relative",
                                                        width: "100%",
                                                        paddingTop: "100%",
                                                        borderRadius: "24px",
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
                                                                alt="icon-option"
                                                                fill
                                                                sizes="96px"
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
                                                                    textAlign: "center",
                                                                    pointerEvents: "none",
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
                                                                left: "10px",
                                                                right: "10px",
                                                                bottom: "10px",
                                                                display: "inline-flex",
                                                                justifyContent: "center",
                                                                alignItems: "center",
                                                                padding: "4px 6px",
                                                                borderRadius: "999px",
                                                                fontSize: "11px",
                                                                fontWeight: 700,
                                                                background: owned ? "rgba(255,255,255,0.85)" : "rgba(186,230,253,0.4)",
                                                                color: owned ? "#1f2937" : "#0369a1",
                                                                backdropFilter: "blur(2px)",
                                                            }}
                                                        >
                                                            {owned ? `所有 ${formatPoint(cost)}` : `購入 ${formatPoint(cost)}`}
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
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
                                        {sortedFrameOptions.map((option) => {
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
                {saveError && (
                    <p style={{ marginTop: "16px", textAlign: "center", fontSize: "14px", fontWeight: 600, color: "#b91c1c" }}>
                        {saveError}
                    </p>
                )}
            </div>
            {/* きせかえ完了ボタン */}
            <div style={{ position: "fixed", left: 0, bottom: 0, width: "100%", display: "flex", justifyContent: "center", padding: "24px 0", zIndex: 100 }}>
                <button
                    type="button"
                    disabled={isSaving}
                    style={{
                        minWidth: "220px",
                        padding: "18px 0",
                        fontSize: "20px",
                        fontWeight: "bold",
                        borderRadius: "32px",
                        border: "none",
                        background: isSaving ? "#94a3b8" : "linear-gradient(90deg, #4a90e2 0%, #50c9c3 100%)",
                        color: "#fff",
                        boxShadow: isSaving ? "none" : "0 4px 24px #b3d8ff",
                        cursor: isSaving ? "not-allowed" : "pointer",
                        letterSpacing: "2px",
                        transition: "all 0.2s",
                        opacity: isSaving ? 0.7 : 1,
                    }}
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
