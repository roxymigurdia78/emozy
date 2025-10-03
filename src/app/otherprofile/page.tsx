"use client";
import Image from "next/image";
import Link from "next/link";
import Toukou from "../components/toukou";
import { useEffect, useState } from "react";

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
};

export default function page() {
    const [user, setUser] = useState<User | null>(null);
        const [post, setPost] = useState(null);
            useEffect(() => {
                fetch("http://localhost:3333/api/v1/users/10")
                    .then((res) => res.json())
                    .then((data) => setUser(data));
                fetch("http://localhost:3333/api/v1/posts/1")
                    .then((res) => res.json())
                    .then((data) => {
                        // num_reactions → reaction_ids/reaction_counts へ変換
                        let reaction_ids: number[] = [];
                        let reaction_counts: number[] = [];
                        if (data.num_reactions) {
                            reaction_ids = Object.keys(data.num_reactions).map(id => Number(id));
                            reaction_counts = Object.values(data.num_reactions);
                        }
                        setPost({
                            ...data,
                            reaction_ids,
                            reaction_counts,
                        });
                    });
            }, []);

    return (
        <div>
                        <div style={{ width: "100%", padding: "24px 0 8px 8px", fontWeight: "bold", fontSize: "30px", color: "#222", position: "relative", display: "flex", alignItems: "center", gap: "5px" }}>
                    <Link href="/home" aria-label="ホームへ戻る" style={{ display: "inline-flex", alignItems: "center" }}>
                        <Image
                            src="/images/kigou.png"
                            alt="ホームへ戻る"
                            width={28}
                            height={28}
                            style={{ display: "block", opacity: 0.5, cursor: "pointer" }}
                        />
                    </Link>
                    
                </div>
            <div style={{ display: "flex", alignItems: "center", paddingLeft: "24px", marginBottom: "35px", marginTop: "26px" }}>
                <Image
                    src="/images/title.png"
                    alt="profile icon"
                    width={128}
                    height={128}
                    style={{ borderRadius: "50%", border: "3px solid #eee" }}
                />
                <div style={{ marginLeft: "32px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <span style={{ fontWeight: "bold", fontSize: "20px", color: "#222" }}>
                        {user ? user.name : "..."}
                    </span>
                </div>
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