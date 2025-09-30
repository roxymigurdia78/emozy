import Image from "next/image";
import Link from "next/link";
import Toukou from "../components/toukou";
export default function page() {

        const posts = [
        {
            id: 1,
            user: "roxymigurdia78",
            userIconUrl: "/images/title.png",
            content: "ああ",
            imageUrl: "/images/title.png",
            emotions: [],
            reaction_ids: [],
        },
        {
            id: 2,
            user: "Saaaaa",
            userIconUrl: "/images/title.png",
            content: "今日のぶどうは甘かったわー",
            emotions: [],
            reaction_ids: [],
        },
       
  ];

  return (
    <div>
                        <div style={{ width: "100%", padding: "24px 0 8px 24px", fontWeight: "bold", fontSize: "30px", color: "#222", position: "relative" }}>
                    roxymigurdia78
                                <img
                                    src="/images/settei.png"
                                    alt="settings"
                                    width={36}
                                    height={36}
                                    style={{ position: "absolute", top: 30, right: 24, cursor: "pointer" }}
                                />
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
                        もりた
                    </span>
                    <div style={{ display: "flex", gap: "24px", fontSize: "18px", color: "#444" }}>
                        <span>フォロー <b>123</b></span>
                        <span>フォロワー <b>456</b></span>
                    </div>
                </div>
                
            </div>
            {/* プロフィール（自己紹介文）追加 */}
            <div style={{ paddingLeft: "23px", paddingRight: "24px", marginBottom: "10px", color: "#333", fontSize: "17px" }}>
                よろしくお願いします。
            </div>

    <main style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "0" }}>
        {posts.map((post) => (
                    <Toukou key={post.id} post={post} />
        ))}
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