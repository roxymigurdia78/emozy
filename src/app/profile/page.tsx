"use client";
import Image from "next/image";
import Link from "next/link";
import Toukou from "../components/toukou";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type User = {
    id: number;
    name: string;
    email: string;
    profile: string;
    point: number;
    background_id: number;
    frame_id: number;
    password_digest: string;
    created_at: string;
    updated_at: string;
    icon_image_url?: string;
};

type FrameImageResponse = {
    image_url?: string;
};

export default function page() {
    const searchParams = useSearchParams();
    const [userId, setUserId] = useState<string>(() => searchParams.get("userId") ?? "");
    const [user, setUser] = useState<User | null>(null);
    const [post, setPost] = useState(null);
    const [frameImageUrl, setFrameImageUrl] = useState<string | null>(null);

    useEffect(() => {
        const idFromQuery = searchParams.get("userId");
        if (idFromQuery) {
            setUserId((current) => (current === idFromQuery ? current : idFromQuery));
        }
    }, [searchParams]);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        if (userId) {
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

    useEffect(() => {
        if (!userId) {
            setUser(null);
            setFrameImageUrl(null);
            return;
        }
        const numericUserId = Number(userId);
        if (!Number.isFinite(numericUserId) || numericUserId <= 0) {
            setUser(null);
            setFrameImageUrl(null);
            return;
        }

        const controller = new AbortController();
        const loadUser = async () => {
            try {
                const res = await fetch(`http://localhost:3333/api/v1/users/${encodeURIComponent(userId)}`, {
                    cache: "no-store",
                    signal: controller.signal,
                });
                if (!res.ok) {
                    throw new Error(`Failed to fetch user: ${res.status}`);
                }
                const data = (await res.json()) as User;
                setUser(data);
                if (data.frame_id) {
                    try {
                        const frameRes = await fetch(`http://localhost:3333/api/v1/frame_image/${encodeURIComponent(String(data.frame_id))}/image_url`, {
                            cache: "no-store",
                        });
                        if (frameRes.ok) {
                            const frameData = (await frameRes.json()) as FrameImageResponse;
                            setFrameImageUrl(typeof frameData.image_url === "string" ? frameData.image_url : null);
                        } else {
                            setFrameImageUrl(null);
                        }
                    } catch (error) {
                        console.warn("フレーム画像の取得に失敗しました", error);
                        setFrameImageUrl(null);
                    }
                } else {
                    setFrameImageUrl(null);
                }
            } catch (error) {
                if (controller.signal.aborted) {
                    return;
                }
                console.error("ユーザー情報の取得に失敗しました", error);
                setUser(null);
                setFrameImageUrl(null);
            }
        };

        void loadUser();
        return () => {
            controller.abort();
        };
    }, [userId]);

    useEffect(() => {
        if (!userId) {
            setPost(null);
            return;
        }
        const numericUserId = Number(userId);
        if (!Number.isFinite(numericUserId) || numericUserId <= 0) {
            setPost(null);
            return;
        }

        const controller = new AbortController();
        const loadPost = async () => {
            try {
                const res = await fetch(`http://localhost:3333/api/v1/posts/${encodeURIComponent(userId)}`, {
                    cache: "no-store",
                    signal: controller.signal,
                });
                if (!res.ok) {
                    throw new Error(`Failed to fetch post: ${res.status}`);
                }
                const data = await res.json();
                let reaction_ids: number[] = [];
                let reaction_counts: number[] = [];
                if (data.num_reactions) {
                    reaction_ids = Object.keys(data.num_reactions).map((id) => Number(id));
                    reaction_counts = Object.values(data.num_reactions);
                }
                setPost({
                    ...data,
                    reaction_ids,
                    reaction_counts,
                });
            } catch (error) {
                if (controller.signal.aborted) {
                    return;
                }
                console.error("投稿データの取得に失敗しました", error);
                setPost(null);
            }
        };

        void loadPost();
        return () => {
            controller.abort();
        };
    }, [userId]);

    return (
        <div>
            <div style={{ width: "100%", padding: "24px 0 8px 24px", fontWeight: "bold", fontSize: "30px", color: "#222", position: "relative" }}>
                {user ? user.name : "..."}
                <Link href="/setting">
                    <img
                        src="/images/settei.png"
                        alt="settings"
                        width={36}
                        height={36}
                        style={{ position: "absolute", top: 30, right: 24, cursor: "pointer" }}
                    />
                </Link>
            </div>
            <div style={{ display: "flex", alignItems: "center", paddingLeft: "24px", marginBottom: "35px", marginTop: "26px" }}>
                <div style={{ position: "relative", width: 128, height: 128 }}>
                    <Image
                        src={user && user.icon_image_url ? user.icon_image_url : "/images/syoki2.png"}
                        alt="profile icon"
                        fill
                        sizes="128px"
                        style={{ borderRadius: "50%", border: "3px solid #eee", objectFit: "cover" }}
                        priority
                    />
                    {frameImageUrl && (
                        <Image
                            src={frameImageUrl}
                            alt="profile frame"
                            fill
                            sizes="128px"
                            style={{ objectFit: "contain", pointerEvents: "none" }}
                            priority
                        />
                    )}
                </div>
                {/* <div style={{ marginLeft: "32px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <span style={{ fontWeight: "bold", fontSize: "20px", color: "#222" }}>
                        {user ? user.name : "..."}
                    </span>
                </div> */}
            </div>
            {/* プロフィール（自己紹介文）追加 */}
            <div style={{ paddingLeft: "23px", paddingRight: "24px", marginBottom: "10px", color: "#333", fontSize: "17px" }}>
                {user ? user.profile : "..."}
            </div>

            <main style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "0" }}>
                {post && <Toukou post={post} />}
            </main>

            <footer style={{
                backgroundColor: "#f3f2f2ac",
                height: "75px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                position: "fixed",
                bottom: "0",
                width: "100%",
                padding: "0 32px"
            }}>
                <Link href="/home" style={{ display: "flex", alignItems: "flex-end", height: "100px", flexShrink: 0, flexGrow: 0 }}>
                    <Image
                        src="/images/homeicon.png"
                        alt="homeicon"
                        width={60}
                        height={60}
                        style={{ marginLeft: "-30px", marginTop: "10px", marginBottom: "15px", marginRight: "3px", minWidth: "65px", minHeight: "65px" }}
                    />
                </Link>
                <Link href="/ranking" style={{ display: "flex", alignItems: "flex-end", height: "100px", flexShrink: 0, flexGrow: 0 }}>
                    <Image
                        src="/images/rankingicon.png"
                        alt="rankingicon"
                        width={60}
                        height={60}
                        style={{ marginLeft: "0px", marginTop: "10px", marginBottom: "15px", marginRight: "0px", minWidth: "65px", minHeight: "65px" }}
                    />
                </Link>
                <Link href="post" style={{ display: "flex", alignItems: "flex-end", height: "100px", flexShrink: 0, flexGrow: 0 }}>
                    <Image
                        src="/images/toukouicon.png"
                        alt="posticon"
                        width={60}
                        height={60}
                        style={{ marginLeft: "0px", marginTop: "10px", marginBottom: "19px", marginRight: "0px", minWidth: "65px", minHeight: "65px" }}
                    />
                </Link>
                <Link href="/search" style={{ display: "flex", alignItems: "flex-end", height: "100px", flexShrink: 0, flexGrow: 0 }}>
                    <Image
                        src="/images/searchicon.png"
                        alt="searchicon"
                        width={60}
                        height={60}
                        style={{ marginLeft: "0px", marginTop: "10px", marginBottom: "22px", marginRight: "-5px", minWidth: "65px", minHeight: "65px" }}
                    />
                </Link>
                <Link href="/profile" style={{ display: "flex", alignItems: "flex-end", height: "100px", flexShrink: 0, flexGrow: 0 }}>
                    <Image
                        src="/images/toukouicon.png"
                        alt="profileicon"
                        width={60}
                        height={60}
                        style={{ marginLeft: "-8px", marginTop: "10px", marginBottom: "19px", marginRight: "-24px", minWidth: "65px", minHeight: "65px" }}
                    />
                </Link>
            </footer>
        </div>
    );
}
