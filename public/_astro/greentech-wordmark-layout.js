import { GREENTECH_UNDERLINE } from './greentech-scene-focus.js';

// Reuse the scene's resize lifecycle; no extra listeners or animation loops.
// Both the live wordmark and its reflection keep the same proportional scale.
export class GreentechWordmarkLayout {
  constructor(scene, mirror, { isIOS = false, lines } = {}) {
    this.isIOS = isIOS;
    this.meshes = [scene, mirror]
      .map(root => root?.getObjectByName('logo_GREENTECH'))
      .filter(Boolean)
      .map(mesh => ({ mesh, baseScale: mesh.scale.clone() }));
    this.wordmark = this.meshes[0]?.mesh;
    const line = lines?.blueLine1?.[0];
    const curve = lines?.blueLine1Curves?.[0];
    this.underlineMeshes = line ? [line] : [];
    if (line && curve) {
      // The reflection shares the original tube geometry. Scale both meshes,
      // leaving the curve used by the camera and the tube's 0..1 UVs intact.
      mirror?.traverse(mesh => {
        if (mesh.isMesh && mesh.geometry === line.geometry) this.underlineMeshes.push(mesh);
      });
      this.lineStart = curve.getPoint(0).x;
      this.lineLength = curve.getPoint(1).x - this.lineStart;
      this.lineCenter = curve.getPoint(0);
      this.lineGeometry = line.geometry;
      this.originalLinePositions = line.geometry.getAttribute('position').array.slice();
    }
    this.lineScale = 1;
  }

  resize(aspect = 1.5) {
    const factor = this.isIOS ? 1 : Math.min(1, Math.max(.28, aspect / .95));
    for (const { mesh, baseScale } of this.meshes) {
      mesh.scale.copy(baseScale).multiplyScalar(factor);
      mesh.updateMatrixWorld(true);
    }
    if (this.wordmark && this.lineLength > 0) {
      const { geometry } = this.wordmark;
      if (!geometry.boundingBox) geometry.computeBoundingBox();
      this.wordmark.updateWorldMatrix(true, false);
      const bounds = geometry.boundingBox.clone().applyMatrix4(this.wordmark.matrixWorld);
      this.lineScale = (bounds.max.x - this.lineStart) / this.lineLength;
      for (const line of this.underlineMeshes) {
        line.scale.x = this.lineScale;
        line.position.x = this.lineStart * (1 - this.lineScale);
        line.updateMatrixWorld(true);
      }
      this.taperUnderline();
    }
  }

  taperUnderline() {
    if (!this.lineGeometry) return;
    const positions = this.lineGeometry.getAttribute('position');
    const original = this.originalLinePositions;
    const { gridExit, taperLength, radiusScale } = GREENTECH_UNDERLINE;
    for (let i = 0; i < positions.count; i++) {
      const x = original[i * 3];
      const worldX = this.lineStart + (x - this.lineStart) * this.lineScale;
      const t = Math.max(0, Math.min(1, (worldX - gridExit) / taperLength));
      const radius = 1 + (radiusScale - 1) * t * t * (3 - 2 * t);
      positions.setXYZ(i, x,
        this.lineCenter.y + (original[i * 3 + 1] - this.lineCenter.y) * radius,
        this.lineCenter.z + (original[i * 3 + 2] - this.lineCenter.z) * radius);
    }
    positions.needsUpdate = true;
    this.lineGeometry.computeVertexNormals();
    this.lineGeometry.computeBoundingBox();
    this.lineGeometry.computeBoundingSphere();
  }

  // Only the floor-light samples use this transform. The camera continues to
  // sample its original path, so extending the underline never shifts framing.
  mapUnderlinePoint(point) {
    if (this.lineLength > 0) point.x = this.lineStart + (point.x - this.lineStart) * this.lineScale;
    return point;
  }
}
