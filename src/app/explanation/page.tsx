"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const animationStyle = `
  @keyframes flow-diagonal {
    from {
      transform: translate(0, 0);
      opacity: 0;
    }
    to {
      transform: translate(calc(100vw + 200px), calc(100vh + 200px));
      opacity: 1;
    }
  }
`;

const EMOJIS = ['😢', '😊', '😄', '😔', '😠', '😮', '😌', '✨', '😎', '😏', '🥰', '😮‍💨', '☺️', '😤', '😑'];
const NUM_EMOJIS = 40;

type FlowingEmoji = {
    id: number;
    emoji: string;
    style: React.CSSProperties;
};

export default function Home() {
    const [flowingEmojis, setFlowingEmojis] = useState<FlowingEmoji[]>([]);

    useEffect(() => {
        const generatedEmojis: FlowingEmoji[] = Array.from({ length: NUM_EMOJIS }).map((_, i) => {
            const isFromTop = i < NUM_EMOJIS / 2;

            return {
                id: i,
                emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
                style: {
                    position: 'absolute',
                    top: isFromTop ? `${-Math.random() * 10}%` : `${Math.random() * 100}%`,
                    left: isFromTop ? `${Math.random() * 100}%` : `${-Math.random() * 10}%`,
                    fontSize: `${Math.random() * 2 + 1}rem`,
                    // [修正]末尾に `backwards` を追加
                    animation: `flow-diagonal ${Math.random() * 10 + 15}s linear ${Math.random() * 10}s infinite backwards`,
                },
            };
        });
        setFlowingEmojis(generatedEmojis);
    }, []);

    return (
        <>
            <style>{animationStyle}</style>

            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                    zIndex: 0,
                    backgroundColor: '#3db2a6',
                }}
            >
                {flowingEmojis.map(({ id, emoji, style }) => (
                    <span key={id} style={style}>
                        {emoji}
                    </span>
                ))}
            </div>

            <main
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    gap: '2rem',
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                <Image
                    src="/images/emozy_rogo.png" // imagesフォルダの中なので、パスに追加
                    alt="Emozyロゴ"
                    width={400}
                    height={150}
                    priority
                />


                <Link
                    href="/signin"
                    style={{
                        color: 'white',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        textDecoration: 'underline',
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                    }}
                >
                    さあ始めよう！
                </Link>
            </main>
        </>
    );
}