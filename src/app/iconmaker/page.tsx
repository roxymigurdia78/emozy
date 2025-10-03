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
const DEFAULT_USER_ID = 14; // 仮のユーザーID（APIリクエストで使用）

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

// 画像URLを生成する関数。updatedAt が指定されていればキャッシュ回避用クエリを付与する
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

export default function Page() {
  const router = useRouter();
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
  // パーツ取得中のターゲット（二重押下防止）
  const [acquiringTarget, setAcquiringTarget] = useState<{ part: string; optionId: number } | null>(null);
  // 取得処理に関するステータスメッセージ
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  // ユーザーの所持ポイント
  const [userPoint, setUserPoint] = useState<number | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(false);

  const normalizeImageKey = useCallback((imagePath: string) => {
    if (!imagePath) return "";
    return imagePath
      .replace(/^rails\/?public\/?/i, "")
      .replace(/^public\/?/i, "")
      .replace(/^\//, "");
  }, []);

  useEffect(() => {
    const fetchIconParts = async () => {
      setIsLoading(true);
      setError(null);
      setPurchaseMessage(null);
      setPurchaseError(null);
      setAcquiringTarget(null);
      try {
        // 取得時にキャッシュを無効化し、追加された最新パーツが即時反映されるようにする
        const response = await fetch(`${ICON_PARTS_ENDPOINT}?user_id=${DEFAULT_USER_ID}`, {
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
          applyOwnership(data.background_images, "background");
          applyOwnership(data.frame_images, "frame");
          if (data.icon_parts.background) {
            data.icon_parts.background = data.icon_parts.background.map((item) => ({
              ...item,
              owned: ownedEntries.background?.[normalizeImageKey(item.image)] ?? item.owned,
            }));
          }
          if (data.icon_parts.frame) {
            data.icon_parts.frame = data.icon_parts.frame.map((item) => ({
              ...item,
              owned: ownedEntries.frame?.[normalizeImageKey(item.image)] ?? item.owned,
            }));
          }
          setOwnershipMap(ownedEntries);
          // APIレスポンスのパーツ一覧を保持（所持情報を付与した後のデータ）
          setParts(data.icon_parts);
          // 既存の選択状態をクリアする（初期表示では空）
          setSelectedPartIds({});
          const keys = Object.keys(data.icon_parts);
          if (keys.length > 0) {
            // 最初のカテゴリを選択状態にする
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
  }, [normalizeImageKey]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsUserLoading(true);
      try {
        const response = await fetch(`${USER_ENDPOINT}/${DEFAULT_USER_ID}`, {
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
  }, []);

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
      setActivePart(partKeys[0]);
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

  // 背景パーツの取得APIを叩き、成功した場合は所持情報を更新
  const acquirePart = useCallback(
    async (part: string, option: IconPart) => {
      if (!part) return false;
      setPurchaseError(null);
      setPurchaseMessage(null);
      if (part !== "background") {
        setPurchaseError("このパーツは購入に対応していません。");
        return false;
      }

      const normalizedKey = normalizeImageKey(option.image);
      if (!normalizedKey) {
        setPurchaseError("購入対象の画像パスが不正です。");
        return false;
      }

      const targetAsset = backgroundAssets.find(
        (asset) => normalizeImageKey(asset.image) === normalizedKey
      );
      if (!targetAsset) {
        setPurchaseError("該当する背景アイテムが見つかりません。");
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
        const response = await fetch(BACKGROUND_ACQUIRE_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: DEFAULT_USER_ID,
            background_image_id: targetAsset.id,
          }),
        });

        if (!response.ok) {
          let message = `背景を取得できませんでした: ${response.status}`;
          try {
            const errorJson = await response.json();
            if (typeof errorJson?.message === "string") {
              message = errorJson.message;
            }
          } catch {
            const text = await response.text();
            if (text) {
              message = text;
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

        setBackgroundAssets((prev) =>
          prev.map((asset) =>
            normalizeImageKey(asset.image) === normalizedKey ? { ...asset, owned: true } : asset
          )
        );

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
        const message = err instanceof Error ? err.message : "背景の取得に失敗しました。";
        setPurchaseError(message);
        return false;
      } finally {
        setAcquiringTarget(null);
      }
    },
    [backgroundAssets, isUserLoading, normalizeImageKey, userPoint]
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

  const selectionPayload = useMemo(() => {
    // 選択済みIDのみを抽出してpayloadを構築する
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

    // 未選択のカテゴリがあればユーザーに選択を促す
    const missingPart = PART_ORDER.find((part) => !Object.prototype.hasOwnProperty.call(selectionPayload.icon_parts, part));
    if (missingPart) {
      const label = PART_LABELS[missingPart] ?? missingPart;
      setSaveError(`${label}を選択してください。`);
      setActivePart(missingPart);
      // 該当タブへスクロール＆フォーカスして入力を促す
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
  }, [focusPartTab, router, selectionPayload]);

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
                if (!isPartOwned(part, matchedPart)) return null;
                const src = resolveImageSrc(matchedPart.image, matchedPart.updated_at);
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
                const optionSrc = resolveImageSrc(option.image, option.updated_at);
                const isSelected = activeSelectionId === option.id;
                const isOwned = isPartOwned(activePart ?? "", option);
                const isAcquiring =
                  acquiringTarget?.part === (activePart ?? "") && acquiringTarget?.optionId === option.id;
                const disabledStyle = !isOwned
                  ? {
                      filter: "grayscale(100%)",
                      opacity: 0.5,
                      cursor: isAcquiring ? ("wait" as const) : ("not-allowed" as const),
                    }
                  : {};
                const clickHandler = () => {
                  if (isAcquiring) return;
                  void handleOptionClick(activePart ?? "", option);
                };
                return (
                  <div
                    key={option.id}
                    style={{
                      position: "relative",
                      cursor: isOwned ? "pointer" : isAcquiring ? "wait" : "not-allowed",
                    }}
                    onClick={clickHandler}
                  >
                    <Image
                      key={`${option.id}-img`}
                      src={optionSrc}
                      alt={PART_LABELS[activePart ?? ""] ?? ""}
                      width={72}
                      height={72}
                      style={{
                        border: isSelected ? "3px solid #4a90e2" : "2px solid #eee",
                        borderRadius: "18px",
                        background: "#fafafa",
                        boxShadow: isSelected ? "0 2px 8px #b3d8ff" : "0 1px 4px #eee",
                        transition: "all 0.2s",
                        ...disabledStyle,
                      }}
                    />
                    {!isOwned && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontSize: "12px",
                          fontWeight: "bold",
                          background: "rgba(0,0,0,0.35)",
                          borderRadius: "18px",
                          pointerEvents: "none",
                        }}
                      >
                        {isAcquiring ? "購入中..." : "未所持"}
                      </div>
                    )}
                  </div>
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
          {purchaseMessage && (
            <p style={{ color: "#2f7a37", marginTop: "12px" }}>{purchaseMessage}</p>
          )}
          {purchaseError && (
            <p style={{ color: "#d9534f", marginTop: "8px" }}>{purchaseError}</p>
          )}
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
