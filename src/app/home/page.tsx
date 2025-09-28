"use client";
import Image from "next/image";
import Link from "next/link";
import Toukou from "../components/toukou";
import type { Post } from "../components/toukou";
import { useEffect, useState } from "react";

type ApiPost = {
    id: number;
    user_id: number;
    topic_id: number;
    content: string;
    image_url: string;
    created_at: string;
    updated_at: string;
};
export default function Home() {

    const [posts, setPosts] = useState<Post[]>([]);
        useEffect(() => {
                fetch("http://localhost:3333/api/v1/posts/")
                    .then(res => res.json())
                    .then(data => {
                        // Toukou用に変換
                        const posts = (data as ApiPost[]).map((item) => ({
                            id: item.id,
                            user: `user${item.user_id}`,
                            userIconUrl: "/images/title.png", // 仮アイコン
                            content: item.content,
                            imageUrl: item.image_url,
                            smiles: 0,
                            sparkles: 0
                        }));
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
                src="/images/title.png"
                alt="title"
                width={150}
                height={150}
                style={{marginLeft: "5%"}}
            />
        </Link>    
    </header>







    <main style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "0" }}>
        {posts.length === 0 ? (
            <div style={{ color: "#888", marginTop: "32px" }}>現在は投稿が無く、さみしい感じですね、、、、。</div>
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
  )
}