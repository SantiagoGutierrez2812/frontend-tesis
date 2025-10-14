import { useState, useEffect } from 'react';
import styles from './map.module.css';
import mapaImg from '../assets/map/Gemini_Generated_Image_ycymjvycymjvycym.jpeg';
import { useNavigate } from 'react-router-dom';
import TopControl from "../TopControl/TopControl";
import { getBranches } from '../services/branchService/branchService';
import type { Branch } from '../services/types/branch/branchService';

const getMarkerCoordinates = (branchId: number) => {
    switch (branchId) {
        case 1: return { x: 50, y: 60, stock: '75%', stockLevel: 'high' };
        case 2: return { x: 58, y: 43, stock: '24%', stockLevel: 'low' };
        case 3: return { x: 31, y: 59, stock: '50%', stockLevel: 'medium' };
        default: return { x: 50, y: 50, stock: 'N/A', stockLevel: 'unknown' };
    }
};

export default function MapaFondo() {
    const navigate = useNavigate();
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadBranches = async () => {
            try {
                const branchList = await getBranches();
                setBranches(branchList);
            } catch (e) {
                setError("No se pudieron cargar las sedes del mapa.");
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        loadBranches();
    }, []);

    const handleMarkerClick = (branchId: number) => navigate(`/headquarters?branchId=${branchId}`);
    const handleBackToDashboard = () => navigate('/dashboard');

    if (loading) return <div className={styles.mapContainer}><p>Cargando sedes...</p></div>;
    if (error) return <div className={styles.mapContainer}><p className={styles.error}>{error}</p></div>;

    return (
        <div className={styles.mapContainer}>
            <TopControl title="🚀 Sedes Improexprees" onBackClick={handleBackToDashboard} />
            <img src={mapaImg} alt="Mapa" className={styles.mapImage} />

            {branches.map(branch => {
                const coords = getMarkerCoordinates(branch.id);
                return (
                    <div
                        key={branch.id}
                        className={`${styles.marker} ${styles[`stock-${coords.stockLevel}`]}`}
                        style={{ top: `${coords.y}%`, left: `${coords.x}%` }}
                        onClick={() => handleMarkerClick(branch.id)}
                    >
                        <div className={styles.dot} />
                        <div className={styles.tooltip}>
                            <strong>{branch.name}</strong><br />
                            {coords.stock !== 'N/A' && <span>Stock: {coords.stock}</span>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
