import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { ethers } from "ethers";
import { balanceABI } from "../../../app/components/extras/abi";

type Data = {
  message: string;
  error: boolean;
  daos?: any[];
  multiple?: boolean;
  token?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method == "POST") {

    (async () => {
      const { address, contractAddress, hash } = req.body;

      const validateAddress = ethers.utils.verifyMessage(
        "Welcome back to clover",
        hash
      );

      try {
        if (validateAddress == address) {
          const { data } = await axios.get("/daos", {
            baseURL: process.env.NEXT_PUBLIC_APP_URL,
            headers: { "X-App-Key": process.env.NEXT_PUBLIC_APP_KEY || "" },
          });


          const provider = new ethers.providers.JsonRpcProvider(
            "https://api.hyperspace.node.glif.io/rpc/v1"
          );

          const dao = data.daos.filter((a: any) => a.contract);

          const sdao = [];

          if (dao.length) {

            const checked: string[] = [];

            for (let i = 0; i < dao.length; i++) {

              if (ethers.utils.getAddress(dao[i].contract) == contractAddress) {

                const { joined, metadata } = dao[i];

                const rJoined = JSON.parse(joined);

                [ ...rJoined, metadata ].forEach((val: string) => {
                  const address1 = ethers.utils.getAddress(val);

                  const address2 = ethers.utils.getAddress(address);

                  if (address1 == address2) {
                    sdao.push({ ...dao[i] });
                  }
                });
              } else {

                if (checked.indexOf(dao[i].contract) != -1) {
                  continue;
                } else {
                  checked.push(dao[i].contract);
                }

                let balance: any = 0;

                try {
                  const token = new ethers.Contract(
                    dao[i].contract,
                    balanceABI,
                    provider
                  );

                  balance = ethers.utils.formatEther(
                    await token.balanceOf(address)
                  );
                } catch (err) {
                  const error = err as Error;
                  console.log(error);
                }

                if (Number(balance) > 0) {
                  sdao.push({ ...dao[i] });
                }
              }
            }
          }

          const {
            data: { token = false },
          } = await axios.post(
            "/login",
            {
              address,
            },
            { headers: { "X-App-Key": process.env.NEXT_PUBLIC_APP_KEY || "" } }
          );

          if (sdao.length && Boolean(token)) {

            if (sdao.length > 1) {
              res.status(200).json({
                message: "Daos found",
                error: false,
                token,
                daos: sdao,
                multiple: true,
              });
              
            } else {

              res.status(200).json({
                message: "Daos found",
                error: false,
                token,
                daos: sdao[0],
                multiple: false,
              });

            }

          } else {
            res.status(404).json({ error: true, message: "No daos found" });
          }
        } else {
          res.status(400).json({ error: true, message: "Invalid hash" });
        }
      } catch (err) {
        const error = err as any;

        console.log(error);

        res
          .status(error?.status || 400)
          .json({
            error: true,
            message:
              error?.response?.data.message ||
              "Something went wrong, please try again",
          });
      }
    })();
  } else {
    res.status(422).json({
      message: "Method not supported",
      error: true,
    });
  }
}
