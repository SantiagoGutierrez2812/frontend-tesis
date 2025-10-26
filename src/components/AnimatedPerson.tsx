import React from "react";
import styled, { keyframes } from "styled-components";

export default function AnimatedPerson() {
  return (
    <Wrapper>
      <div className="face">
        <div className="eyes">
          <div className="eye" />
          <div className="eye" />
        </div>
        <div className="mouth" />
      </div>
      <p className="text">Registro de Personal</p>
    </Wrapper>
  );
}

// 🌀 Animaciones
const blink = keyframes`
  0%, 90%, 100% { transform: scaleY(1); }
  92% { transform: scaleY(0.1); }
`;

const headMove = keyframes`
  0%, 90%, 100% { transform: rotate(0deg); }
  95% { transform: rotate(8deg); }
`;

const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0 12px rgba(0,255,255,0.4); }
  50% { box-shadow: 0 0 20px rgba(0,255,255,0.8); }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 260px;
  width: 100%;
  background: transparent;
  font-family: "Orbitron", sans-serif;

  .face {
    position: relative;
    width: 140px;
    height: 140px;
    background: radial-gradient(circle at 50% 40%, #101820, #05060a);
    border-radius: 50%;
    border: 2px solid #00ffff;
    animation: ${headMove} 20s ease-in-out infinite, ${glowPulse} 4s ease-in-out infinite;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .eyes {
    display: flex;
    gap: 30px;
  }

  .eye {
    width: 20px;
    height: 10px;
    background: #00ffff;
    border-radius: 50%;
    animation: ${blink} 5s infinite;
  }

  .mouth {
    width: 40px;
    height: 4px;
    background: #00ffff;
    border-radius: 2px;
    margin-top: 20px;
  }

  .text {
    margin-top: 16px;
    font-size: 15px;
    color: #88eaff;
    letter-spacing: 1px;
  }
`;
