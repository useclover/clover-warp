import axios from 'axios';

export const logout = async () => {

    const Authorization = `Bearer ${localStorage.getItem('clover-x')}`

    await axios.get("/logout", {
        headers: {
            Authorization
        }
    });

    localStorage.removeItem('cloverlog');

    localStorage.removeItem('clover-x');

    window.location.href = '/';
    
}