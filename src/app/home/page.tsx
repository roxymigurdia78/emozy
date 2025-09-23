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

        <Link href="post">
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