"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

export default function MakeProfilePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    // サインアップで受け取ったユーザーID・プロフィール入力値などのローカル状態
    const [userId, setUserId] = useState(() => searchParams.get('userId') ?? '');
    const [userName, setUserName] = useState('');
    const [profile, setProfile] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 端末に保存されたユーザーIDを初期表示に利用
    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        const storedId = window.localStorage.getItem('emozyUserId');
        if (storedId) {
            setUserId((current) => (current ? current : storedId));
        }
    }, []);

    // クエリパラメータに含まれるuserIdを初期化・更新
    useEffect(() => {
        const idFromQuery = searchParams.get('userId');
        if (idFromQuery) {
            setUserId((current) => (current === idFromQuery ? current : idFromQuery));
        }
    }, [searchParams]);

    // userIdを常に最新の状態で保存しておく
    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        if (userId) {
            try {
                window.localStorage.setItem('emozyUserId', userId);
            } catch (error) {
                console.warn('ユーザーIDの保存に失敗しました', error);
            }
        }
    }, [userId]);

    // プロフィール登録APIを呼び出し、成功時に/homeへ遷移
    const handleComplete = async () => {
        if (!userId.trim()) {
            alert('ユーザーIDが取得できませんでした。サインアップからやり直してください。');
            return;
        }
        if (!userName.trim()) {
            alert('名前を入力してください。');
            return;
        }
        if (!profile.trim()) {
            alert('プロフィールを入力してください。');
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            // APIに送信するプロフィールデータ
            const payload = {
                user: {
                    name: userName,
                    profile,
                },
            };

            // サーバーへPUTリクエストを送信
            const response = await fetch(`http://localhost:3333/api/v1/make/${encodeURIComponent(userId)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error('プロフィール更新失敗:', errorBody);
                throw new Error('プロフィールの更新に失敗しました。');
            }

            setMessage('プロフィールを保存しました！');
            router.push('/home');
        } catch (error) {
            console.error(error);
            setMessage('プロフィールの保存に失敗しました。時間をおいて再度お試しください。');
        } finally {
            setIsLoading(false);
        }
    };

    const dynamicStyles = `
    .form-input:focus {
      outline: none;
      border-color: #3db2a6;
      box-shadow: 0 0 0 3px rgba(61, 178, 166, 0.2);
    }
    .form-button:hover {
      background-color: #35a095;
    }
  `;

    return (
        <>
            <style>{dynamicStyles}</style>

            {/* Main container for layout */}
            <main style={styles.main}>
                {/* Emozy Logo, positioned top-left */}
                <Image
                    src="/images/emozy_rogo.png"
                    alt="Emozy ロゴ"
                    width={200}
                    height={67}
                    style={styles.logo}
                    priority
                />

                {/* Profile creation form */}
                <div style={styles.formContainer}>
                    <h1 style={styles.title}>
                       プロフィールを
                       <br></br>
                       作ってみよう！
                    </h1>

                    <form onSubmit={(e) => { e.preventDefault(); handleComplete(); }}>
                        {/* IDは自動で割り当て */}
                        {/* <div style={styles.inputGroup}>
                            <label htmlFor="userId" style={styles.label}>ID</label>
                            <input
                                type="text"
                                id="userId"
                                className="form-input"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                style={styles.input}
                            />
                        </div> */}

                        <div style={styles.inputGroup}>
                            <label htmlFor="userName" style={styles.label}>名前</label>
                            <input
                                type="text"
                                id="userName"
                                className="form-input"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                style={styles.input}
                                
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label htmlFor="profile" style={styles.label}>プロフィール</label>
                            <textarea
                                id="profile"
                                className="form-input"
                                value={profile}
                                onChange={(e) => setProfile(e.target.value)}
                                style={{ ...styles.input, height: '120px', resize: 'vertical' }}
                                
                            />
                        </div>

                        <button
                            type="submit"
                            className="form-button"
                            style={styles.button}
                            disabled={isLoading}
                        >
                            {isLoading ? '保存中...' : 'さあ、はじめよう！'}
                        </button>
                    </form>
                    {/* API結果に応じたフィードバックメッセージ */}
                    {message && (
                        <p style={{ marginTop: '1rem', textAlign: 'center', color: '#155724' }}>{message}</p>
                    )}
                </div>
            </main>
        </>
    );
}

// Style definitions
const styles: { [key: string]: React.CSSProperties } = {
    main: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#3db2a6',
        padding: '1rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        position: 'relative',
    },
    logo: {
        position: 'absolute',
        top: '2rem',
        left: '1rem', // [修正] さらに左に寄せる
    },
    formContainer: {
        backgroundColor: 'white',
        padding: '2rem 3rem',
        borderRadius: '16px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
        width: '100%',
        maxWidth: '480px',
    },
    title: {
        textAlign: 'center',
        marginBottom: '2.5rem',
        fontSize: '2rem',
        fontWeight: 600,
        color: '#2a2a2a',
    },
    inputGroup: {
        marginBottom: '1.5rem',
    },
    label: {
        display: 'block',
        marginBottom: '0.5rem',
        color: '#6c757d',
        fontWeight: 500,
        fontSize: '0.9rem',
    },
    input: {
        width: '100%',
        padding: '0.9rem 1rem',
        border: '1px solid #ced4da',
        borderRadius: '8px',
        fontSize: '1rem',
        boxSizing: 'border-box',
        backgroundColor: '#f8f9fa',
        color: '#343a40',
        transition: 'border-color 0.2s, box-shadow 0.2s',
    },
    button: {
        width: '100%',
        padding: '1rem',
        marginTop: '1rem',
        border: 'none',
        borderRadius: '8px',
        backgroundColor: '#3db2a6',
        color: 'white',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
};
