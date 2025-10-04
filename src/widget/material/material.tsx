import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Loader = () => {
  const navigate = useNavigate();

  return (
    
    <StyledWrapper>
    <div
        onClick={() => navigate('/crear_material')}
        style={{ cursor: 'pointer' }}
      className="widget" > 

      
      <h2 className="loader-title">Creación de Material</h2>
      
      <div className="boxes">
        <div className="box">
          <div />
          <div />
          <div />
          <div />
        </div>
        <div className="box">
          <div />
          <div />
          <div />
          <div />
        </div>
        <div className="box">
          <div />
          <div />
          <div />
          <div />
        </div>
        <div className="box">
          <div />
          <div />
          <div />
          <div />
        </div>
      </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 15px;
  overflow: hidden;

  .widget {
    display: flex;
    flex-direction: column;
    align-items: center; /* Centra horizontalmente el contenido */
    justify-content: center; /* Centra verticalmente dentro de la tarjeta */
    width: 100%;
    height: 100%;
    text-align: center;
  }

  .loader-title {
    color: #000000ff;
    font-size: 1.2rem;
    font-weight: bold;
    text-align: center;
    margin-bottom: 15px;
    text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
  }

  .boxes {
    --size: 32px;
    --duration: 800ms;
    height: calc(var(--size) * 2);
    width: calc(var(--size) * 3);
    position: relative;
    transform-style: preserve-3d;
    transform-origin: center center;
    margin: 0 auto; /* Centra horizontalmente */
    transform: rotateX(60deg) rotateZ(45deg) rotateY(0deg) translateZ(0);
  }

  .boxes .box {
    width: var(--size);
    height: var(--size);
    position: absolute;
    top: 0;
    left: 0;
    transform-style: preserve-3d;
  }

  .boxes .box:nth-child(1) {
    transform: translate(100%, 0);
    animation: box1 var(--duration) linear infinite;
  }

  .boxes .box:nth-child(2) {
    transform: translate(0, 100%);
    animation: box2 var(--duration) linear infinite;
  }

  .boxes .box:nth-child(3) {
    transform: translate(100%, 100%);
    animation: box3 var(--duration) linear infinite;
  }

  .boxes .box:nth-child(4) {
    transform: translate(200%, 0);
    animation: box4 var(--duration) linear infinite;
  }

  .boxes .box > div {
    --background: #5C8DF6;
    --translateZ: calc(var(--size) / 2);
    position: absolute;
    width: 100%;
    height: 100%;
    background: var(--background);
    transform: rotateY(var(--rotateY, 0deg)) rotateX(var(--rotateX, 0deg))
      translateZ(var(--translateZ));
  }

  .boxes .box > div:nth-child(2) {
    --background: #145af2;
    --rotateY: 90deg;
  }

  .boxes .box > div:nth-child(3) {
    --background: #447cf5;
    --rotateX: -90deg;
  }

  @keyframes box1 {
    0%, 50% { transform: translate(100%, 0); }
    100% { transform: translate(200%, 0); }
  }

  @keyframes box2 {
    0% { transform: translate(0, 100%); }
    50% { transform: translate(0, 0); }
    100% { transform: translate(100%, 0); }
  }

  @keyframes box3 {
    0%, 50% { transform: translate(100%, 100%); }
    100% { transform: translate(0, 100%); }
  }

  @keyframes box4 {
    0% { transform: translate(200%, 0); }
    50% { transform: translate(200%, 100%); }
    100% { transform: translate(100%, 100%); }
  }
`;

export default Loader;