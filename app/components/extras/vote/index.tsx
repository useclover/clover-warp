import axios from "axios";

interface voteCampaign {
  options: string[];
  title: string;
  group: string;
  voteId: number;
  sender: string;
}

export const getVotes = async (id: number, groupName: string, contract: string) => {
  const Authorization = `Bearer ${localStorage.getItem("clover-x")}`;

  try {
    const res = await axios.get(`/api/votes`, {
      params: {
        id, groupName, contract
      },
      headers: {
        Authorization,
      },
      baseURL: window.origin,
    });

    return res.data.votes;

  } catch (err) {
    throw err;
  }
}; 

export const storeVote = async (val: voteCampaign, id: number) => {

  
    const Authorization = `Bearer ${localStorage.getItem("clover-x")}`;
    
  try {
    await axios.post(
      `dao/${id}/vote`,
      { ...val },
      {
        headers: {
          Authorization,
        },
      }
    );
  } catch (err) {
    throw err;
  }
};

