// === Login.jsx ===
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import LogoPequeta from '../imagenes/LogoPequeta.svg';

function Login() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/login', { password });
            if (response.status === 200) {
                // Guardar estado de sesión en localStorage
                localStorage.setItem('auth', 'true');
                navigate('/admin');
            }
        } catch (err) {
            setError('Contraseña incorrecta');
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="card p-4" style={{ border: '1px solid #000', borderRadius: '15px', maxWidth: '500px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                <div className="text-center mb-4">
                    <img src={LogoPequeta} alt="Logo Pequeta" style={{ height: '60px' }} />
                </div>
                <h4 className="text-center mb-3" style={{ fontWeight: 'bold' }}>INGRESE SU CONTRASEÑA:</h4>
                <form onSubmit={handleLogin}>
                    <div className="form-group mb-4">
                        <input
                            type="password"
                            className="form-control text-center"
                            style={{ borderRadius: '25px', backgroundColor: '#f8bfc4', color: '#000' }}
                            placeholder="Contraseña..."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="text-center text-danger">{error}</p>}
                    <div className="text-center">
                        <button type="submit" className="btn " style={{ backgroundColor: '#f8bfc4', color: '#000', borderRadius: '25px', fontWeight: 'bold' }}>
                            Ingresar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
