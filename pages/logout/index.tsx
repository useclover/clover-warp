import { useEffect, useContext, useRef } from 'react';
import { useRouter } from 'next/router'
import Loader from '../../app/components/loader';
import { logout } from '../../app/components/extras/logout';

const Logout = () => {

    const router = useRouter();

    const once = useRef<boolean>(true);

    useEffect(() => {

        (async () => {

            if (localStorage.getItem("clover-x") !== null) {
              if (once.current) {

                once.current = false;

                await logout();

              } else {
                router.push("/");
              }
            }

        })()

    }, [router]);

    return (<Loader />)

}

export default Logout