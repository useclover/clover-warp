import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Base from '../../../app/components/base';
import Head from 'next/head';
import Rooms from '../../../app/components/video';

const ViewRooms = () => {

      const Router = useRouter();

      useEffect(() => {
        if (localStorage.getItem("cloverlog") === null) {
          Router.push("/");
        }
      }, []);

    return (
      <>
        <Head>
          <title> DAO Meetings | Clover</title>
        </Head>

        <Base>
          <Rooms />
        </Base>
      </>
    );
}

export default ViewRooms;