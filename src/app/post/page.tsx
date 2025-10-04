"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./PostPage.module.css";
import Link from "next/link";
import Image from "next/image";

export default function PostPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [userId, setUserId] = useState(() => searchParams.get("userId") ?? "");
  const [postType, setPostType] = useState<"text" | "photo" | null>(null);
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [isEmotionOpen, setIsEmotionOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shouldUseAiCheck, setShouldUseAiCheck] = useState(true);
  const [pendingContent, setPendingContent] = useState("");
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  useEffect(() => {
    const idFromQuery = searchParams.get("userId");
    if (idFromQuery) {
      setUserId((current) => (current === idFromQuery ? current : idFromQuery));
    }
  }, [searchParams]);

  useEffect(() => {
    if (userId) {
      return;
    }
    if (typeof window === "undefined") {
      return;
    }
    const storedId = window.localStorage.getItem("emozyUserId");
    if (storedId) {
      setUserId(storedId);
    }
  }, [userId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (userId) {
      try {
        window.localStorage.setItem("emozyUserId", userId);
      } catch (error) {
        console.warn("ユーザーIDの保存に失敗しました", error);
      }
    }
  }, [userId]);

  // 感情の候補（ID順）
  const emotions = [
    "😎", // 1
    "😭", // 2
    "😃", // 3
    "😤", // 4
    "🤣", // 5
    "😩", // 6
    "☹️", // 7
    "😊", // 8
    "😜", // 9
    "😡", // 10
    "😆", // 11
    "😘", // 12
  ];

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
      setSelectedEmotions(selectedEmotions.filter((e) => e !== emoji));
    } else if (selectedEmotions.length < 3) {
      setSelectedEmotions([...selectedEmotions, emoji]);
    }
  };

  // 投稿処理
  const handleSubmit = () => {
    if (!postType) {
      alert("テキスト投稿か写真投稿のどちらかを選択してください");
      return;
    }
    if (postType === "text" && !text.trim()) {
      alert("テキストを入力してください");
      return;
    }
    if (postType === "photo" && !photo) {
      alert("写真を選択してください");
      return;
    }
    if (selectedEmotions.length === 0) {
      alert("感情を1つ以上3つ以下で選んでください");
      return;
    }

    if (!userId) {
      alert("ユーザー情報が見つかりません。ログインし直してください。");
      router.push("/signin");
      return;
    }

    const numericUserId = Number(userId);
    if (Number.isNaN(numericUserId)) {
      alert("ユーザーIDが正しく取得できませんでした。再度ログインしてください。");
      router.push("/signin");
      return;
    }

    // 画像をbase64化する関数
    const toBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    const postData = async () => {
      type PostBody = {
        post: {
          user_id: number;
          topic_id: number;
          content: string;
          image?: string;
          reaction_ids: number[];
        };
      };

      let imageBase64 = "";
      if (postType === "photo" && photo) {
        imageBase64 = await toBase64(photo);
      }

      // selectedEmotionsからreaction_idsを生成
      const reaction_ids = selectedEmotions.map((emoji) => emotions.indexOf(emoji) + 1);
      const body: PostBody = {
        post: {
          user_id: numericUserId,
          topic_id: 1, // TODO: トピック選択が実装されたら置き換え
          content: text,
          reaction_ids,
        },
      };
      if (imageBase64) {
        body.post.image = imageBase64;
      }
      const rawText = text;
      const contentPreview =
        postType === "text"
          ? rawText
          : rawText || (photo ? "写真を確認中です" : "");

      let shouldResetSubmitState = true;
      try {
        setIsSubmitting(true);
        setSubmitMessage(shouldUseAiCheck ? "確認中..." : "投稿送信中...");
        console.log("送信するJSON:", JSON.stringify(body));

        // 投稿内容が通報対象でないことを確認するAPIに送信
        //{
        //   "report": {
        //     "content": "こんにちは"
        //   }
        // }
        const report_body = {
          report: {
            content: postType === "text" ? text : text,
          },
        };
        if (shouldUseAiCheck) {
          const reportRes = await fetch("http://localhost:3333/api/v1/report", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(report_body),
          });
          const reportData = await reportRes.json();
          console.log("報告APIのレスポンス:", reportData);
          if (!reportRes.ok) {
            throw new Error("投稿に失敗しました");
          }
          const isReported =
            (reportData?.report && reportData.report.is_report) ||
            reportData?.is_report;
          if (isReported) {
            setPendingContent(
              rawText.trim() ? rawText : contentPreview || "投稿内容は空です"
            );
            const reportMessage =
              (reportData?.report && reportData.report.response) ||
              reportData?.response ||
              "投稿内容が不適切です";
            setSubmitMessage(reportMessage);
            setIsSubmitting(false);
            shouldResetSubmitState = false;
            return;
          }
        }
        const res = await fetch("http://localhost:3333/api/v1/posts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          throw new Error("投稿失敗");
        }
        router.push(`/home?refresh=${Date.now()}`);
      } catch (err) {
        setSubmitMessage("投稿に失敗しました");
        setIsSubmitting(false);
        shouldResetSubmitState = false;
        console.error(err);
      } finally {
        if (shouldResetSubmitState) {
          setIsSubmitting(false);
          setSubmitMessage(null);
          setPendingContent("");
        }
      }
    };
    postData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7ADAD5] to-[#89CFF0] flex flex-col justify-center items-center">
      {/* ヘッダー */}
      <header className="w-full flex justify-center py-6">
        <Link href="/home">
          <Image
            src="/images/emozy_logo.png"
            alt="title"
            width={150}
            height={150}
            className="hover:scale-105 transition-transform"
          />
        </Link>
      </header>

      {/* 投稿カード */}
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md mx-auto">
        {/* 上部バー */}
        <div className="relative mb-4 flex items-center justify-center">
          <button
            onClick={() => router.push(`/home?refresh=${Date.now()}`)}
            className="absolute left-0 text-2xl font-bold text-gray-500 hover:text-gray-800"
          >
            ×
          </button>
          <h1 className="text-lg font-bold">新規投稿</h1>
        </div>

        {/* 投稿タイプ選択 */}
        <div className="my-4 flex gap-4">
          <button
            className={`flex-1 py-2 rounded-lg font-semibold transition ${
              postType === "text"
                ? "bg-[#7ADAD5] text-white shadow-md"
                : "bg-gray-100 hover:bg-gray-200"
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
            className={`flex-1 py-2 rounded-lg font-semibold transition ${
              postType === "photo"
                ? "bg-[#7ADAD5] text-white shadow-md"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={() => {
              setPostType("photo");
              setText("");
              setShouldUseAiCheck(false);
            }}
          >
            写真
          </button>
        </div>

        {/* 投稿内容 */}
        {postType === "text" && (
          <textarea
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-[#7ADAD5] focus:outline-none"
            rows={5}
            placeholder="ここに入力..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        )}

        {postType === "photo" && (
          <div>
            <label className="block text-center py-3 border rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              写真を選択
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {preview ? (
              <Image
                src={preview}
                alt="preview"
                width={400}
                height={300}
                className="mt-3 w-full rounded-lg shadow-md object-cover"
              />
            ) : (
              <p className="text-center text-sm text-gray-500 mt-2">
                写真が選択されていません
              </p>
            )}
          </div>
        )}

        {/* 感情選択 */}
        <div className="mt-6">
          <p className="text-sm text-gray-600">
            入れたい感情を1〜3つ選んでください
          </p>
          <div className="flex items-center gap-2 mt-2">
            {selectedEmotions.map((e) => (
              <span key={e} className="text-2xl">
                {e}
              </span>
            ))}
            <button
              onClick={() => setIsEmotionOpen(true)}
              className="w-8 h-8 rounded-full bg-[#7ADAD5] text-white flex items-center justify-center hover:scale-105 transition"
            >
              +
            </button>
          </div>
        </div>

        {/* 投稿ボタン */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`mt-6 w-full bg-gradient-to-r from-[#7ADAD5] to-[#5CCCCC] text-white py-3 rounded-lg font-bold shadow-md transition ${
            isSubmitting ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"
          }`}
        >
          シェアする
        </button>
      </div>

      {/* 感情選択ポップアップ */}
      {isEmotionOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full">
            <h2 className="mb-3 text-lg font-semibold text-center">
              感情を選択（最大3つ）
            </h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {emotions.map((e) => (
                <button
                  key={e}
                  onClick={() => toggleSelectEmotion(e)}
                  className={`text-3xl p-3 rounded-lg transition ${
                    selectedEmotions.includes(e)
                      ? "bg-[#7ADAD5] text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
            <button
              className="mt-5 w-full py-2 bg-[#7ADAD5] text-white rounded-lg font-bold hover:opacity-90 transition"
              onClick={() => setIsEmotionOpen(false)}
            >
              決定
            </button>
          </div>
        </div>
      )}

      {submitMessage && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#7ADAD5]/80 to-[#89CFF0]/80">
          <div className="bg-white px-8 py-6 rounded-2xl shadow-xl flex flex-col items-center gap-4 max-w-md w-full">
            {pendingContent && (
              <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-left">
                <p className="text-sm font-semibold text-gray-600 mb-1">
                  投稿内容
                </p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                  {pendingContent}
                </p>
              </div>
            )}
            <p className="text-lg font-semibold text-gray-700 text-center whitespace-pre-line">
              {submitMessage}
            </p>
            {isSubmitting ? (
              <div
                className={`relative w-64 h-3 bg-gray-200 rounded-full overflow-hidden ${styles.progressTrack}`}
              >
                <div className={styles.progressIndicator} />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSubmitMessage(null);
                  setPendingContent("");
                }}
                className="px-6 py-2 bg-[#7ADAD5] text-white rounded-full font-semibold hover:opacity-90 transition"
              >
                閉じる
              </button>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setShouldUseAiCheck((prev) => !prev)}
        aria-pressed={shouldUseAiCheck}
        className={`fixed bottom-6 right-6 z-40 px-5 py-3 rounded-full shadow-lg text-sm font-semibold transition-transform duration-200 hover:scale-105 ${
          shouldUseAiCheck
            ? "bg-[#7ADAD5] text-white"
            : "bg-white/90 text-[#236066] border border-[#7ADAD5]"
        }`}
      >
        {shouldUseAiCheck ? "AI確認オン" : "AIで確認する"}
      </button>
    </div>
  );
}
