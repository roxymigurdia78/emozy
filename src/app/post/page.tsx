"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./PostPage.module.css";
import Link from "next/link";
import Image from "next/image";


export default function PostPage() {
  const router = useRouter();

  const [postType, setPostType] = useState<"text" | "photo" | null>(null);
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [isEmotionOpen, setIsEmotionOpen] = useState(false);

  // 感情の候補（今後増減予定）
  const emotions = ["😀", "😂", "😢", "😡", "😍", "😎"];

  // 画像選択
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  // 感情の選択・解除
  const toggleSelectEmotion = (emoji: string) => {
    if (selectedEmotions.includes(emoji)) {
      setSelectedEmotions(selectedEmotions.filter(e => e !== emoji));
    } else if (selectedEmotions.length < 3) {
      setSelectedEmotions([...selectedEmotions, emoji]);
    }
  };

  // 投稿処理
  const handleSubmit = () => {
    if (postType === "text" && !text.trim()) {
      alert("テキストを入力してください");
      return;
    }
    if (postType === "photo" && !photo) {
      alert("写真を選択してください");
      return;
    }
    if (selectedEmotions.length === 0) {
      alert("感情を1つ以上選んでください");
      return;
    }

    // ここでAPIに送信する処理を入れる予定
    console.log({
      type: postType,
      text,
      photo,
      emotions: selectedEmotions,
    });

    // 投稿完了後に /home へ移動
    router.push("/home");
  };

  return(
    <>
        <header className={styles.header1}>
            <Link href="/home">
            <Image
                src="/images/title.png"
                alt="title"
                width={150}
                height={150}
                className={styles.logo}
            />
            </Link>
        </header>
    
    <div className={styles.container}>
        {/* 上部バー */}
        <div className="styles.header">
            <button onClick={() => router.push("/home")} className="text-xl">
                ×
            </button>
            <h1 className="text-lg font-bold">新規投稿</h1>
        </div>

        {/* 投稿タイプ選択 */}
        <div className="my-4 flex gap-4">
            <button
                className={`${styles.typeButton} ${
                    postType === "text" ? styles.typeButtonActive : ""
                }`}
                onClick={() => {
                    setPostType("text");
                    setPhoto(null);
                    setPreview(null);
                }}
            >
                テキスト
            </button>
            <button
                className={`${styles.typeButton} ${
                    postType === "photo" ? styles.typeButtonActive : ""
                }`}
                onClick={() => {
                    setPostType("photo");
                    setText("");
                }}
            >
                写真
            </button>
        </div>

        {/* 投稿内容 */}
        {postType === "text" && (
            <textarea
                className="w-full border p-2"
                rows={5}
                placeholder="ここに入力"
                value={text}
                onChange={(e) => setText(e.target.value)}
            />
        )}

        {postType === "photo" && (
            <div>
                <label className={styles.fileLabel}>
                    写真を選択
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        className = {styles.fileInput}
                    />
                </label>
                {preview ? 
                    (<img src={preview} alt="preview" className="mt-2 w-48 rounded" />)
                    : 
                    (<p className={styles.noFile}>写真が選択されていません</p>
                )}
            </div>
            
        )}

      {/* 感情選択 */}
      <div className="mt-6">
        <p>入れたい感情を1〜3つ入れてください</p>
        <div className="flex items-center gap-2 mt-2">
          {selectedEmotions.map((e) => (
            <span key={e} className="text-2xl">
              {e}
            </span>
          ))}
          <button
            onClick={() => setIsEmotionOpen(true)}
            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xl"
          >
            +
          </button>
        </div>
      </div>

      {/* 感情選択ポップアップ */}
      {isEmotionOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
          <div className="bg-white p-4 rounded shadow-lg">
            <h2 className="mb-2">感情を選択（最大3つ）</h2>
            <div className="flex flex-wrap gap-2">
              {emotions.map((e) => (
                <button
                  key={e}
                  onClick={() => toggleSelectEmotion(e)}
                  className={`text-2xl p-2 rounded ${
                    selectedEmotions.includes(e)
                      ? "bg-blue-200"
                      : "bg-gray-100"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
              onClick={() => setIsEmotionOpen(false)}
            >
              決定
            </button>
          </div>
        </div>
      )}

      {/* 投稿ボタン */}
      <button
        onClick={handleSubmit}
        className="mt-6 w-full bg-blue-500 text-white py-2 rounded"
      >
        シェアする
      </button>
    </div>
    </>
  );
}
