import * as THREE from 'three';

export const ReputationShader = {
  uniforms: {
    uTime: { value: 0 },
    uTrust: { value: 0.5 }, // 0.0 (Snake) to 1.0 (Saint)
  },
  vertexShader: `
    varying vec2 vUv;
    varying float vTrust;
    uniform float uTime;
    attribute float aTrust;

    void main() {
      vUv = uv;
      vTrust = aTrust;
      
      vec3 pos = position;
      
      // Glitch effect for low trust (Snakes)
      float glitchAmount = (1.0 - aTrust) * 0.15;
      if (glitchAmount > 0.05) {
        pos.x += sin(uTime * 20.0 + pos.y * 10.0) * glitchAmount;
        pos.z += cos(uTime * 25.0 + pos.x * 12.0) * glitchAmount;
      }

      // Gentle hover for everyone
      pos.y += sin(uTime + float(gl_InstanceID) * 0.1) * 0.05;

      vec4 mvPosition = instanceMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * modelViewMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    varying float vTrust;
    uniform float uTime;

    void main() {
      // Color based on trust: Red (Snake) to Blue/Cyan (Saint)
      vec3 snakeColor = vec3(1.0, 0.2, 0.0); // Red-Orange
      vec3 saintColor = vec3(0.0, 1.0, 0.8); // Cyan
      vec3 neutralColor = vec3(1.0, 1.0, 1.0); // White

      vec3 color;
      if (vTrust < 0.4) {
        color = mix(snakeColor, neutralColor, vTrust * 2.5);
      } else if (vTrust > 0.6) {
        color = mix(neutralColor, saintColor, (vTrust - 0.6) * 2.5);
      } else {
        color = neutralColor;
      }

      // Add a pulse effect
      float pulse = sin(uTime * 2.0) * 0.1 + 0.9;
      color *= pulse;

      // Add wireframe-like glow
      float edge = 0.1;
      if (vUv.x < edge || vUv.x > 1.0 - edge || vUv.y < edge || vUv.y > 1.0 - edge) {
        color *= 1.5;
      }

      gl_FragColor = vec4(color, 0.8);
    }
  `,
};
