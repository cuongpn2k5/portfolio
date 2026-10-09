import * as THREE from 'three';
import type { ProfileData } from '../../types';

/**
 * Creates high-resolution textures for the ID card (Front & Back)
 * matching the minimalist reference:
 * - Portrait-oriented ID card
 * - White rounded border
 * - Large black-and-white portrait photo area
 * - Subtle, refined typography (Phan Nhat Cuong, Full-stack Developer)
 */
export function createIDCardTextures(profile: ProfileData) {
  // ── 1. FRONT CARD TEXTURE ──────────────────────────────────────────────
  const frontCanvas = document.createElement('canvas');
  frontCanvas.width = 1024;
  frontCanvas.height = 1536;
  const ctx = frontCanvas.getContext('2d')!;

  // Smooth antialiased card base (clean white / off-white)
  ctx.fillStyle = '#f8f8fa';
  ctx.fillRect(0, 0, 1024, 1536);

  // Outer border with subtle corner radius styling
  ctx.strokeStyle = '#d6d6e0';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(14, 14, 996, 1508, 48);
  ctx.stroke();

  // Top Punch Hole (for metal strap clip)
  ctx.fillStyle = '#18181f';
  ctx.beginPath();
  ctx.roundRect(472, 36, 80, 22, 11);
  ctx.fill();

  // ── Large Black-and-White Portrait Photo Area ──
  // Roughly 86% of the unchanged 1024 × 1536 front, with a thin white frame.
  const photoX = 24;
  const photoY = 68;
  const photoW = 976;
  const photoH = 1384;
  const photoRadius = 28;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(photoX, photoY, photoW, photoH, photoRadius);
  ctx.clip();

  // Deep monochrome studio backdrop
  const studioGrad = ctx.createLinearGradient(photoX, photoY, photoX, photoY + photoH);
  studioGrad.addColorStop(0, '#101014');
  studioGrad.addColorStop(0.5, '#181820');
  studioGrad.addColorStop(1, '#0c0c10');
  ctx.fillStyle = studioGrad;
  ctx.fillRect(photoX, photoY, photoW, photoH);

  // Subtle spotlight vignette behind subject
  const spotGrad = ctx.createRadialGradient(
    photoX + photoW / 2,
    photoY + photoH * 0.45,
    60,
    photoX + photoW / 2,
    photoY + photoH * 0.45,
    420
  );
  spotGrad.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
  spotGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.05)');
  spotGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = spotGrad;
  ctx.fillRect(photoX, photoY, photoW, photoH);

  // High-contrast artistic monochrome portrait silhouette / illustration
  const centerX = photoX + photoW / 2;
  const bustY = photoY + photoH;

  // Shoulders & Torso (monochrome dark garment)
  ctx.fillStyle = '#141418';
  ctx.beginPath();
  ctx.moveTo(centerX - 360, bustY);
  ctx.bezierCurveTo(centerX - 330, bustY - 260, centerX - 180, bustY - 340, centerX - 110, bustY - 360);
  ctx.lineTo(centerX + 110, bustY - 360);
  ctx.bezierCurveTo(centerX + 180, bustY - 340, centerX + 330, bustY - 260, centerX + 360, bustY);
  ctx.closePath();
  ctx.fill();

  // Rim light on shoulders
  ctx.strokeStyle = 'rgba(240, 240, 255, 0.45)';
  ctx.lineWidth = 6;
  ctx.stroke();

  // Neck
  ctx.fillStyle = '#2c2c36';
  ctx.beginPath();
  ctx.roundRect(centerX - 68, bustY - 440, 136, 110, 16);
  ctx.fill();

  // Head / Jaw silhouette
  ctx.fillStyle = '#3a3a48';
  ctx.beginPath();
  ctx.ellipse(centerX, bustY - 500, 140, 175, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair & Facial Structure in stylized B&W rim lighting
  ctx.fillStyle = '#181820';
  ctx.beginPath();
  ctx.ellipse(centerX, bustY - 540, 145, 145, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // Elegant rim lighting across facial contour
  const faceGrad = ctx.createLinearGradient(centerX - 130, bustY - 600, centerX + 130, bustY - 400);
  faceGrad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
  faceGrad.addColorStop(0.35, 'rgba(200, 200, 220, 0.1)');
  faceGrad.addColorStop(0.7, 'rgba(50, 50, 60, 0.05)');
  faceGrad.addColorStop(1, 'rgba(20, 20, 25, 0.8)');
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.ellipse(centerX, bustY - 500, 136, 170, 0, 0, Math.PI * 2);
  ctx.fill();

  // Stylized glasses / developer aesthetic
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.roundRect(centerX - 110, bustY - 520, 96, 58, 14);
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(centerX + 14, bustY - 520, 96, 58, 14);
  ctx.stroke();
  // Bridge
  ctx.beginPath();
  ctx.moveTo(centerX - 14, bustY - 495);
  ctx.lineTo(centerX + 14, bustY - 495);
  ctx.stroke();

  // Clean photo inner border
  ctx.restore();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(photoX, photoY, photoW, photoH, photoRadius);
  ctx.stroke();

  // ── Lower Info Section (Clean & Minimalist Typography) ──
  // Name
  ctx.textAlign = 'center';
  ctx.fillStyle = '#111116';
  ctx.font = '600 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.letterSpacing = '1.5px';
  ctx.fillText(profile.name.toUpperCase(), 512, 1485, photoW);

  // Role
  ctx.fillStyle = '#444452';
  ctx.font = '500 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.letterSpacing = '1px';
  ctx.fillText(profile.role.toUpperCase(), 512, 1512, photoW);

  // ── 2. BACK CARD TEXTURE ───────────────────────────────────────────────
  const backCanvas = document.createElement('canvas');
  backCanvas.width = 1024;
  backCanvas.height = 1536;
  const bCtx = backCanvas.getContext('2d')!;

  bCtx.fillStyle = '#f8f8fa';
  bCtx.fillRect(0, 0, 1024, 1536);

  // Card border
  bCtx.strokeStyle = '#d6d6e0';
  bCtx.lineWidth = 14;
  bCtx.beginPath();
  bCtx.roundRect(14, 14, 996, 1508, 48);
  bCtx.stroke();

  // Top Punch Hole
  bCtx.fillStyle = '#18181f';
  bCtx.beginPath();
  bCtx.roundRect(472, 36, 80, 22, 11);
  bCtx.fill();

  // Magnetic Stripe
  bCtx.fillStyle = '#181820';
  bCtx.fillRect(14, 110, 996, 160);

  // Monogram / Logo
  bCtx.textAlign = 'center';
  bCtx.fillStyle = '#22222a';
  bCtx.font = 'bold 72px sans-serif';
  bCtx.letterSpacing = '6px';
  bCtx.fillText('P N C', 512, 420);

  bCtx.fillStyle = '#6b6b7a';
  bCtx.font = '600 24px monospace';
  bCtx.letterSpacing = '4px';
  bCtx.fillText('AUTHENTICATED DEVELOPER IDENTIFIER', 512, 475);

  // QR Code Pattern
  const qrX = 362;
  const qrY = 560;
  const qrSize = 300;
  bCtx.fillStyle = '#141418';
  bCtx.beginPath();
  bCtx.roundRect(qrX, qrY, qrSize, qrSize, 24);
  bCtx.fill();

  bCtx.fillStyle = '#ffffff';
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (
        (r <= 2 && c <= 2) ||
        (r <= 2 && c >= 6) ||
        (r >= 6 && c <= 2) ||
        (r + c) % 2 === 0
      ) {
        bCtx.fillRect(qrX + 34 + c * 26, qrY + 34 + r * 26, 20, 20);
      }
    }
  }

  bCtx.fillStyle = '#555562';
  bCtx.font = '22px sans-serif';
  bCtx.fillText('Scan to view online portfolio repository', 512, 930);

  // Signature Stripe
  bCtx.fillStyle = '#eaeaef';
  bCtx.fillRect(160, 1020, 704, 100);
  bCtx.strokeStyle = '#d4d4de';
  bCtx.lineWidth = 2;
  bCtx.strokeRect(160, 1020, 704, 100);

  bCtx.font = 'italic 38px cursive';
  bCtx.fillStyle = '#1a1a24';
  bCtx.fillText('Phan Nhat Cuong', 512, 1085);

  bCtx.fillStyle = '#8e8e9c';
  bCtx.font = '18px monospace';
  bCtx.fillText('AUTHORIZED SIGNATURE', 512, 1150);

  bCtx.font = '16px monospace';
  bCtx.fillStyle = '#9e9eae';
  bCtx.fillText('ISSUED 2026 • SOFTWARE ENGINEERING STUDENT', 512, 1430);

  // Create Three.js textures
  const frontTexture = new THREE.CanvasTexture(frontCanvas);
  frontTexture.colorSpace = THREE.SRGBColorSpace;
  frontTexture.anisotropy = 8;

  // Load the configured portrait after the initial canvas texture is ready.
  // The placeholder above remains visible while the image is loading or when
  // no portrait has been configured.
  if (profile.portraitUrl) {
    const portrait = new Image();
    portrait.decoding = 'async';
    portrait.onload = () => {
      const scale = Math.max(
        photoW / portrait.naturalWidth,
        photoH / portrait.naturalHeight
      );
      const width = portrait.naturalWidth * scale;
      const height = portrait.naturalHeight * scale;
      const x = photoX + (photoW - width) / 2;
      const y = photoY + (photoH - height) / 2;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(photoX, photoY, photoW, photoH, photoRadius);
      ctx.clip();
      ctx.filter = 'grayscale(100%) contrast(1.06)';
      ctx.drawImage(portrait, x, y, width, height);
      ctx.filter = 'none';

      // Keep a subtle vignette so the photo matches the card's monochrome style.
      const vignette = ctx.createRadialGradient(
        photoX + photoW / 2,
        photoY + photoH * 0.46,
        photoW * 0.18,
        photoX + photoW / 2,
        photoY + photoH * 0.46,
        photoW * 0.7
      );
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.28)');
      ctx.fillStyle = vignette;
      ctx.fillRect(photoX, photoY, photoW, photoH);
      ctx.restore();

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(photoX, photoY, photoW, photoH, photoRadius);
      ctx.stroke();

      frontTexture.needsUpdate = true;
    };
    portrait.src = profile.portraitUrl;
  }

  const backTexture = new THREE.CanvasTexture(backCanvas);
  backTexture.colorSpace = THREE.SRGBColorSpace;
  backTexture.anisotropy = 8;

  return { frontTexture, backTexture };
}

/**
 * Creates black woven fabric lanyard texture with repeating crisp white "ID CARD"
 * lettering, realistic edge seams, and woven twill micro-textures matching Image 2.
 */
export function createStrapTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d')!;

  // 1. Deep matte black fabric base
  ctx.fillStyle = '#111114';
  ctx.fillRect(0, 0, 512, 2048);

  // 2. High-density woven herringbone / twill fabric texture
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
  ctx.lineWidth = 1.5;
  for (let y = -512; y < 2048 + 512; y += 8) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y + 256);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(512, y);
    ctx.lineTo(0, y + 256);
    ctx.stroke();
  }

  // Horizontal micro-threads
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
  ctx.lineWidth = 1;
  for (let y = 0; y < 2048; y += 4) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // 3. Subtle curved edge shadow (simulating rounded ribbon edge thickness)
  const leftGrad = ctx.createLinearGradient(0, 0, 42, 0);
  leftGrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
  leftGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = leftGrad;
  ctx.fillRect(0, 0, 42, 2048);

  const rightGrad = ctx.createLinearGradient(512 - 42, 0, 512, 0);
  rightGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  rightGrad.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
  ctx.fillStyle = rightGrad;
  ctx.fillRect(512 - 42, 0, 42, 2048);

  // 4. Stitched edge seam lines with realistic needle intervals
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.moveTo(44, 0);
  ctx.lineTo(44, 2048);
  ctx.moveTo(512 - 44, 0);
  ctx.lineTo(512 - 44, 2048);
  ctx.stroke();
  ctx.setLineDash([]);

  // Inner subtle highlight groove next to stitch
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(56, 0);
  ctx.lineTo(56, 2048);
  ctx.moveTo(512 - 56, 0);
  ctx.lineTo(512 - 56, 2048);
  ctx.stroke();

  // 5. Repeating Crisp White "ID CARD" Branding oriented along the length
  // 4 evenly spaced repeats along the 2048px canvas
  const repeatInterval = 512;
  const centerY = 256;

  for (let r = 0; r < 4; r++) {
    const yPos = r * repeatInterval + centerY;

    ctx.save();
    ctx.translate(256, yPos);
    // Rotate -90 degrees so text runs vertically along the ribbon length
    ctx.rotate(-Math.PI / 2);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 52px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif';
    ctx.letterSpacing = '8px';

    // Soft print shadow for realistic fabric ink feel
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;

    // Bold white lettering
    ctx.fillStyle = '#ffffff';
    ctx.fillText('ID CARD', 0, 0);

    // Decorative separator bullet
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(170, 0, 4.5, 0, Math.PI * 2);
    ctx.arc(-170, 0, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  return texture;
}
