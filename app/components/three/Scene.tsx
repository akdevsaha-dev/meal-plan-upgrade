'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import { FoodPlater } from './Foodplater'

interface SceneProps {
    cameraPosition?: [number, number, number];
    fov?: number;
    modelScale?: number;
    modelPosition?: [number, number, number];
    modelRotation?: [number, number, number];
    shadowPosition?: [number, number, number];
    target?: [number, number, number];
}

export default function Scene({
    cameraPosition = [0, 1.2, 3.8],
    fov = 45,
    modelScale = 1.2,
    modelPosition = [0, -0.4, 0],
    modelRotation = [0, 0, 0],
    shadowPosition = [0, -0.45, 0],
    target = [0, 0, 0]
}: SceneProps) {
    return (
        <Canvas camera={{ position: cameraPosition, fov: fov }} dpr={[1, 2]} shadows>
            {/* Ambient light - lower to keep shadows rich and realistic */}
            <ambientLight intensity={0.45} />

            {/* Warm Key Light matching the table's background lighting direction (top-left/front) */}
            <directionalLight 
                position={[-4, 6, 4]} 
                intensity={3.2} 
                color="#fff8f0" 
                castShadow 
                shadow-mapSize={[2048, 2048]}
                shadow-bias={-0.0001}
            />

            {/* Studio rim/backlight for highlight on food edges (top-right/back) */}
            <spotLight 
                position={[5, 6, -3]} 
                intensity={3.5} 
                angle={0.4} 
                penumbra={1} 
                color="#ffffff"
            />

            {/* Soft fill light from the right to soften dark shadows */}
            <pointLight 
                position={[4, 2, 2]} 
                intensity={1.2} 
                color="#e6f0ff"
            />

            <Suspense fallback={null}>
                <group position={modelPosition} rotation={modelRotation}>
                    <FoodPlater scale={modelScale} />
                    <ContactShadows
                        position={shadowPosition}
                        opacity={0.85}
                        scale={4}
                        blur={1.8}
                        far={1.5}
                    />
                </group>
            </Suspense>

            <OrbitControls 
                enableZoom={false}
                enablePan={false}
                enableDamping
                dampingFactor={0.08}
                rotateSpeed={0.6}
                target={target}
                maxPolarAngle={Math.PI / 2.05}
                minPolarAngle={Math.PI / 5}
                makeDefault
            />
        </Canvas>
    )
}
