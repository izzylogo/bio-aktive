import React, { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, ContactShadows, Float, Lightformer, Html, useProgress } from '@react-three/drei';
import * as THREE from 'three';

// --- Helpers & Loaders ---

function CanvasLoader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center text-neutral-900 bg-white/80 p-4 rounded-xl backdrop-blur-sm shadow-sm">
        <div className="w-8 h-8 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin mb-2"></div>
        <span className="text-xs font-medium tracking-widest uppercase">{progress.toFixed(0)}%</span>
      </div>
    </Html>
  );
}

function FastEnvironment() {
  return (
    <Environment resolution={256}>
      <Lightformer form="rect" intensity={10} position={[-4, 5, 4]} rotation={[0, -Math.PI / 4, 0]} scale={[5, 2, 1]} />
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <Lightformer intensity={8} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
        <Lightformer intensity={6} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={[20, 0.2, 1]} />
        <Lightformer intensity={4} rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={[20, 0.5, 1]} />
        <Lightformer intensity={6} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={[20, 1, 1]} />
        <Lightformer intensity={3} rotation-y={0} position={[0, 2, 5]} scale={[5, 5, 1]} />
      </group>
    </Environment>
  );
}

// --- Textures ---

function useBottleNoiseTexture() {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const imgData = ctx.createImageData(512, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 255;
      data[i] = noise;
      data[i + 1] = noise;
      data[i + 2] = noise;
      data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }, []);
}

function useCapRidgesTexture() {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 512, 128);

    for (let i = 0; i < 512; i += 16) {
      const gradient = ctx.createLinearGradient(i, 0, i + 16, 0);
      gradient.addColorStop(0, '#222222');
      gradient.addColorStop(0.5, '#ffffff');
      gradient.addColorStop(1, '#222222');
      ctx.fillStyle = gradient;
      ctx.fillRect(i, 0, 16, 128);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 1);
    return texture;
  }, []);
}

function useGlowTexture() {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const gradient = ctx.createRadialGradient(256, 256, 40, 256, 256, 256);
    gradient.addColorStop(0, 'rgba(255,255,255,0.95)');
    gradient.addColorStop(0.28, 'rgba(255,255,255,0.45)');
    gradient.addColorStop(0.6, 'rgba(255,255,255,0.12)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);
}

function useLabelTexture(title: string, color: string) {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 3000;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Background
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 3000, 1000);

    // Subtle noise for label texture
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for (let i = 0; i < 20000; i++) {
      ctx.fillRect(Math.random() * 3000, Math.random() * 1000, 1.5, 1.5);
    }

    // Gold/Beige Border
    ctx.strokeStyle = '#c2b6a3';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, 2940, 960);

    // FRONT PANEL (Center: 1500)
    ctx.textAlign = 'center';
    ctx.fillStyle = '#c2b6a3';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText('B I O - A K T I V E', 1500, 180);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 130px sans-serif';
    ctx.fillText(title.toUpperCase(), 1500, 340);

    ctx.fillStyle = '#c2b6a3';
    ctx.fillRect(1100, 420, 800, 70);

    ctx.fillStyle = color;
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText('B I O A C T I V E', 1500, 470);

    ctx.fillStyle = '#ffffff';
    ctx.font = '36px sans-serif';
    ctx.fillText('Pure Patented Shoden™', 1500, 580);

    ctx.font = 'bold 40px sans-serif';
    ctx.fillText('High Bioavailability & Leading Potency', 1500, 650);

    ctx.font = '36px sans-serif';
    ctx.fillText('Withanolide Glycosides & Full Spectrum', 1500, 710);

    ctx.fillStyle = '#c2b6a3';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('FOOD SUPPLEMENT   •   60 CAPSULES', 1500, 880);

    // LEFT PANEL (Center: 500) - Ingredients
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(150, 150, 700, 700);

    ctx.font = 'bold 50px sans-serif';
    ctx.fillText('Supplement Facts', 200, 230);
    ctx.fillRect(200, 260, 600, 5);

    ctx.font = '30px sans-serif';
    ctx.fillText('Serving Size: 2 Capsules', 200, 320);
    ctx.fillText('Servings Per Container: 30', 200, 370);
    ctx.fillRect(200, 400, 600, 2);

    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('Amount Per Serving', 200, 450);
    ctx.textAlign = 'right';
    ctx.fillText('% Daily Value', 800, 450);
    ctx.fillRect(200, 470, 600, 2);

    ctx.textAlign = 'left';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText(`${title} Extract`, 200, 530);
    ctx.textAlign = 'right';
    ctx.font = '34px sans-serif';
    ctx.fillText('500 mg      *', 800, 530);

    ctx.textAlign = 'left';
    ctx.font = '26px sans-serif';
    ctx.fillText('(Root and leaf)', 200, 580);
    ctx.fillRect(200, 620, 600, 5);

    ctx.font = '26px sans-serif';
    ctx.fillText('* Daily Value not established.', 200, 670);

    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('OTHER INGREDIENTS:', 200, 740);
    ctx.font = '26px sans-serif';
    ctx.fillText('Cellulose (capsule), Rice Flour, Magnesium Stearate.', 200, 780);

    // RIGHT PANEL (Center: 2500) - Info & Barcode
    ctx.textAlign = 'left';
    ctx.strokeRect(2150, 150, 700, 700);

    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('SUGGESTED USE:', 2200, 230);
    ctx.font = '30px sans-serif';
    ctx.fillText('Take 2 capsules daily with food or', 2200, 280);
    ctx.fillText('as directed by your healthcare', 2200, 320);
    ctx.fillText('professional.', 2200, 360);

    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('WARNING:', 2200, 440);
    ctx.font = '30px sans-serif';
    ctx.fillText('For adults only. Consult physician', 2200, 490);
    ctx.fillText('if pregnant/nursing, taking', 2200, 530);
    ctx.fillText('medication, or have a medical', 2200, 570);
    ctx.fillText('condition. Keep out of reach', 2200, 610);
    ctx.fillText('of children.', 2200, 650);

    // QR & Barcode Mocks
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(2200, 700, 120, 120);
    ctx.fillStyle = '#000000';
    ctx.fillRect(2210, 710, 30, 30);
    ctx.fillRect(2280, 710, 30, 30);
    ctx.fillRect(2210, 780, 30, 30);
    for (let i = 0; i < 40; i++) {
      ctx.fillRect(2210 + Math.random() * 100, 710 + Math.random() * 100, 8, 8);
    }

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(2400, 700, 350, 120);
    ctx.fillStyle = '#000000';
    for (let i = 0; i < 45; i++) {
      const w = Math.random() * 6 + 2;
      const x = 2420 + i * 7.2;
      if (x + w < 2730) ctx.fillRect(x, 710, w, 80);
    }
    ctx.font = '24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('8  12345  67890  5', 2575, 810);

    ctx.clearRect(2970, 0, 30, 1000);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, [title, color]);
}

function useSodaCapRidgesTexture() {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 512, 128);

    for (let i = 0; i < 512; i += 16) {
      const gradient = ctx.createLinearGradient(i, 0, i + 16, 0);
      gradient.addColorStop(0, '#222222');
      gradient.addColorStop(0.5, '#ffffff');
      gradient.addColorStop(1, '#222222');
      ctx.fillStyle = gradient;
      ctx.fillRect(i, 0, 16, 128);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 1);
    return texture;
  }, []);
}

function useSupplementCanLabelTexture(product: any) {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 3000;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = product.color;
    ctx.fillRect(0, 0, 3000, 1000);

    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for (let i = 0; i < 20000; i++) {
      ctx.fillRect(Math.random() * 3000, Math.random() * 1000, 1.5, 1.5);
    }

    ctx.strokeStyle = '#c2b6a3';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, 2940, 960);

    const frontSubtitle =
      product.id === 'turmeric'
        ? 'Curcumin Complex'
        : product.id === 'maca'
          ? 'Root Powder'
          : 'Root Extract';
    const benefitLines = (product.benefits || []).slice(0, 3);
    const primaryIngredient = product.ingredients?.[0];
    const secondaryIngredient = product.ingredients?.[1];

    ctx.textAlign = 'center';
    ctx.fillStyle = '#c2b6a3';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText("B I O - A K T I V E", 1500, 180);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 120px serif';
    ctx.fillText(product.name, 1500, 350);

    ctx.fillStyle = '#c2b6a3';
    ctx.font = 'italic 48px serif';
    ctx.fillText(frontSubtitle, 1500, 450);

    ctx.beginPath();
    ctx.moveTo(1200, 500);
    ctx.lineTo(1800, 500);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#c2b6a3';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '32px sans-serif';
    benefitLines.forEach((benefit: string, index: number) => {
      ctx.fillText(`• ${benefit.toUpperCase()} •`, 1500, 600 + index * 60);
    });

    ctx.fillStyle = '#c2b6a3';
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText(primaryIngredient?.amount || '600mg', 1500, 850);
    ctx.font = '24px sans-serif';
    ctx.fillText('PER SERVING', 1500, 890);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText('Supplement Facts', 100, 150);

    ctx.beginPath();
    ctx.moveTo(100, 180);
    ctx.lineTo(900, 180);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.font = '28px sans-serif';
    ctx.fillText('Serving Size: 2 Capsules', 100, 240);
    ctx.fillText('Servings Per Container: 30', 100, 290);

    ctx.beginPath();
    ctx.moveTo(100, 320);
    ctx.lineTo(900, 320);
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('Amount Per Serving', 100, 380);
    ctx.textAlign = 'right';
    ctx.fillText('% Daily Value', 900, 380);

    ctx.beginPath();
    ctx.moveTo(100, 410);
    ctx.lineTo(900, 410);
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.font = '28px sans-serif';
    ctx.fillText(primaryIngredient?.name || `${product.name} Extract`, 100, 470);
    ctx.textAlign = 'right';
    ctx.fillText(primaryIngredient?.amount || '600mg', 700, 470);
    ctx.fillText('**', 900, 470);

    ctx.textAlign = 'left';
    ctx.font = 'italic 24px sans-serif';
    ctx.fillText(`(${frontSubtitle})`, 120, 510);

    ctx.textAlign = 'left';
    ctx.font = '28px sans-serif';
    ctx.fillText(secondaryIngredient?.name || 'Black Pepper Extract', 100, 570);
    ctx.textAlign = 'right';
    ctx.fillText(secondaryIngredient?.amount || '5mg', 700, 570);
    ctx.fillText('**', 900, 570);

    ctx.beginPath();
    ctx.moveTo(100, 620);
    ctx.lineTo(900, 620);
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.font = '24px sans-serif';
    ctx.fillText('** Daily Value not established.', 100, 680);

    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('Other Ingredients:', 100, 750);
    ctx.font = '24px sans-serif';
    ctx.fillText('Vegetable Cellulose (Capsule), Rice Flour.', 320, 750);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#c2b6a3';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('SUGGESTED USE:', 2100, 150);

    ctx.fillStyle = '#ffffff';
    ctx.font = '28px sans-serif';
    const usageLines = (product.usage || '').match(/.{1,38}(\s|$)/g)?.slice(0, 3) || ['Take two (2) capsules daily with a meal'];
    usageLines.forEach((line: string, index: number) => {
      ctx.fillText(line.trim(), 2100, 200 + index * 40);
    });

    ctx.fillStyle = '#c2b6a3';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('WARNING:', 2100, 380);

    ctx.fillStyle = '#ffffff';
    ctx.font = '28px sans-serif';
    const warningLines = (product.warning || '').match(/.{1,38}(\s|$)/g)?.slice(0, 3) || ['Consult your doctor before use.'];
    warningLines.forEach((line: string, index: number) => {
      ctx.fillText(line.trim(), 2100, 430 + index * 40);
    });

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(2100, 650, 400, 150);
    ctx.fillStyle = '#000000';
    for (let i = 0; i < 50; i++) {
      const width = Math.random() * 6 + 2;
      const x = 2120 + i * 7;
      if (x < 2480) {
        ctx.fillRect(x, 660, width, 110);
      }
    }
    ctx.font = '20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('8  12345  67890  5', 2300, 790);

    ctx.fillStyle = '#c2b6a3';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('GMP CERTIFIED', 2600, 680);
    ctx.fillText('NON-GMO', 2600, 730);
    ctx.fillText('VEGAN', 2600, 780);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, [product]);
}

function ModernSupplementBottle({ product, ...props }: any) {
  const labelTexture = useLabelTexture(product.name, product.color);
  const capRidges = useCapRidgesTexture();
  const noiseTexture = useBottleNoiseTexture();

  const bodyPoints = useMemo(() => {
    const pts = [];
    pts.push(new THREE.Vector2(0, -3));

    for (let i = 0; i <= 10; i++) {
      const a = (i / 10) * Math.PI / 2;
      pts.push(new THREE.Vector2(2.0 - 0.2 * Math.cos(a), -3 + 0.2 * Math.sin(a)));
    }

    pts.push(new THREE.Vector2(2.0, 1.5));

    for (let i = 0; i <= 15; i++) {
      const t = i / 15;
      const x = Math.pow(1 - t, 3) * 2.0 + 3 * Math.pow(1 - t, 2) * t * 2.0 + 3 * (1 - t) * t * t * 1.6 + Math.pow(t, 3) * 1.4;
      const y = Math.pow(1 - t, 3) * 1.5 + 3 * Math.pow(1 - t, 2) * t * 1.8 + 3 * (1 - t) * t * t * 2.0 + Math.pow(t, 3) * 2.1;
      pts.push(new THREE.Vector2(x, y));
    }

    for (let i = 1; i <= 15; i++) {
      const t = i / 15;
      const x = Math.pow(1 - t, 3) * 1.4 + 3 * Math.pow(1 - t, 2) * t * 1.2 + 3 * (1 - t) * t * t * 1.15 + Math.pow(t, 3) * 1.15;
      const y = Math.pow(1 - t, 3) * 2.1 + 3 * Math.pow(1 - t, 2) * t * 2.2 + 3 * (1 - t) * t * t * 2.4 + Math.pow(t, 3) * 2.55;
      pts.push(new THREE.Vector2(x, y));
    }

    for (let i = 0; i <= 10; i++) {
      const a = (i / 10) * Math.PI;
      pts.push(new THREE.Vector2(1.15 + 0.05 * Math.sin(a), 2.6 - 0.05 * Math.cos(a)));
    }

    pts.push(new THREE.Vector2(1.15, 3.4));
    pts.push(new THREE.Vector2(0, 3.4));
    return pts;
  }, []);

  const geometry = useMemo(() => new THREE.LatheGeometry(bodyPoints, 64), [bodyPoints]);

  return (
    <group {...props}>
      <mesh castShadow receiveShadow geometry={geometry}>
        <meshStandardMaterial
          color={product.color}
          roughness={0.8}
          metalness={0.1}
          bumpMap={noiseTexture}
          bumpScale={0.008}
        />
      </mesh>

      <mesh position={[0, -0.65, 0]} rotation={[0, Math.PI, 0]}>
        <cylinderGeometry args={[2.005, 2.005, 4.3, 64]} />
        <meshStandardMaterial
          map={labelTexture}
          roughness={0.7}
          metalness={0.1}
          transparent
          alphaTest={0.05}
        />
      </mesh>

      <group position={[0, 2.66, 0]}>
        <mesh castShadow receiveShadow position={[0, 0.04, 0]}>
          <cylinderGeometry args={[1.24, 1.24, 0.08, 64]} />
          <meshStandardMaterial color="#e0e0e0" roughness={0.3} metalness={0.8} />
        </mesh>

        <mesh castShadow receiveShadow position={[0, 0.38, 0]}>
          <cylinderGeometry args={[1.2, 1.2, 0.6, 64]} />
          <meshStandardMaterial
            color="#e0e0e0"
            roughness={0.3}
            metalness={0.8}
            bumpMap={capRidges}
            bumpScale={0.05}
          />
        </mesh>

        <mesh castShadow receiveShadow position={[0, 0.38, 0]}>
          <cylinderGeometry args={[1.23, 1.23, 0.06, 64]} />
          <meshStandardMaterial color={product.color} roughness={0.4} metalness={0.2} />
        </mesh>

        <mesh castShadow receiveShadow position={[0, 0.72, 0]}>
          <cylinderGeometry args={[1.24, 1.24, 0.08, 64]} />
          <meshStandardMaterial color="#e0e0e0" roughness={0.3} metalness={0.8} />
        </mesh>

        <mesh castShadow receiveShadow position={[0, 0.785, 0]}>
          <cylinderGeometry args={[1.18, 1.24, 0.05, 64]} />
          <meshStandardMaterial color="#e0e0e0" roughness={0.3} metalness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

// --- Main Components ---

export function AshwagandhaBottle({ product, ...props }: any) {
  const labelTexture = useLabelTexture(product.name, product.color);
  const capRidges = useCapRidgesTexture();
  const noiseTexture = useBottleNoiseTexture();

  const bodyPoints = useMemo(() => {
    const pts = [];
    pts.push(new THREE.Vector2(0, -3));
    for (let i = 0; i <= 10; i++) {
      const a = (i / 10) * Math.PI / 2;
      pts.push(new THREE.Vector2(2.0 - 0.2 * Math.cos(a), -3 + 0.2 * Math.sin(a)));
    }
    pts.push(new THREE.Vector2(2.0, 1.5));
    for (let i = 0; i <= 15; i++) {
      const a = (i / 15) * Math.PI / 2;
      pts.push(new THREE.Vector2(2.0 - 0.8 * (1 - Math.cos(a)), 1.5 + 0.8 * Math.sin(a)));
    }
    pts.push(new THREE.Vector2(1.2, 2.8));
    pts.push(new THREE.Vector2(1.3, 2.8));
    pts.push(new THREE.Vector2(1.3, 2.9));
    pts.push(new THREE.Vector2(1.2, 2.9));
    pts.push(new THREE.Vector2(1.2, 3.2));
    pts.push(new THREE.Vector2(0, 3.2));
    return pts;
  }, []);

  const capPoints = useMemo(() => {
    const pts = [];
    pts.push(new THREE.Vector2(1.3, 0));
    pts.push(new THREE.Vector2(1.3, 0.1));
    pts.push(new THREE.Vector2(1.25, 0.1));
    pts.push(new THREE.Vector2(1.25, 0.8));
    pts.push(new THREE.Vector2(1.2, 0.9));
    pts.push(new THREE.Vector2(0, 0.9));
    return pts;
  }, []);

  const geometry = useMemo(() => new THREE.LatheGeometry(bodyPoints, 64), [bodyPoints]);
  const capGeometry = useMemo(() => new THREE.LatheGeometry(capPoints, 64), [capPoints]);

  return (
    <group {...props}>
      <mesh castShadow receiveShadow geometry={geometry}>
        <meshStandardMaterial
          color={product.color}
          roughness={0.8}
          metalness={0.1}
          bumpMap={noiseTexture}
          bumpScale={0.008}
        />
      </mesh>

      <mesh position={[0, -0.65, 0]} rotation={[0, Math.PI, 0]}>
        <cylinderGeometry args={[2.005, 2.005, 4.3, 64]} />
        <meshStandardMaterial
          map={labelTexture}
          roughness={0.7}
          metalness={0.1}
          transparent={true}
          alphaTest={0.05}
        />
      </mesh>

      <group position={[0, 2.5, 0]}>
        <mesh castShadow receiveShadow geometry={capGeometry}>
          <meshStandardMaterial
            color="#e0e0e0"
            roughness={0.3}
            metalness={0.8}
            bumpMap={capRidges}
            bumpScale={0.05}
          />
        </mesh>
      </group>
    </group>
  );
}

function TransformingBottle({ products, activeIndex, scrollProgressRef, manualRotationRef, cardRefs, cardRotationsRef }: any) {
  const bottleRefs = useRef<THREE.Group[]>([]);
  const { viewport, size } = useThree();
  const isMobile = viewport.width < viewport.height;

  useFrame((state, delta) => {
    const scrollProgress = scrollProgressRef?.current || 0;
    const mobileDetailX = viewport.width * 0.54;
    const mobileDetailY = -viewport.height * 0.08;
    const mobileHeroScale = 0.8;
    const mobileDetailScale = 1.02;

    let mainTargetX = 0;
    let mainTargetY = 0;
    let mainTargetScale = 1;
    let mainTargetScrollRotation = 0;

    if (scrollProgress <= 1) {
      mainTargetScrollRotation = scrollProgress * (Math.PI / 6);
      if (isMobile) {
        mainTargetX = scrollProgress * mobileDetailX;
        mainTargetY = scrollProgress * mobileDetailY;
        mainTargetScale = mobileHeroScale + scrollProgress * (mobileDetailScale - mobileHeroScale);
      } else {
        mainTargetX = scrollProgress * -3.5;
        mainTargetY = scrollProgress * 0.8;
        mainTargetScale = 1 + scrollProgress * 0.1;
      }
    } else if (scrollProgress <= 2) {
      const p2 = scrollProgress - 1;
      mainTargetScrollRotation = (Math.PI / 6) + p2 * (Math.PI * 0.5);
      if (isMobile) {
        mainTargetX = mobileDetailX;
        mainTargetY = mobileDetailY;
        mainTargetScale = mobileDetailScale;
      } else {
        mainTargetX = -3.5;
        mainTargetY = 0.8;
        mainTargetScale = 1.1;
      }
    } else if (scrollProgress <= 3) {
      const p3 = scrollProgress - 2;
      mainTargetScrollRotation = (Math.PI * 2 / 3) + p3 * (Math.PI * 2 / 3);
      if (isMobile) {
        mainTargetX = mobileDetailX;
        mainTargetY = mobileDetailY;
        mainTargetScale = mobileDetailScale;
      } else {
        mainTargetX = -3.5;
        mainTargetY = 0.8;
        mainTargetScale = 1.1;
      }
    } else {
      mainTargetScrollRotation = (Math.PI * 2 / 3) + 1 * (Math.PI * 2 / 3);
      if (isMobile) {
        mainTargetX = mobileDetailX;
        mainTargetY = mobileDetailY;
        mainTargetScale = mobileDetailScale;
      } else {
        mainTargetX = -3.5;
        mainTargetY = 0.8;
        mainTargetScale = 1.1;
      }
    }

    const safeIndex = ((activeIndex % products.length) + products.length) % products.length;

    products.forEach((prod: any, i: number) => {
      const bottle = bottleRefs.current[i];
      if (!bottle) return;

      const isActive = i === safeIndex;

      let targetX = mainTargetX;
      let targetY = mainTargetY;
      let targetScale = isActive ? mainTargetScale : 0.001;
      let targetRotationY = (isActive ? activeIndex * Math.PI * 2 : 0) + mainTargetScrollRotation + (manualRotationRef?.current || 0);
      let targetRotationZ = 0;

      if (isActive && scrollProgress <= 3) {
        const currentRot = bottle.rotation.y - mainTargetScrollRotation - (manualRotationRef?.current || 0);
        const normalizedRot = currentRot / (Math.PI * 2);
        const distToInteger = Math.abs(normalizedRot - Math.round(normalizedRot));
        const transitionProgress = Math.sin(distToInteger * Math.PI);

        targetScale += transitionProgress * 0.12;
        targetY += transitionProgress * 0.5;

        const spinDirection = Math.sign((activeIndex * Math.PI * 2) - currentRot) || 1;
        targetRotationZ = transitionProgress * 0.15 * spinDirection;
      }

      if (scrollProgress > 3) {
        const p4 = Math.min(scrollProgress - 3, 1);
        const easeP4 = 1 - Math.pow(1 - p4, 3);

        const cardEl = cardRefs?.current?.[i];

        if (cardEl) {
          const rect = cardEl.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          const x_ndc = (centerX / size.width) * 2 - 1;
          const y_ndc = -(centerY / size.height) * 2 + 1;

          const cardTargetX = x_ndc * (viewport.width / 2);
          const cardTargetY = (y_ndc * (viewport.height / 2)) + 1; // +1 to counteract the group's [0, -1, 0] position
          const cardTargetScale = isMobile ? 0.255 : 0.315;

          targetX = THREE.MathUtils.lerp(targetX, cardTargetX, easeP4);
          targetY = THREE.MathUtils.lerp(targetY, cardTargetY, easeP4);

          if (isActive) {
            targetScale = THREE.MathUtils.lerp(targetScale, cardTargetScale, easeP4);
          } else {
            targetScale = THREE.MathUtils.lerp(0.001, cardTargetScale, easeP4);
            if (easeP4 < 1) {
              targetY -= (1 - easeP4) * 3;
            }
          }

          const cardRot = cardRotationsRef?.current?.[i] || 0;
          const baseCardRot = cardRot; // No automatic rotation
          targetRotationY = THREE.MathUtils.lerp(targetRotationY, baseCardRot, easeP4);
          targetRotationZ = THREE.MathUtils.lerp(targetRotationZ, 0, easeP4);

        }
      }

      if (scrollProgress >= 5) {
        targetScale = 0.001;
      }

      bottle.position.x = THREE.MathUtils.damp(bottle.position.x, targetX, 6, delta);
      bottle.position.y = THREE.MathUtils.damp(bottle.position.y, targetY, 6, delta);
      bottle.scale.setScalar(THREE.MathUtils.damp(bottle.scale.x, targetScale, 6, delta));
      bottle.rotation.y = THREE.MathUtils.damp(bottle.rotation.y, targetRotationY, 6, delta);
      bottle.rotation.z = THREE.MathUtils.damp(bottle.rotation.z, targetRotationZ, 5, delta);

      bottle.visible = bottle.scale.x > 0.005;
    });
  });

  return (
    <group>
      {products.map((product: any, i: number) => (
        <group key={product.id || i} ref={(el) => { if (el) bottleRefs.current[i] = el; }}>
          <ModernSupplementBottle product={product} visible={true} />
        </group>
      ))}
    </group>
  );
}

function AccentGlow({ activeColor, scrollProgressRef }: { activeColor: string, scrollProgressRef: any }) {
  const glowRef = useRef<THREE.Sprite>(null);
  const outerGlowRef = useRef<THREE.Sprite>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const materialRef = useRef<THREE.SpriteMaterial>(null);
  const outerMaterialRef = useRef<THREE.SpriteMaterial>(null);
  const texture = useGlowTexture();
  const { viewport } = useThree();
  const isMobile = viewport.width < viewport.height;

  useFrame((state, delta) => {
    if (!glowRef.current || !outerGlowRef.current || !materialRef.current || !outerMaterialRef.current || !lightRef.current) return;
    const scrollProgress = scrollProgressRef?.current || 0;
    const mobileDetailX = viewport.width * 0.54;
    const mobileDetailY = -viewport.height * 0.08;

    let targetX = 0;
    let targetY = 0;

    if (scrollProgress <= 1) {
      if (isMobile) {
        targetX = scrollProgress * mobileDetailX;
        targetY = scrollProgress * mobileDetailY;
      } else {
        targetX = scrollProgress * -3.5;
        targetY = scrollProgress * 0.8;
      }
    } else {
      if (isMobile) {
        targetX = mobileDetailX;
        targetY = mobileDetailY;
      } else {
        targetX = -3.5;
        targetY = 0.8;
      }
    }

    const fadeIn = THREE.MathUtils.clamp((scrollProgress - 0.12) / 0.55, 0, 1);
    const fadeOut = THREE.MathUtils.clamp(1 - Math.max(scrollProgress - 3, 0), 0, 1);
    const intensity = fadeIn * fadeOut;
    const pulse = 1 + Math.sin(state.clock.getElapsedTime() * 2.1) * 0.06;
    const innerScaleBase = isMobile ? 7.2 : 9.4;
    const outerScaleBase = isMobile ? 10.8 : 14.2;
    const xOffset = isMobile ? -0.45 : -1.15;
    const yOffset = isMobile ? -0.15 : -0.05;

    glowRef.current.position.x = THREE.MathUtils.damp(glowRef.current.position.x, targetX + xOffset, 6, delta);
    glowRef.current.position.y = THREE.MathUtils.damp(glowRef.current.position.y, targetY + yOffset, 6, delta);
    glowRef.current.position.z = -2.6;

    outerGlowRef.current.position.x = glowRef.current.position.x;
    outerGlowRef.current.position.y = glowRef.current.position.y;
    outerGlowRef.current.position.z = -3.2;

    const innerTargetScaleX = innerScaleBase * pulse * (1 + intensity * 0.22);
    const innerTargetScaleY = innerScaleBase * pulse * (0.62 + intensity * 0.12);
    const outerTargetScaleX = outerScaleBase * pulse * (1.08 + intensity * 0.28);
    const outerTargetScaleY = outerScaleBase * pulse * (0.68 + intensity * 0.14);
    glowRef.current.scale.x = THREE.MathUtils.damp(glowRef.current.scale.x, innerTargetScaleX, 6, delta);
    glowRef.current.scale.y = THREE.MathUtils.damp(glowRef.current.scale.y, innerTargetScaleY, 6, delta);
    outerGlowRef.current.scale.x = THREE.MathUtils.damp(outerGlowRef.current.scale.x, outerTargetScaleX, 6, delta);
    outerGlowRef.current.scale.y = THREE.MathUtils.damp(outerGlowRef.current.scale.y, outerTargetScaleY, 6, delta);

    const glowColor = new THREE.Color(activeColor);
    materialRef.current.color.lerp(glowColor, 0.12);
    materialRef.current.opacity = THREE.MathUtils.damp(materialRef.current.opacity, 0.5 * intensity, 5, delta);
    materialRef.current.rotation = THREE.MathUtils.damp(materialRef.current.rotation, -0.22, 5, delta);
    outerMaterialRef.current.color.lerp(glowColor, 0.12);
    outerMaterialRef.current.opacity = THREE.MathUtils.damp(outerMaterialRef.current.opacity, 0.26 * intensity, 5, delta);
    outerMaterialRef.current.rotation = THREE.MathUtils.damp(outerMaterialRef.current.rotation, 0.18, 5, delta);

    lightRef.current.color.lerp(glowColor, 0.12);
    lightRef.current.position.x = glowRef.current.position.x;
    lightRef.current.position.y = glowRef.current.position.y;
    lightRef.current.position.z = -1.8;
    lightRef.current.intensity = THREE.MathUtils.damp(lightRef.current.intensity, 1.8 * intensity, 4, delta);
  });

  return (
    <>
      <sprite ref={outerGlowRef} position={[0, 0, -3.2]} scale={[0.001, 0.001, 1]}>
        <spriteMaterial
          ref={outerMaterialRef}
          map={texture || undefined}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </sprite>
      <sprite ref={glowRef} position={[0, 0, -2.6]} scale={[0.001, 0.001, 1]}>
        <spriteMaterial
          ref={materialRef}
          map={texture || undefined}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </sprite>
      <pointLight ref={lightRef} position={[0, 0, -1.8]} intensity={0} distance={16} decay={1.55} color={activeColor} />
    </>
  );
}

function Pill({ position, rotation, color, scale = 1, scrollProgressRef, isFollower, activeIndex, isMobile, viewport }: any) {
  const ref = useRef<THREE.Group>(null);
  const initialX = position[0];
  const initialY = position[1];
  const randomOffset = useMemo(() => Math.random() * 100, []);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);

  const prevIndex = useRef(activeIndex);
  const burst = useRef(0);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const scrollProgress = scrollProgressRef?.current || 0;

    if (prevIndex.current !== activeIndex) {
      burst.current = 1;
      prevIndex.current = activeIndex;
    }

    burst.current = THREE.MathUtils.damp(burst.current, 0, 4, delta);

    // Float animation
    const t = state.clock.getElapsedTime() + randomOffset;
    const floatY = Math.sin(t * 1.5) * 0.3;
    const floatX = Math.cos(t * 1.2) * 0.2;

    let currentTargetX = initialX;
    let currentTargetY = initialY;
    let targetScale = scale;

    if (isFollower) {
      const p1 = Math.min(scrollProgress, 1);
      const bottleTargetX = isMobile ? (viewport.width * 0.4) : -3.5;
      const bottleTargetY = isMobile ? (-viewport.height * 0.35) : 0.8;

      const offsetX = (initialX > 0 ? 1.5 : -1.5) * (isMobile ? 0.8 : 1);
      const offsetY = (initialY > 0 ? 1.5 : -1.5) * (isMobile ? 0.8 : 1);

      currentTargetX = initialX + p1 * (bottleTargetX + offsetX - initialX);
      currentTargetY = initialY + p1 * (bottleTargetY + offsetY - initialY);

      // Fade out follower pills in section 4
      const p4 = Math.max(0, Math.min(scrollProgress - 3, 1));
      targetScale = scale * (1 + burst.current * 0.5) * (1 - p4);

      if (p4 > 0) {
        currentTargetY += p4 * 5; // Move up and away
      }
    } else {
      const scrollYOffset = scrollProgress * 15;
      currentTargetX = initialX;
      currentTargetY = initialY + scrollYOffset;

      const p4 = Math.max(0, Math.min(scrollProgress - 3, 1));
      targetScale = Math.max(0, 1 - scrollProgress * 1.5) * scale * (1 + burst.current * 0.5) * (1 - p4);
    }

    // Add burst outward effect
    currentTargetX += burst.current * (initialX * 0.3);
    currentTargetY += burst.current * (initialY * 0.3);

    ref.current.position.x = currentTargetX + floatX;
    ref.current.position.y = currentTargetY + floatY;

    ref.current.scale.setScalar(THREE.MathUtils.damp(ref.current.scale.x, targetScale, 8, delta));

    // Gentle rotation + burst spin
    ref.current.rotation.x += delta * (0.2 + burst.current * 5);
    ref.current.rotation.y += delta * (0.3 + burst.current * 5);

    // Smooth color transition
    if (materialRef.current) {
      materialRef.current.color.lerp(new THREE.Color(color), 0.1);
    }
  });

  return (
    <group ref={ref} position={position} rotation={rotation} scale={scale}>
      <mesh castShadow receiveShadow>
        <capsuleGeometry args={[0.2, 0.6, 16, 16]} />
        <meshPhysicalMaterial ref={materialRef} color={color} roughness={0.2} metalness={0.1} clearcoat={0.8} />
      </mesh>
    </group>
  );
}

function FloatingPills({ activeColor, activeIndex, scrollProgressRef }: { activeColor: string, activeIndex: number, scrollProgressRef: any }) {
  const { viewport } = useThree();
  const isMobile = viewport.width < viewport.height;

  const pills = useMemo(() => {
    const pillCount = isMobile ? 25 : 50;
    return Array.from({ length: pillCount }).map((_, i) => {
      const isFollower = i < 3;
      const angle = isFollower ? (i === 0 ? Math.PI / 4 : i === 1 ? Math.PI * 1.25 : Math.PI * 0.75) : (i / pillCount) * Math.PI * 2;
      const radius = isFollower ? 3 : 3.5 + Math.random() * 6;
      return {
        id: i,
        isFollower,
        position: [
          Math.cos(angle) * radius,
          isFollower ? (i === 0 ? 2 : i === 1 ? -2 : 0) : (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 8 - 4
        ] as [number, number, number],
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ] as [number, number, number],
        scale: 0.3 + Math.random() * 0.6
      };
    });
  }, [isMobile]);

  return (
    <group>
      {pills.map(pill => (
        <Pill
          key={pill.id}
          position={pill.position}
          rotation={pill.rotation}
          scale={pill.scale}
          color={activeColor}
          activeIndex={activeIndex}
          isFollower={pill.isFollower}
          isMobile={isMobile}
          viewport={viewport}
          scrollProgressRef={scrollProgressRef}
        />
      ))}
    </group>
  );
}

function BulkPill({ position, rotation, isAccent, scale, speed, offset, scrollProgressRef, activeColor }: any) {
  const ref = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const scrollProgress = scrollProgressRef?.current || 0;

    const p6 = Math.max(0, Math.min(scrollProgress - 5, 1));

    const t = state.clock.getElapsedTime() * speed + offset;

    // Float animation
    const floatY = Math.sin(t) * 1.5;
    const floatX = Math.cos(t * 0.8) * 1.5;

    // Fall down effect when entering section 6
    const startY = position[1] + 20;
    const targetY = position[1] + floatY;

    ref.current.position.x = position[0] + floatX;
    ref.current.position.y = THREE.MathUtils.lerp(startY, targetY, p6);

    const targetScale = p6 > 0.1 ? scale : 0.001;
    ref.current.scale.setScalar(THREE.MathUtils.damp(ref.current.scale.x, targetScale, 6, delta));

    ref.current.rotation.x += delta * speed;
    ref.current.rotation.y += delta * speed * 1.2;

    if (materialRef.current) {
      const targetColor = isAccent ? activeColor : '#ffffff';
      materialRef.current.color.lerp(new THREE.Color(targetColor), 0.1);
    }
  });

  return (
    <group ref={ref} position={position} rotation={rotation} scale={scale}>
      <mesh castShadow receiveShadow>
        <capsuleGeometry args={[0.2, 0.6, 16, 16]} />
        <meshPhysicalMaterial ref={materialRef} roughness={0.2} metalness={0.1} clearcoat={0.8} />
      </mesh>
    </group>
  );
}

function BulkPills({ scrollProgressRef, activeColor }: any) {
  const { viewport } = useThree();
  const isMobile = viewport.width < viewport.height;

  const pills = useMemo(() => {
    return Array.from({ length: isMobile ? 20 : 40 }).map((_, i) => {
      return {
        id: i,
        isAccent: Math.random() > 0.5,
        position: [
          (Math.random() - 0.5) * (isMobile ? 12 : 25),
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 10 - 2
        ] as [number, number, number],
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ] as [number, number, number],
        scale: 0.3 + Math.random() * 0.5,
        speed: 0.5 + Math.random() * 1.5,
        offset: Math.random() * 100
      };
    });
  }, [isMobile]);

  return (
    <group>
      {pills.map(pill => (
        <BulkPill
          key={pill.id}
          {...pill}
          scrollProgressRef={scrollProgressRef}
          activeColor={activeColor}
        />
      ))}
    </group>
  );
}

function FlyingBottle({ event, onComplete }: any) {
  const ref = useRef<THREE.Group>(null);
  const { viewport, size } = useThree();
  const startTime = useRef(-1);

  // Smooth, visible duration in seconds
  const DURATION = 1.6;

  const [startPos] = useState(() => {
    if (event.x && event.y) {
      const x_ndc = (event.x / size.width) * 2 - 1;
      const y_ndc = -(event.y / size.height) * 2 + 1;
      return new THREE.Vector3(
        x_ndc * (viewport.width / 2),
        y_ndc * (viewport.height / 2),
        2
      );
    }
    return new THREE.Vector3(0, 0, 2);
  });

  const targetPos = useMemo(() => {
    const isMobile = size.width < size.height;
    const xOffset = isMobile ? 30 : 60;
    const yOffset = isMobile ? 30 : 60;
    const x_ndc = (size.width - xOffset) / size.width * 2 - 1;
    const y_ndc = -(yOffset) / size.height * 2 + 1;
    return new THREE.Vector3(
      x_ndc * (viewport.width / 2),
      y_ndc * (viewport.height / 2),
      -1
    );
  }, [viewport, size]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    
    if (startTime.current === -1) {
      startTime.current = state.clock.getElapsedTime();
    }
    
    const elapsed = state.clock.getElapsedTime() - startTime.current;
    const progress = Math.min(elapsed / DURATION, 1);
    
    if (progress >= 1) {
      onComplete(event.id);
      return;
    }

    // Smooth easing (Ease in-out quad)
    const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    // Add a beautiful arc to the flight path
    const arcHeight = 3.5;
    const currentYOffset = Math.sin(progress * Math.PI) * arcHeight;

    const currentX = THREE.MathUtils.lerp(startPos.x, targetPos.x, ease);
    const baseY = THREE.MathUtils.lerp(startPos.y, targetPos.y, ease);
    const currentZ = THREE.MathUtils.lerp(startPos.z, targetPos.z, ease);

    ref.current.position.set(currentX, baseY + currentYOffset, currentZ);
    
    // Spin gracefully and slowly
    ref.current.rotation.y += delta * 6;
    ref.current.rotation.x += delta * 3.5;
    ref.current.rotation.z += delta * 2.5;
    
    // Entrance / Exit scaling
    if (progress > 0.7) {
      // Shrink into the cart
      const shrinkProgress = (progress - 0.7) / 0.3; 
      const easeShrink = shrinkProgress * shrinkProgress;
      const scale = THREE.MathUtils.lerp(0.3, 0.001, easeShrink);
      ref.current.scale.setScalar(scale);
    } else {
      // Pop in softly at the start
      const growProgress = Math.min(progress / 0.15, 1);
      const easeGrow = 1 - Math.pow(1 - growProgress, 3);
      ref.current.scale.setScalar(0.3 * easeGrow);
    }
  });

  return (
    <group ref={ref} position={startPos} scale={0}>
      <pointLight color={event.product.color} intensity={1.5} distance={8} />
      <group rotation={[Math.PI / 4, 0, 0]}>
         <ModernSupplementBottle product={event.product} />
      </group>
    </group>
  );
}

function FlySystem({ addEvents }: { addEvents: any[] }) {
  const [active, setActive] = useState<any[]>([]);
  const lastEventId = useRef<string | null>(null);

  useEffect(() => {
    if (!addEvents || addEvents.length === 0) return;
    const latest = addEvents[addEvents.length - 1];
    if (latest.id !== lastEventId.current) {
      lastEventId.current = latest.id;
      setActive(prev => [...prev, latest]);
    }
  }, [addEvents]);

  const handleComplete = (id: string) => {
    setActive(prev => prev.filter(c => c.id !== id));
  };

  return (
    <group>
      {active.map(clone => (
        <FlyingBottle key={clone.id} event={clone} onComplete={handleComplete} />
      ))}
    </group>
  );
}

export function BottleScene({ products, activeIndex, currentSection, scrollProgressRef, manualRotationRef, cardRefs, cardRotationsRef, addEvents }: any) {
  const safeIndex = ((activeIndex % products.length) + products.length) % products.length;
  const activeColor = products[safeIndex].color;

  return (
    <div
      className="absolute inset-0 pointer-events-none transition-opacity duration-500 ease-out"
      style={{ opacity: currentSection === 5 ? 0 : 1 }}
    >
      <Canvas camera={{ position: [0, 0, 18], fov: 30 }} shadows style={{ pointerEvents: 'none' }}>
        <ambientLight intensity={1.2} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={5} castShadow shadow-bias={-0.0001} />
        <directionalLight position={[-10, 0, -10]} intensity={2} color="#ffffff" />

        <Suspense fallback={<CanvasLoader />}>
          <Environment preset="city" />
          <FastEnvironment />
          <AccentGlow activeColor={activeColor} scrollProgressRef={scrollProgressRef} />

          <FloatingPills activeColor={activeColor} activeIndex={activeIndex} scrollProgressRef={scrollProgressRef} />
          <BulkPills scrollProgressRef={scrollProgressRef} activeColor={activeColor} />
          
          <FlySystem addEvents={addEvents} />

          <group position={[0, -1, 0]}>
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
              <TransformingBottle products={products} activeIndex={activeIndex} scrollProgressRef={scrollProgressRef} manualRotationRef={manualRotationRef} cardRefs={cardRefs} cardRotationsRef={cardRotationsRef} />
            </Float>
            <ContactShadows position={[0, -3, 0]} opacity={0.5} scale={20} blur={2} far={4} />
          </group>
        </Suspense>
      </Canvas>
    </div>
  );
}
