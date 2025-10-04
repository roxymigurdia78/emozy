"use client";
import Image from "next/image";
import Link from "next/link";
import Toukou from "../components/toukou";
import type { Post } from "../components/toukou";
import { useEffect, useState } from "react";

type ApiPost = {
    id: number;
    user_id: number;
    name: string;
    topic_id: number;
    content: string;
    image_url: string;
    created_at: string;
    updated_at: string;
    reaction_ids: number[];
    num_reactions?: { [id: string]: number };
    reacted_reaction_ids?: number[];
    is_favorited?: boolean;
    icon_image_url?: string;
};
export default function Home() {

    const [posts, setPosts] = useState<Post[]>([]);
    const [currentUserId, setCurrentUserId] = useState("");
    useEffect(() => {
        const storedId = window.localStorage.getItem("emozyUserId") || "";
        setCurrentUserId(storedId);

        fetch(`http://localhost:3333/api/v1/posts?user_id=${storedId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
            keepalive: false,
            mode: "cors",
        })
            .then(res => res.json())
            .then(data => {
            console.log("APIレスポンス:", data);
            const posts = (data as ApiPost[]).map((item) => {
                const reaction_ids = item.num_reactions
                ? Object.keys(item.num_reactions).map(id => Number(id))
                : [1, 2, 3];
                const reaction_counts = item.num_reactions
                ? Object.values(item.num_reactions)
                : [0, 0, 0];
                const iconUrl = item.icon_image_url || "/images/syoki2.png";
                return {
                id: item.id,
                user: item.name,
                userIconUrl: iconUrl,
                content: item.content,
                imageUrl: item.image_url,
                reaction_ids,
                reaction_counts,
                reacted_reaction_ids: item.reacted_reaction_ids || [], 
                is_favorited: !!item.is_favorited,
                };
            });
            setPosts(posts);
            })
            .catch(err => console.error("投稿取得エラー", err));
        }, []);


  return (
    <div>
    <header style={{
        backgroundColor:"#7ADAD5",
        height:"100px",
        display:"flex",
        alignItems: "center"      
    }}>
        <Link href="/home" >
            <Image 
                src="/images/emozy_logo.png"
                alt="title"
                width={150}
                height={150}
                style={{marginLeft: "5%"}}
            />
        </Link>    
    </header>

    <main style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "0", paddingBottom: "90px" }}>
        {posts.length === 0 ? (
            <div style={{ color: "#888", marginTop: "32px" }}>ロード中...</div>
        ) : (
            posts.map((post) => (
                <Toukou key={post.id} post={post} />
            ))
        )}
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
    <Link
        href={currentUserId ? `/post?userId=${encodeURIComponent(currentUserId)}` : "/post"}
        style={{ display: "flex", alignItems: "flex-end", height: "100px", flexShrink: 0, flexGrow: 0 }}
    >
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
  )
}
