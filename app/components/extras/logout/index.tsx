import axios from 'axios';

export const logout = async () => {


    const Authorization = `Bearer ${localStorage.getItem('clover-x')}`

    try {

        await axios.get("/logout", {
            headers: {
                Authorization
            }
        });

    }catch (err) {
        // do something
    }

    localStorage.removeItem("cloverlog");

    localStorage.removeItem("clover-x");

    window.location.href = '/';
    
}