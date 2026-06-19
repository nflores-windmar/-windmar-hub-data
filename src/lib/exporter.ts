import { toPng } from "html-to-image";
import JSZip from "jszip";

export async function nodeToPngBlob(node: HTMLElement): Promise<Blob> {
  const dataUrl = await toPng(node, {
    cacheBust: true,
    pixelRatio: 1,
    width: node.offsetWidth,
    height: node.offsetHeight,
  });
  const res = await fetch(dataUrl);
  return res.blob();
}

export async function exportSlidesToZip(
  nodes: HTMLElement[],
  baseName: string
): Promise<void> {
  const zip = new JSZip();
  for (let i = 0; i < nodes.length; i++) {
    const blob = await nodeToPngBlob(nodes[i]);
    zip.file(`${baseName}_slide${i + 1}.png`, blob);
  }
  const content = await zip.generateAsync({ type: "blob" });
  triggerDownload(content, `${baseName}.zip`);
}

export async function exportSingleSlide(
  node: HTMLElement,
  fileName: string
): Promise<Blob> {
  const blob = await nodeToPngBlob(node);
  triggerDownload(blob, fileName);
  return blob;
}

export function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]); // strip data: prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
