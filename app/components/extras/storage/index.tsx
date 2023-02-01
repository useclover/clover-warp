import axios from 'axios';
import Moralis from 'moralis'
import { connect, Connection, SUPPORTED_CHAINS } from "@tableland/sdk";


export type store = {
    name: string,
    date?: string | number,
    tag: "default" | number | string,
    type: string,
    cid: string[],
    extension: string | undefined,
    links?: string[],
    file: boolean,
    shared?: string | string[],
    size: number,
    deleted: boolean
}

export interface dir { 
    name: string,
    deleted: boolean,
    file: boolean,
    links?: string[],
    tag: string | number | 'default'
}

export interface fstructure extends dir {
  files: (store | dir)[];
}

export const updateSearch = (files: (store | dir)[], newFiles: store[], fileFolder: string[],update: boolean = true, num: number = 1) => {
    if (fileFolder.length > 1) {
    files.forEach((data: any) => {
        if(data['files'] !== undefined){
            if(num !== fileFolder.length - 1){
                updateSearch(data['files'], newFiles, fileFolder, update, num++);
            } else {

              if(update){
                if(data['name'] == fileFolder[fileFolder.length - 1]){
                    newFiles.forEach(xx => {
                        data.files.push(xx)
                    });          

                    return true;
                }
              }
            }
        }    
    })
  }else{
      newFiles.forEach(xx => {
          if(!update){
            console.log(files)
          files.push(xx)
          }else{
            files.forEach((e:(dir | store), ix:number) => {
                if(e.name == xx.name){
                    files[ix] = xx;
                }
            })
          }
      }); 
  }
}

export const toDataUrl = (blob: Blob) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      })
  
}

export let userTable;
export let tableName:any = '';

let tables: any[] = [];


export const verifyHash = async (hash: string) => {
   
        const receiptRes = await userTable.receipt(
              hash
        );
            if(receiptRes === undefined){
                setTimeout(() => {
                     verifyHash(hash);
                }, 500)
            }else{
                return true
            }
  }


export const initData:fstructure = {
  name: "main",
  tag: "default",
  files: [],
  deleted: false,
  file: false,
};

export const deleteFile = async (cid: string) => {

    const token = await Moralis.Cloud.run("getWeb3StorageKey");

    const config = {
      data: {

      },
      header: {
        Accept: "*/*",
        Authentication: `Bearer ${token}`,
      },
    };

    axios.delete(`https://api-staging.web3.storage/pins/${cid}`, config).then(done => {
        return done.data;
    }).catch(err => {
        return err;
    });

}


export const getFileList = (files: (store | dir)[], dirFolder: string[], num:number = 0) => {

    files.forEach((file: any) => {
      if (file["files"] !== undefined) {
        if (num !== dirFolder.length - 1) {

          getFileList(file["files"], dirFolder, num + 1);

        } else {
          if (file["name"] == dirFolder[dirFolder.length - 1]) {

              return file;

          }
        }
      }
    });

    return {};

};
