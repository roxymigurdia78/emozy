"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function MakeProfilePage() {
    const router = useRouter();
    const [userId, setUserId] = useState('');
    const [userName, setUserName] = useState('');
    const [profile, setProfile] = useState('');

    const handleComplete = () => {
        // This is where you would typically save the user's data
        console.log({ userId, userName, profile });
        router.push('/home');
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
                        Create Your Profile
                    </h1>

                    <form onSubmit={(e) => { e.preventDefault(); handleComplete(); }}>
                        <div style={styles.inputGroup}>
                            <label htmlFor="userId" style={styles.label}>ID</label>
                            <input
                                type="text"
                                id="userId"
                                className="form-input"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                style={styles.input}
                                placeholder="e.g. emozy_user_123"
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label htmlFor="userName" style={styles.label}>Name</label>
                            <input
                                type="text"
                                id="userName"
                                className="form-input"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                style={styles.input}
                                placeholder="e.g. Emozy Taro"
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label htmlFor="profile" style={styles.label}>Profile</label>
                            <textarea
                                id="profile"
                                className="form-input"
                                value={profile}
                                onChange={(e) => setProfile(e.target.value)}
                                style={{ ...styles.input, height: '120px', resize: 'vertical' }}
                                placeholder="Hello! I'm new here."
                            />
                        </div>

                        <button
                            type="submit"
                            className="form-button"
                            style={styles.button}
                        >
                            Complete
                        </button>
                    </form>
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
