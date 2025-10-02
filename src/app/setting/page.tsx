"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

const emojis = [
    "😎", "😭", "😃", "😤", "🤣", "😩", "☹️", "😊", "😜", "😡", "😆", "😘"
];

type Bubble = {
    emoji: string;
    left: number;
    top: number;
    size: number;
    opacity: number;
    id: number;
};

export default function SettingPage() {
    const [bubbles, setBubbles] = useState<Bubble[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() < 0.3) {
                setBubbles(prev => {
                    const newBubble: Bubble = {
                        emoji: emojis[Math.floor(Math.random() * emojis.length)],
                        left: Math.random() * 100,
                        top: Math.random() * 100,
                        size: 20 + Math.random() * 20,
                        opacity: 0.2 + Math.random() * 0.3,
                        id: Date.now() + Math.random()
                    };
                return [...prev, newBubble].slice(-30);
                });
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#7ADAD5] p-6 relative overflow-hidden">
        {bubbles.map(bubble => (
            <span
                key={bubble.id}
                className="absolute text-2xl"
                style={{
                    left: `${bubble.left}%`,
                    top: `${bubble.top}%`,
                    fontSize: `${bubble.size}px`,
                    opacity: bubble.opacity,
                    animation: `floatUp 8s linear forwards`
                }}
            >
                {bubble.emoji}
            </span>
        ))}

        <div className="w-full flex justify-start absolute top-6 left-6 z-10">
            <Link href="/home">
                <button className="text-black text-2xl font-bold hover:text-red-500 transition-colors">×</button>
            </Link>
        </div>

        <div className="mb-8 flex flex-col items-center z-10">
            <Image
                src="/images/emozy_logo.png"
                alt="Emozy Logo"
                width={100}
                height={100}
                className="mb-4"
            />
            <h1 className="text-2xl font-bold text-white mb-4">設定</h1>
        </div>

        <div className="w-full max-w-sm flex flex-col space-y-3 z-10">
            <Link href="/favorite">
                <button className="w-full bg-white text-black text-lg py-5 rounded-xl shadow-md transition hover:bg-[#6ac5c0]">
                    お気に入り
                </button>
            </Link>

            <Link href="/make">
                <button className="w-full bg-white text-black text-lg py-5 rounded-xl shadow-md transition hover:bg-[#6ac5c0]">
                    名前・プロフィール設定
                </button>
            </Link>

            <Link href="/explanation">
                <button className="w-full bg-red-400 text-white text-lg py-5 rounded-xl shadow-md transition hover:bg-red-500">
                    ログアウト
                </button>
            </Link>
        </div>

        <style jsx>{`
            @keyframes floatUp {
                0% {
                    transform: translateY(0);
                    opacity: var(--opacity-start);
                }
                100% {
                    transform: translateY(-300px);
                    opacity: 0;
                }
            }
      ` }</style>
        </div>
);
}
