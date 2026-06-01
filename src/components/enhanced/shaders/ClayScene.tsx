import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { clayVertexShader, clayFragmentShader, clayUniforms } from './ClaySDF';

// Clay Blob Component
const ClayBlob = ({ position, color, scale = 1 }: {
  position: [number, number, number];
  color: string;
  scale?: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const material = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: clayVertexShader,
      fragmentShader: clayFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uRoughness: { value: 0.4 },
        uSubsurface: { value: 0.6 },
        uLightPosition: { value: new THREE.Vector3(5, 5, 5) },
      },
      transparent: true,
    });
    return mat;
  }, [color]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      meshRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.2) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale} material={material}>
      <icosahedronGeometry args={[1, 64]} />
    </mesh>
  );
};

// Floating Clay Particles
const ClayParticles = ({ count = 50 }: { count?: number }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [
      new THREE.Color('#A3E635'),
      new THREE.Color('#7DD3FC'),
      new THREE.Color('#FDA4AF'),
      new THREE.Color('#C084FC'),
      new THREE.Color('#FB923C'),
    ];

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;

      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    return { positions: pos, colors: col };
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      dummy.position.set(
        positions[i3] + Math.sin(time * 0.5 + i) * 0.5,
        positions[i3 + 1] + Math.cos(time * 0.3 + i * 0.5) * 0.3,
        positions[i3 + 2] + Math.sin(time * 0.4 + i * 0.3) * 0.5
      );
      dummy.scale.setScalar(0.1 + Math.sin(time + i) * 0.05);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshPhysicalMaterial
        roughness={0.4}
        metalness={0.1}
        clearcoat={0.5}
        clearcoatRoughness={0.2}
      />
    </instancedMesh>
  );
};

// Main Clay Scene
export const ClayScene: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '500px', borderRadius: '28px', overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#FDA4AF" />

        <ClayBlob position={[0, 0, 0]} color="#A3E635" scale={1.5} />
        <ClayBlob position={[-2, 0.5, -1]} color="#7DD3FC" scale={0.8} />
        <ClayBlob position={[2, -0.5, 1]} color="#FDA4AF" scale={1} />

        <ClayParticles count={30} />

        <ContactShadows
          position={[0, -2, 0]}
          opacity={0.4}
          scale={10}
          blur={2}
          far={4}
        />

        <Environment preset="city" />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 4}
        />
      </Canvas>
    </div>
  );
};

export default ClayScene;
