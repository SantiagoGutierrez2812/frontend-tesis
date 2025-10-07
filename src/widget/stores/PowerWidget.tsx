import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Card = () => {
  const navigate = useNavigate();

  return (
    <StyledWrapper>
      <div className="card" onClick={() => navigate('/registro')}>
        <div className="gradient"></div>
        <div className="inner-glow"></div>
        <h2>Registro de Material</h2>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 320px;

  .card {
    position: relative;
    width: 230px;
    height: 300px;
    border-radius: 26px;
    overflow: hidden;
    background: #1a1a1a;
    box-shadow:
      0 0 40px rgba(255, 255, 255, 0.05),
      inset 0 0 20px rgba(255, 255, 255, 0.05);
    transition: all 0.4s ease;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .card:hover {
    transform: translateY(-8px) scale(1.03);
    box-shadow:
      0 0 50px rgba(255, 255, 255, 0.15),
      0 0 120px rgba(255, 200, 100, 0.25),
      0 0 180px rgba(255, 0, 200, 0.2);
  }

  /* Gradiente dinámico en movimiento */
  .gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      120deg,
      #ff6b6b,
      #f7d46e,
      #6ec1ff,
      #ff8ad8,
      #ff6b6b
    );
    background-size: 300% 300%;
    animation: gradientShift 6s ease-in-out infinite;
    opacity: 0.8;
    z-index: 1;
  }

  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  /* Brillo interior suave */
  .inner-glow {
    position: absolute;
    inset: 6px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.05);
    box-shadow:
      inset 0 0 40px rgba(255, 255, 255, 0.1),
      inset 0 0 60px rgba(255, 200, 150, 0.08);
    z-index: 2;
  }

  /* Título */
  .card h2 {
    position: relative;
    z-index: 3;
    font-size: 1.4em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    text-align: center;
    color: white;
    background: linear-gradient(90deg, #fff8dc, #ffe4b5, #ffb3b3, #ffd27f);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow:
      0 0 10px rgba(255, 200, 120, 0.6),
      0 0 20px rgba(255, 160, 100, 0.4);
  }

  .card:hover h2 {
    filter: brightness(1.3);
    text-shadow:
      0 0 20px rgba(255, 240, 180, 0.9),
      0 0 40px rgba(255, 150, 200, 0.6);
  }
`;

export default Card;
