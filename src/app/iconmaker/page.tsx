"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

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
  background_images?: OwnedAsset[];
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
const ICON_SAVE_ENDPOINT = "http://localhost:3333/api/v1/icon_maker/save";
const ICON_MAKE_ENDPOINT = "http://localhost:3333/api/v1/icon_maker/make_icon";
const BACKGROUND_ACQUIRE_ENDPOINT = "http://localhost:3333/api/v1/background_list/acquire";
const USER_ENDPOINT = "http://localhost:3333/api/v1/users";
const ASSET_BASE_URL = "http://localhost:3333";

// パーツの優先順位
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
};

const formatPoint = (point?: number | null) => {
  if (typeof point !== "number") return "-";
  return `${point.toLocaleString()} pt`;
};

// 画像URLを生成する関数。updatedAt が指定されていればキャッシュ回避用クエリを付与する
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

export default function Page() {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  // APIから取得したパーツをカテゴリ毎に保持
  const [parts, setParts] = useState<Record<string, IconPart[]>>({});
  // 現在選択中のカテゴリ
  const [activePart, setActivePart] = useState<string | null>(null);
  // 各カテゴリに紐づく選択済みパーツID
  const [selectedPartIds, setSelectedPartIds] = useState<Record<string, number>>({});
  // パーツ取得中かどうか
  const [isLoading, setIsLoading] = useState(true);
  // パーツ取得時のエラーメッセージ
  const [error, setError] = useState<string | null>(null);
  // タブコンテナの参照（横スクロール制御用）
  const tabsRef = useRef<HTMLDivElement | null>(null);
  // 各タブボタンの参照（不足時にフォーカス移動するため）
  const tabButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  // タブを左方向にスクロールできるかどうか
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  // タブを右方向にスクロールできるかどうか
  const [canScrollRight, setCanScrollRight] = useState(false);
  // 保存API呼び出し中かどうか
  const [isSaving, setIsSaving] = useState(false);
  // 保存時のエラーメッセージ
  const [saveError, setSaveError] = useState<string | null>(null);
  // 背景・フレームの所持状況を画像パス単位で保持
  const [ownershipMap, setOwnershipMap] = useState<Record<string, Record<string, boolean>>>({});
  // 背景アイテムの詳細リスト
  const [backgroundAssets, setBackgroundAssets] = useState<OwnedAsset[]>([]);
  // フレームアイテムの詳細リスト
  const [frameAssets, setFrameAssets] = useState<OwnedAsset[]>([]);
  const [frameParts, setFrameParts] = useState<IconPart[]>([]);
  // ユーザーが保持しているフレーム
  const [userFrameId, setUserFrameId] = useState<number | null>(null);
  const [userFrameImageSrc, setUserFrameImageSrc] = useState<string | null>(null);
  // パーツ取得中のターゲット（二重押下防止）
  const [acquiringTarget, setAcquiringTarget] = useState<{ part: string; optionId: number } | null>(null);
  // 取得処理に関するステータスメッセージ
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  // ユーザーの所持ポイント
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

  useEffect(() => {
    if (!userFrameId) {
      setUserFrameImageSrc(null);
      return;
    }
    const matchedAsset = frameAssets.find((asset) => asset.id === userFrameId);
    if (matchedAsset) {
      setUserFrameImageSrc(resolveImageSrc(matchedAsset.image, matchedAsset.updated_at));
      return;
    }
    const matchedPart = frameParts.find((part) => part.id === userFrameId);
    if (matchedPart) {
      setUserFrameImageSrc(resolveImageSrc(matchedPart.image, matchedPart.updated_at));
      return;
    }
    setUserFrameImageSrc(null);
  }, [frameAssets, frameParts, userFrameId]);

  useEffect(() => {
    if (currentUserId === null) {
      return;
    }
    if (!currentUserId) {
      setParts({});
      setSelectedPartIds({});
      setOwnershipMap({});
      setBackgroundAssets([]);
      setFrameAssets([]);
      setFrameParts([]);
      setUserFrameId(null);
      setUserFrameImageSrc(null);
      setIsLoading(false);
      setError("ユーザー情報が見つかりません。ログインしてください。");
      return;
    }

    const fetchIconParts = async () => {
      setIsLoading(true);
      setError(null);
      setPurchaseMessage(null);
      setPurchaseError(null);
      setAcquiringTarget(null);
      try {
        // 取得時にキャッシュを無効化し、追加された最新パーツが即時反映されるようにする
        const response = await fetch(`${ICON_PARTS_ENDPOINT}?user_id=${encodeURIComponent(currentUserId)}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch icon parts: ${response.status}`);
        }

        const data = (await response.json()) as IconPartsResponse;
        if (data?.icon_parts) {
          // 背景・フレームの所持情報をマップ化して保存
          const ownedEntries: Record<string, Record<string, boolean>> = {};
          const applyOwnership = (items: OwnedAsset[] | undefined, category: string) => {
            if (!items?.length) return;
            ownedEntries[category] = items.reduce<Record<string, boolean>>((acc, item) => {
              const key = normalizeImageKey(item.image);
              if (key) {
                acc[key] = item.owned;
              }
              return acc;
            }, {});
          };
          setBackgroundAssets(data.background_images ?? []);
          setFrameAssets(data.frame_images ?? []);
          setFrameParts(data.icon_parts.frame ?? []);
          applyOwnership(data.background_images, "background");
          applyOwnership(data.frame_images, "frame");
          if (data.icon_parts.background) {
            data.icon_parts.background = data.icon_parts.background.map((item) => ({
              ...item,
              owned: ownedEntries.background?.[normalizeImageKey(item.image)] ?? item.owned,
            }));
          }
          delete data.icon_parts.frame;
          setOwnershipMap(ownedEntries);
          // APIレスポンスのパーツ一覧を保持（所持情報を付与した後のデータ）
          setParts(data.icon_parts);
          // 既存の選択状態をクリアする（初期表示では空）
          setSelectedPartIds({});
          const keys = Object.keys(data.icon_parts);
          if (keys.length > 0) {
            // 背景パーツがあれば優先的に選択する
            const preferredPart = keys.includes("background") ? "background" : keys[0];
            setActivePart(preferredPart);
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
  }, [currentUserId, normalizeImageKey]);

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
        setUserFrameId(typeof data.frame_id === "number" ? data.frame_id : null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "ユーザー情報を取得できませんでした。";
        setPurchaseError(message);
        setUserFrameId(null);
        setUserFrameImageSrc(null);
      } finally {
        setIsUserLoading(false);
      }
    };

    void fetchUserProfile();
  }, [currentUserId]);

  const partKeys = useMemo(() => {
    const keys = Object.keys(parts);
    // PART_ORDER を優先しつつ、定義外のキーは名前順で後ろに並べる
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
      const preferredPart = partKeys.includes("skin") ? "skin" : partKeys[0];
      setActivePart(preferredPart);
    }
  }, [activePart, partKeys]);

  useEffect(() => {
    if (!activePart) return;
    setPurchaseMessage(null);
    setPurchaseError(null);
  }, [activePart]);

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

  // タブのスクロール制御。方向に応じて一定距離スクロールする
  const scrollTabs = (direction: "left" | "right") => {
    const container = tabsRef.current;
    if (!container) return;
    const delta = container.offsetWidth * 0.8;
    // 画面幅の約8割をスクロールさせ、隠れたタブを素早く表示する
    container.scrollBy({
      left: direction === "left" ? -delta : delta,
      behavior: "smooth",
    });
  };

  // 指定したパーツのタブ要素へスクロールしフォーカスする
  const focusPartTab = useCallback((part: string) => {
    const targetButton = tabButtonRefs.current[part];
    if (targetButton) {
      targetButton.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      targetButton.focus({ preventScroll: true });
    }
  }, []);

  // 背景・フレームを含めてパーツが所持済みかどうかを判定
  const isPartOwned = useCallback(
    (part: string, option: IconPart) => {
      if (!part) return true;
      if (part !== "background" && part !== "frame") {
        return option.owned ?? true;
      }
      if (typeof option.owned === "boolean") {
        return option.owned;
      }
      const categoryMap = ownershipMap[part];
      if (!categoryMap) return true;
      const key = normalizeImageKey(option.image);
      if (!key) return true;
      if (Object.prototype.hasOwnProperty.call(categoryMap, key)) {
        return categoryMap[key];
      }
      return true;
    },
    [normalizeImageKey, ownershipMap]
  );

  // 所持済みのパーツを選択状態として保存
  const handleSelect = useCallback((part: string, option: IconPart) => {
    setSelectedPartIds((prev) => ({ ...prev, [part]: option.id }));
  }, []);

  // 背景・フレームの取得APIを叩き、成功した場合は所持情報を更新
  const acquirePart = useCallback(
    async (part: string, option: IconPart) => {
      if (!part) return false;
      setPurchaseError(null);
      setPurchaseMessage(null);
      if (part !== "background") {
        setPurchaseError("このパーツは購入に対応していません。");
        return false;
      }

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

      const assetList = backgroundAssets;
      const endpoint = BACKGROUND_ACQUIRE_ENDPOINT;
      const payloadKey = "background_image_id";

      const targetAsset = assetList.find(
        (asset) => normalizeImageKey(asset.image) === normalizedKey
      );
      if (!targetAsset) {
        setPurchaseError("該当するパーツが見つかりません。");
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

      const currentPoints = userPoint;
      const cost = targetAsset.point ?? 0;
      const remainingPoints = currentPoints - cost;

      if (remainingPoints < 0) {
        setPurchaseError(
          `ポイントが不足しています。（所持: ${currentPoints} / 必要: ${cost}）`
        );
        return false;
      }

      const confirmMessage = [
        `${PART_LABELS[part] ?? part}を購入しますか？`,
        "",
        `所持ポイント: ${currentPoints}`,
        `消費ポイント: ${cost}`,
        `購入後ポイント: ${remainingPoints}`,
      ].join("\n");

      const confirmed = window.confirm(confirmMessage);
      if (!confirmed) {
        setPurchaseMessage("購入をキャンセルしました。");
        return false;
      }

      setAcquiringTarget({ part, optionId: option.id });
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: numericUserId,
            [payloadKey]: targetAsset.id,
          }),
        });

        if (!response.ok) {
          let message = `${PART_LABELS[part] ?? part}を取得できませんでした: ${response.status}`;
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

        setOwnershipMap((prev) => ({
          ...prev,
          [part]: {
            ...(prev[part] ?? {}),
            [normalizedKey]: true,
          },
        }));

        if (part === "background") {
          setBackgroundAssets((prev) =>
            prev.map((asset) =>
              normalizeImageKey(asset.image) === normalizedKey ? { ...asset, owned: true } : asset
            )
          );
        } else {
          setFrameAssets((prev) =>
            prev.map((asset) =>
              normalizeImageKey(asset.image) === normalizedKey ? { ...asset, owned: true } : asset
            )
          );
        }

        setParts((prev) => {
          const category = prev[part] ?? [];
          const updatedCategory = category.map((item) =>
            item.id === option.id ? { ...item, owned: true } : item
          );
          return {
            ...prev,
            [part]: updatedCategory,
          };
        });

        setPurchaseMessage(`${PART_LABELS[part] ?? part}を取得しました。`);
        setSelectedPartIds((prev) => ({ ...prev, [part]: option.id }));
        setUserPoint(remainingPoints);
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : `${PART_LABELS[part] ?? part}の取得に失敗しました。`;
        setPurchaseError(message);
        return false;
      } finally {
        setAcquiringTarget(null);
      }
    },
    [backgroundAssets, currentUserId, isUserLoading, normalizeImageKey, userPoint]
  );

  const handleOptionClick = useCallback(
    async (part: string, option: IconPart) => {
      if (!part) return;
      if (acquiringTarget && acquiringTarget.part === part && acquiringTarget.optionId === option.id) {
        return;
      }
      if (isPartOwned(part, option)) {
        setPurchaseError(null);
        setPurchaseMessage(null);
        handleSelect(part, option);
        return;
      }

      await acquirePart(part, option);
    },
    [acquirePart, acquiringTarget, handleSelect, isPartOwned]
  );

  const filteredIconParts = useMemo(() => {
    return Object.fromEntries(
      Object.entries(selectedPartIds).filter(([, value]) => typeof value === "number" && value > 0)
    ) as Record<string, number>;
  }, [selectedPartIds]);

  const selectionPayload = useMemo(() => {
    if (!currentUserId) {
      return null;
    }
    const numericUserId = Number(currentUserId);
    if (!Number.isFinite(numericUserId) || numericUserId <= 0) {
      return null;
    }

    return {
      user_id: numericUserId,
      icon_parts: filteredIconParts,
    };
  }, [currentUserId, filteredIconParts]);

  const hasSelection = useMemo(
    () => PART_ORDER.some((part) => Boolean(selectedPartIds[part])),
    [selectedPartIds]
  );

  const activePartLabel = useMemo(() => {
    if (!activePart) return "";
    return PART_LABELS[activePart] ?? activePart;
  }, [activePart]);

  const activeAssetList = useMemo(() => {
    if (!activePart) return [] as OwnedAsset[];
    if (activePart === "background") return backgroundAssets;
    return [] as OwnedAsset[];
  }, [activePart, backgroundAssets]);

  const getOptionCost = useCallback(
    (part: string, option: IconPart) => {
      if (part === "background") {
        const asset = backgroundAssets.find(
          (item) => normalizeImageKey(item.image) === normalizeImageKey(option.image)
        );
        return asset?.point ?? null;
      }
      return null;
    },
    [backgroundAssets, normalizeImageKey]
  );

  const activeSelectionCost = useMemo(() => {
    if (!activePart) return null;
    const selectedId = selectedPartIds[activePart];
    if (!selectedId) return null;
    const option = parts[activePart]?.find((item) => item.id === selectedId);
    if (!option) return null;
    return getOptionCost(activePart, option);
  }, [activePart, getOptionCost, parts, selectedPartIds]);

  const handleComplete = useCallback(async () => {
    setSaveError(null);
    const iconPartCount = Object.keys(filteredIconParts).length;
    if (iconPartCount === 0) {
      setSaveError("パーツを選択してください。");
      return;
    }

    // 未選択のカテゴリがあればユーザーに選択を促す
    const missingPart = PART_ORDER.find((part) => !Object.prototype.hasOwnProperty.call(filteredIconParts, part));
    if (missingPart) {
      const label = PART_LABELS[missingPart] ?? missingPart;
      setSaveError(`${label}を選択してください。`);
      setActivePart(missingPart);
      // 該当タブへスクロール＆フォーカスして入力を促す
      focusPartTab(missingPart);
      return;
    }

    if (!selectionPayload) {
      setSaveError("ユーザー情報が見つかりません。ログインしてください。");
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

      // 先に選択内容を保存してからアイコン生成APIを呼び出す
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
  }, [filteredIconParts, focusPartTab, router, selectionPayload]);

  const activeOptions = activePart ? parts[activePart] ?? [] : [];
  const activeSelectionId = activePart ? selectedPartIds[activePart] : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7ADAD5] to-[#89CFF0] flex flex-col">
      <header className="w-full flex justify-center py-6">
        <Link href="/home">
          <Image
            src="/images/emozy_logo.png"
            alt="emozy logo"
            width={140}
            height={140}
            className="hover:scale-105 transition-transform"
            priority
          />
        </Link>
      </header>

      <main className="flex-1 w-full flex justify-center px-4 pb-16">
        <div className="w-full max-w-4xl">
          <div className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl p-6 md:p-8 flex flex-col gap-8">
            <div className="flex flex-col items-center gap-6">
              <div className="text-center">
                {/* <h2 className="text-xl font-semibold text-gray-700">アイコンプレビュー</h2> */}
                {/* <p className="mt-1 text-sm text-gray-500">パーツを選ぶとここで確認できます</p> */}
              </div>
              <div className="relative w-52 h-52 flex items-center justify-center">
                <div className="relative w-44 h-44 rounded-full bg-white shadow-[0_15px_45px_rgba(122,218,213,0.35)] ring-4 ring-[#EAF4FF] overflow-hidden">
                  {hasSelection ? (
                    PART_ORDER.map((part, index) => {
                      const selectedId = selectedPartIds[part];
                      if (!selectedId) return null;
                      const matchedPart = parts[part]?.find((item) => item.id === selectedId);
                      if (!matchedPart) return null;
                      if (!isPartOwned(part, matchedPart)) return null;
                      const src = resolveImageSrc(matchedPart.image, matchedPart.updated_at);
                      return (
                        <div
                          key={`${part}-${selectedId}`}
                          className="absolute inset-0"
                          style={{ zIndex: index }}
                        >
                          <Image
                            src={src}
                            alt={PART_LABELS[part] ?? part}
                            fill
                            sizes="176px"
                            className="object-contain"
                          />
                        </div>
                      );
                    })
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-gray-400">
                      パーツを選択するとプレビューが表示されます
                    </div>
                  )}
                  {userFrameImageSrc && (
                    <Image
                      src={userFrameImageSrc}
                      alt="frame"
                      fill
                      sizes="176px"
                      className="object-contain pointer-events-none"
                    />
                  )}
                </div>
              </div>
              <div className="text-sm font-medium text-gray-600 bg-[#F4FBFB] px-5 py-2 rounded-full shadow-inner">
                {isUserLoading ? "ポイント読み込み中..." : `所持ポイント: ${formatPoint(userPoint)}`}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => scrollTabs("left")}
                  disabled={!canScrollLeft}
                  className={`h-10 w-10 rounded-full border transition ${
                    canScrollLeft
                      ? "border-[#7ADAD5] text-[#2A8881] bg-white hover:bg-[#E6F7F6]"
                      : "border-gray-200 text-gray-300 bg-gray-100 cursor-not-allowed"
                  }`}
                >
                  {"<"}
                </button>
                <div
                  ref={tabsRef}
                  className="flex gap-3 overflow-x-auto scroll-smooth py-1"
                >
                  {partKeys.map((key) => (
                    <button
                      key={key}
                      type="button"
                      ref={(el) => {
                        tabButtonRefs.current[key] = el;
                      }}
                      className={`whitespace-nowrap rounded-2xl px-5 py-2 text-sm font-semibold transition ${
                        activePart === key
                          ? "bg-[#7ADAD5] text-white shadow-md shadow-[#7ADAD5]/40"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
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
                  className={`h-10 w-10 rounded-full border transition ${
                    canScrollRight
                      ? "border-[#7ADAD5] text-[#2A8881] bg-white hover:bg-[#E6F7F6]"
                      : "border-gray-200 text-gray-300 bg-gray-100 cursor-not-allowed"
                  }`}
                >
                  {">"}
                </button>
              </div>

              {/* <div className="rounded-2xl bg-white border border-gray-100 shadow-inner px-5 py-4 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">{activePartLabel || "パーツ"}</p>
                    {/* <p className="text-xs text-gray-400">
                      {activeOptions.length > 0
                        ? `${activeOptions.length} 件のパーツが選択可能`
                        : "パーツ候補がありません"}
                    </p> */}
                  {/* </div> */}
                  {/* <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span className="bg-[#F0FBFA] text-[#268F86] font-semibold px-3 py-1 rounded-full">
                      {activeSelectionId ? "選択済み" : "未選択"}
                    </span>
                    {activeSelectionCost !== null && (
                      <span className="inline-flex items-center gap-1 bg-[#FFF2E2] text-[#C97A1E] font-medium px-3 py-1 rounded-full">
                        消費: {formatPoint(activeSelectionCost)}
                      </span>
                    )}
                    {activeAssetList.length > 0 && (
                      <span className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                        所持: {activeAssetList.filter((asset) => asset.owned).length}/{activeAssetList.length}
                      </span>
                    )}
                  </div> */}
                {/* </div> */}
              {/* </div> */}

              <div className="rounded-2xl bg-gray-50 p-4 min-h-[160px]">
                {isLoading && <p className="text-sm text-gray-500">パーツを読み込み中です...</p>}
                {!isLoading && error && (
                  <p className="text-sm text-red-500">読み込みに失敗しました: {error}</p>
                )}
                {!isLoading && !error && activeOptions.length === 0 && (
                  <p className="text-sm text-gray-500">表示できるパーツがありません。</p>
                )}
                {!isLoading && !error && activeOptions.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 justify-items-center">
                    {activeOptions.map((option) => {
                      const optionSrc = resolveImageSrc(option.image, option.updated_at);
                      const isSelected = activeSelectionId === option.id;
                      const isOwned = isPartOwned(activePart ?? "", option);
                      const isAcquiring =
                        acquiringTarget?.part === (activePart ?? "") && acquiringTarget?.optionId === option.id;
                      const optionCost = getOptionCost(activePart ?? "", option);
                      const optionClasses = [
                        "relative flex items-center justify-center rounded-2xl border-2 bg-gray-400 transition-all duration-150 h-20 w-20 sm:h-24 sm:w-24 overflow-hidden",
                        isSelected
                          ? "border-[#7ADAD5] shadow-lg shadow-[#7ADAD5]/20"
                          : "border-gray-200 hover:border-[#7ADAD5]/60 hover:-translate-y-1",
                        isOwned ? "cursor-pointer" : isAcquiring ? "cursor-wait opacity-70" : "cursor-not-allowed opacity-60",
                      ].join(" ");

                      return (
                        <div
                          key={option.id}
                          className={optionClasses}
                          onClick={() => {
                            if (isAcquiring) return;
                            void handleOptionClick(activePart ?? "", option);
                          }}
                        >
                          <Image
                            src={optionSrc}
                            alt={PART_LABELS[activePart ?? ""] ?? ""}
                            fill
                            sizes="96px"
                            className="object-contain p-2"
                          />
                          {!isOwned && (
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs font-semibold text-white drop-shadow-md">
                              {isAcquiring ? "購入中..." : "未所持"}
                            </div>
                          )}
                          {optionCost !== null && (
                            <div
                              className={`absolute bottom-1 left-1 right-1 rounded-xl text-[10px] font-semibold text-center py-1 px-2 ${
                                isOwned ? "bg-white/90 text-[#268F86]" : "bg-[#FFF2E2]/90 text-[#C97A1E]"
                              }`}
                            >
                              {isOwned ? `購入済み ${formatPoint(optionCost)}` : `購入 ${formatPoint(optionCost)}`}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">選択データ</h3>
                  <span className="text-xs text-gray-400">user_id: {selectionPayload.user_id}</span>
                </div>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap break-all">
                  {JSON.stringify(selectionPayload, null, 2)}
                </pre>
              </div> */}

              {purchaseMessage && (
                <p className="text-sm font-medium text-[#2f7a37] bg-[#E8F8EE] border border-[#a9e0b7] rounded-xl px-4 py-3">
                  {purchaseMessage}
                </p>
              )}
              {purchaseError && (
                <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {purchaseError}
                </p>
              )}
              {saveError && (
                <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {saveError}
                </p>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* <p className="text-sm text-gray-500">
                {isSaving ? "保存処理を実行しています..." : "アイコンが完成したら保存ボタンを押してください"}
              </p> */}
              <button
                type="button"
                disabled={isSaving}
                onClick={() => {
                  void handleComplete();
                }}
                className={`inline-flex items-center justify-center rounded-full px-8 py-3 text-lg font-bold text-white transition shadow-lg shadow-[#7ADAD5]/40 ${
                  isSaving
                    ? "bg-gray-300 cursor-not-allowed shadow-none"
                    : "bg-gradient-to-r from-[#7ADAD5] to-[#5CCCCC] hover:opacity-90"
                }`}
              >
                {isSaving ? "保存中..." : "きせかえ完了"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
