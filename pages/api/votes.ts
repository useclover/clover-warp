// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { ethers } from "ethers";
import contractjson from "../../artifacts/contracts/localdao.sol/CloverSuiteNFT.json";

type Data = {
  message: string;
  error: boolean;
  votes?: any[];
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
    if (req.method == 'GET') {

        (async () => {

            const { authorization } = req.headers;

            const { id, contract: contractAddr, groupName } = req.query;

            
            try {

            const {
              data: { votes },
            } = await axios.get(`/dao/${id}/votes`, {
              headers: {
                Authorization: authorization as string,
              },
              baseURL: process.env.NEXT_PUBLIC_APP_URL || "",
            });

            const selectedVotes = votes.filter((ee: any) => {
              const data = JSON.parse(ee?.data);

              if (data?.group == groupName) return true;

              return false;
            });
            
     
            for (let i = 0; i < selectedVotes.length; i++) {

                const voteId = selectedVotes[i].voteId;

                const provider = new ethers.providers.JsonRpcProvider(
                  process.env.NEXT_PUBLIC_RPC || ""
                );

                const contract = new ethers.Contract(
                  contractAddr as string,
                  contractjson.abi,
                  provider
                );

                const vote = await contract.viewVotes(voteId);

                selectedVotes[i].votedata = vote.map((big: any) => big.toNumber());

            }
            
            
            
           

            res
              .status(200)
              .json({ message: "Success", error: false, votes: selectedVotes });

            } catch (e) {
                const err = e as any;

                console.log(err);
    
                res.status(422).json({ message: err.response?.data?.message || "Something went wrong, please try again", error: true });
            }

        })()
    }else{
        res.status(422).json({ message: "Method not allowed", error: true });
    }
}
