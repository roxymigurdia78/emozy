"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * 前提:
 * - TailwindCSS が設定されていること
 * - 画像は public/images/ に置く
 *   - /images/sample1.jpg  (フレーム画像サンプル)
 *   - /images/iconmaker.png (アイコンメーカー)
 */

type Item = {
  id: string;
  name: string;
  image: string;
  cost: number;
  type: "icon" | "frame" | "other";
  desc: string;
};

const initialItems: Item[] = [
  {
    id: "iconmaker",
    name: "アイコンメーカー",
    image: "/images/iconmaker.png",
    cost: 120,
    type: "icon",
    desc: "自分だけのアイコンを作れるメーカー。即時交換で使用可能。",
  },
  {
    id: "frame1",
    name: "フレームA",
    image: "/images/sample1.jpg",
    cost: 80,
    type: "frame",
    desc: "シンプルで使いやすいフレーム（A）。投稿に利用できます。",
  },
  {
    id: "frame2",
    name: "フレームB",
    image: "/images/sample1.jpg",
    cost: 90,
    type: "frame",
    desc: "ちょっと華やかなフレーム（B）。",
  },
  {
    id: "frame3",
    name: "フレームC",
    image: "/images/sample1.jpg",
    cost: 100,
    type: "frame",
    desc: "目立ちやすいフレーム（C）。特別な投稿向け。",
  },
];

export default function ExchangePage() {
  const [points, setPoints] = useState<number>(200); // 初期ポイント
  const [items, setItems] = useState<Item[]>(initialItems);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [claimedToday, setClaimedToday] = useState<boolean>(false);

  // localStorage から読み込み（ポイントと当日受取）
  useEffect(() => {
    try {
      const p = localStorage.getItem("emozy_points");
      const c = localStorage.getItem("emozy_claimed_date");
      if (p) setPoints(Number(p));
      if (c) {
        const today = new Date().toISOString().slice(0, 10);
        setClaimedToday(c === today);
      }
    } catch (e) {
      /* ignore */
    }
  }, []);

  // ポイント保存
  useEffect(() => {
    try {
      localStorage.setItem("emozy_points", String(points));
    } catch (e) {}
  }, [points]);

  function claimDaily() {
    const today = new Date().toISOString().slice(0, 10);
    const claimed = localStorage.getItem("emozy_claimed_date");
    if (claimed === today) {
      alert("本日の受け取りは既に完了しています。");
      setClaimedToday(true);
      return;
    }
    const give = 10; // 毎日付与ポイント
    setPoints((prev) => prev + give);
    localStorage.setItem("emozy_claimed_date", today);
    setClaimedToday(true);
    alert(`${give}ポイントを受け取りました！`);
  }

  function purchaseSelected() {
    if (!selectedId) {
      alert("購入する商品を選択してください。");
      return;
    }
    const item = items.find((i) => i.id === selectedId)!;
    if (points < item.cost) {
      alert("ポイントが足りません。");
      return;
    }
    setPoints((prev) => prev - item.cost);
    alert(`${item.name} を交換しました！`);
  }

  const selectedItem = items.find((i) => i.id === selectedId) ?? null;

  return (
    <div className="min-h-screen bg-[#7ADAD5] flex flex-col items-center p-4">
      <div className="w-full max-w-xl relative">
        {/* 左上：閉じるボタン */}
        <div className="absolute left-0 top-0 m-3">
          <Link href="/home">
            <button className="px-3 py-2 rounded-lg text-sm font-medium shadow-sm border border-white bg-white/20 backdrop-blur-sm text-white hover:bg-white/30">
              ×
            </button>
          </Link>
        </div>

        {/* 右上：一日一回受取 */}
        <div className="absolute right-0 top-0 m-3">
          <button
            onClick={claimDaily}
            className={`px-3 py-2 rounded-lg text-sm font-medium shadow-sm border border-white bg-white/20 backdrop-blur-sm text-white ${
              claimedToday ? "opacity-60" : "hover:bg-white/30"
            }`}
            aria-pressed={claimedToday}
          >
            一日一回受取
          </button>
        </div>

        {/* 中央：ポイント表示 */}
        <div className="w-full flex justify-center items-center py-4">
          <div className="bg-white/90 px-4 py-2 rounded-full shadow-md text-center">
            <div className="text-xs text-gray-600">所持ポイント</div>
            <div className="text-lg font-bold text-gray-900">{points}pt</div>
          </div>
        </div>
      </div>

      {/* メイン領域 */}
      <main className="w-full max-w-xl flex-1 flex flex-col items-center">
        <div className="w-full grid grid-cols-2 gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className={`relative bg-white/90 rounded-2xl p-3 flex flex-col items-center justify-between cursor-pointer shadow-md transition transform ${
                selectedId === item.id
                  ? "ring-4 ring-white/60 scale-100"
                  : "hover:scale-[1.01]"
              }`}
            >
              {/* 画像 */}
              <div className="w-full h-36 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={400}
                  height={400}
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="w-full mt-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-gray-800">{item.name}</div>
                  <div className="text-xs text-gray-500">
                    {item.type === "frame" ? "フレーム" : "アイテム"}
                  </div>
                </div>
                <div className="text-sm font-bold text-gray-800">{item.cost}pt</div>
              </div>

              {/* 選択マーク */}
              <div className="absolute right-3 top-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    selectedId === item.id
                      ? "bg-white text-[#7ADAD5]"
                      : "bg-white/80 text-gray-400"
                  }`}
                >
                  {selectedId === item.id ? "✓" : "+"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* フッター */}
      <footer className="w-full max-w-xl flex items-center justify-between gap-3 mt-4">
        {/* 説明枠 */}
        <div className="flex-1 bg-white/90 rounded-xl p-3 shadow-inner min-h-[64px]">
          {selectedItem ? (
            <>
              <div className="text-sm font-medium text-gray-800">{selectedItem.name}</div>
              <div className="text-xs text-gray-600 mt-1">{selectedItem.desc}</div>
              <div className="text-xs text-gray-500 mt-2">{selectedItem.cost} pt</div>
            </>
          ) : (
            <div className="text-xs text-gray-600">
              商品を選択するとここに説明が表示されます
            </div>
          )}
        </div>

        {/* 購入ボタン */}
        <div className="w-32">
          <button
            onClick={purchaseSelected}
            className="w-full h-full bg-red-400 hover:bg-red-500 text-white font-semibold rounded-xl py-3 shadow-md"
          >
            購入する
          </button>
        </div>
      </footer>

      {/* 下部余白 */}
      <div className="h-6" />
    </div>
  );
}
