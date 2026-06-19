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
    shadowPosition?: [number, number, number];
}

export default function Scene({
    cameraPosition = [0, 1.2, 3.8],
    fov = 45,
    modelScale = 1.2,
    modelPosition = [0, -0.4, 0],
    shadowPosition = [0, -0.45, 0]
}: SceneProps) {
    return (
        <Canvas camera={{ position: cameraPosition, fov: fov }} dpr={[1, 2]}>
            {/* Ambient light - lower to keep shadows rich and realistic */}
            <ambientLight intensity={0.4} />

            {/* Warm Key Light matching the table's background lighting direction (top-left/front) */}
            <directionalLight 
                position={[-4, 6, 4]} 
                intensity={3.5} 
                color="#fff8f0" 
                castShadow 
                shadow-mapSize={[1024, 1024]}
            />

            {/* Studio rim/backlight for highlight on food edges (top-right/back) */}
            <spotLight 
                position={[5, 6, -3]} 
                intensity={4.0} 
                angle={0.4} 
                penumbra={1} 
                color="#ffffff"
            />

            {/* Soft fill light from the right to soften dark shadows */}
            <pointLight 
                position={[4, 2, 2]} 
                intensity={1.5} 
                color="#e6f0ff"
            />

            <Suspense fallback={null}>
                <group position={modelPosition}>
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
                maxPolarAngle={Math.PI / 2.15}
                minPolarAngle={Math.PI / 6}
                makeDefault
            />
        </Canvas>
    )
}