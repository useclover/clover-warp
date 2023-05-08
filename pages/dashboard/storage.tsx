import { useEffect } from "react";
import { useRouter } from 'next/router';
import Storage from "../../app/components/storage";
import Base from "../../app/components/base";
import Head from "next/head";

const StoragePage = () => {

    const Router = useRouter();

     useEffect(() => {
       if (localStorage.getItem("cloverlog") === null) {
         Router.push("/");
       } 
     }, []);


    return (
      <>
        <Head>
          <title> DAO storage | Clover</title>
        </Head>

        <Base>
          <Storage />
        </Base>

        </>
    );

}

export default StoragePage;