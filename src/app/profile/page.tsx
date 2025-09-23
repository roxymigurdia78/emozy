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
      smiles: 5,
      sparkles: 2,
    },
    {
      id: 2,
      user: "Saaaaa",
      userIconUrl: "/images/title.png",
      content: "今日のぶどうは甘かったわー",
      smiles: 3,
      sparkles: 1,
    },

    // ...他の投稿
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
        backgroundColor:"#7ADAD5",
        height:"100px",
        display:"flex",
        alignItems: "center",
        justifyContent: "center",
        position:"fixed",
        bottom:"0",
        width:"100%"
    }}>
        <Link href="/home">
            <Image
                src=""
                alt="homeicon"
                width={50}
                height={50}
                style={{}}
            />
        </Link>

        <Link href="/ranking">
            <Image
                src=""
                alt="rankingicon"
                width={50}
                height={50}
                style={{}}
            />
        </Link>

        <Link href="/post">
            <Image
                src=""
                alt="posticon"
                width={50}
                height={50}
                style={{}}
            />
        </Link>

        <Link href="/search">
            <Image
                src=""
                alt="searchicon"
                width={50}
                height={50}
                style={{}}
            />
        </Link>

        <Link href="/profile">
            <Image
                src=""
                alt="profileicon"
                width={50}
                height={50}
                style={{}}
            />
        </Link>
    </footer>

    </div>
  )
}