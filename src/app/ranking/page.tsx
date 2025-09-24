import Image from "next/image";
import Link from "next/link";
export default function profile() {
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
    
    
  );
}
