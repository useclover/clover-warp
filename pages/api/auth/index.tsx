import type { NextApiRequest, NextApiResponse } from "next";
import * as ethers from 'ethers';
import { db } from '../../../app/firebase';
import { ref, get, set, child } from "firebase/database";
import { balanceABI } from "../../../app/components/extras/abi";


type Data = {
  message: string;
  daos?: any[];
  error: boolean
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  const contractAddress = ("0xaCDFc5338390Ce4eC5AD61E3dC255c9F2560D797").toLowerCase();

  const provider = new ethers.providers.JsonRpcProvider("https://api.hyperspace.node.glif.io/rpc/v1");

    if (req.method == 'POST') {

        const { hash, address } = req.body;
        
        const validateAddress = ethers.utils.verifyMessage("Welcome back to clover", hash);


        if ((validateAddress).toLowerCase() == address.toLowerCase()) {


            get(child(ref(db), "DAOs")).then(async (data) => {
            
              if (data.exists()) {

                

                const dao = data.val().filter((a: any) => a.contract);

                const sdao = [];

                if (dao.length) {
                for (let i = 0; i < dao.length; i++) {


                  if ((dao[i].contract).toLowerCase() == contractAddress) {

                    const { joined } = dao[i];
                   
                    joined.forEach((val:string) => {
                        if (
                          val.toLowerCase() == address.toLowerCase()
                        ) {

                           sdao.push({ ...dao[i], id: i });

                        }
                    });

                  }else{

                   const token = new ethers.Contract(dao[i], balanceABI, provider);

                   const balance = ethers.utils.formatEther(
                     await token.balanceOf(address)
                   );

                   if (Number(balance) > 0) {
                        sdao.push({...dao[i], id: i});
                   }

                  }
                }
              }   
                
                if (sdao.length) {

                    res.status(200).json({
                        message: "Successful",
                        error: false,
                        daos: sdao
                    });

                }else{
                   res.status(404).json({
                     message: "No registered DAOs found",
                     error: true,
                   }); 
                }
              }else{
                res.status(404).json({
                  message: "No registered DAOs found",
                  error: true,
                });
              }

            }).catch(err => {
                const error = err as Error;

                console.log(error)

                res.status(400).json({
                    'message': "Something went wrong, please try again",
                    'error' : true
                });

            });            

        }else{
          console.log('eee')
          res.status(400).json({
            message: "Invalid address",
            error: true,
          });   
        }

    }else{
         res.status(422).json({
           message: "Method not supported",
           error: true,
         });
    }


}
