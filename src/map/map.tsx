import { useState, useEffect, useRef } from 'react';
import styles from './map.module.css';
import mapaImg from '../assets/map/Gemini_Generated_Image_ycymjvycymjvycym.jpeg';
import { useNavigate } from 'react-router-dom';
import TopControl from "../TopControl/TopControl";
import { getBranches } from '../services/branchService/branchService';
import type { Branch } from '../services/types/branch/branchService';

const getMarkerCoordinates = (branchId: number) => {
    switch (branchId) {
        case 1: return { x: 50, y: 50, stock: '75%', stockLevel: 'high' };
        case 2: return { x: 58, y: 40, stock: '24%', stockLevel: 'low' };
        case 3: return { x: 31, y: 59, stock: '50%', stockLevel: 'medium' };
        default: return { x: 50, y: 50, stock: 'N/A', stockLevel: 'unknown' };
    }
};

export default function MapaFondo() {
    const navigate = useNavigate();
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: 0, y: 0 });

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

    // Partículas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        class Particle {
            x: number;
            y: number;
            size: number;
            baseX: number;
            baseY: number;
            velocityX: number;
            velocityY: number;
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.baseX = this.x;
                this.baseY = this.y;
                this.size = Math.random() * 3 + 1;
                this.velocityX = 0;
                this.velocityY = 0;
            }
            draw() {
                ctx!.fillStyle = 'rgba(255,255,255,0.7)';
                ctx!.beginPath();
                ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx!.fill();
            }
            update() {
                const dx = this.x - mouseRef.current.x;
                const dy = this.y - mouseRef.current.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const maxDist = 100;

                if (dist < maxDist) {
                    const angle = Math.atan2(dy, dx);
                    const force = (maxDist - dist) / maxDist;
                    this.velocityX += Math.cos(angle) * force * 2;
                    this.velocityY += Math.sin(angle) * force * 2;
                }

                this.x += this.velocityX;
                this.y += this.velocityY;

                this.velocityX *= 0.9;
                this.velocityY *= 0.9;

                this.x += (this.baseX - this.x) * 0.01;
                this.y += (this.baseY - this.y) * 0.01;
            }
        }

        const particles: Particle[] = [];
        for (let i = 0; i < 200; i++) particles.push(new Particle());

        const animate = () => {
            ctx!.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animate);
        };

        animate();

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current.x = e.clientX;
            mouseRef.current.y = e.clientY;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });

        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleMarkerClick = (branchId: number) => navigate(`/headquarters?branchId=${branchId}`);
    const handleBackToDashboard = () => navigate('/dashboard');

    if (loading) return <div className={styles.mapContainer}><p>Cargando sedes...</p></div>;
    if (error) return <div className={styles.mapContainer}><p className={styles.error}>{error}</p></div>;

    return (
        <div className={styles.mapContainer} ref={mapContainerRef}>
            <canvas ref={canvasRef} className={styles.particlesCanvas}></canvas>
            <TopControl title="🚀 Sedes Improexprees" onBackClick={handleBackToDashboard} />
            <img src={mapaImg} alt="Mapa" className={styles.mapImage} />
            {branches.map(branch => {
                const coords = getMarkerCoordinates(branch.id);
                return (
                    <div
                        key={branch.id}
                        className={`${styles.marker} ${styles[`stock-${coords.stockLevel}`]}`}
                        style={{ top: `${coords.y}%`, left: `${coords.x}%` }}
                        tabIndex={0}
                        aria-label={`${branch.name} stock ${coords.stock}`}
                        onClick={() => handleMarkerClick(branch.id)}
                    >
                        <div className={styles.dot} />
                        <div className={styles.tooltip}>
                            <strong>{branch.name}</strong>
                            {coords.stock !== 'N/A' && <span> | Stock: {coords.stock}</span>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
