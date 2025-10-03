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
    icon_image_url?: string;
};

export default function page() {
    const [user, setUser] = useState<User | null>(null);
    const [post, setPost] = useState(null);
    useEffect(() => {
        fetch("http://localhost:3333/api/v1/users/1")
            .then((res) => res.json())
            .then((data) => setUser(data));
        fetch("http://localhost:3333/api/v1/posts/1")
            .then((res) => res.json())
            .then((data) => {
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
           <header style={{
                backgroundColor:"#7ADAD5",
                height:"100px",
                display:"flex",
                alignItems: "center"      
            }}>
                <Link href="/favorite" >
                    <Image 
                        src="/images/title.png"
                        alt="title"
                        width={150}
                        height={150}
                        style={{marginLeft: "5%"}}
                    />
                </Link>    
            </header>

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