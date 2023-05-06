import axios from 'axios'
import { useEffect } from 'react';

const Xx = () => {

  useEffect(() => {

    (async () => {

      const { data } = await axios.get(
        "http://localhost:8000/dao/1/files",
        {
          headers: {
            "X-App-Key": process.env.NEXT_PUBLIC_APP_KEY || "",
            Authorization: `Bearer 1|Bv6YiagMDoU1pSfJXqV316GZmWfFTMJw7rjO0D4V`,
          },
        }
      );


      console.log(data);

    })()

  }, [])

  return <div>Welcome back</div>

}

export default Xx;