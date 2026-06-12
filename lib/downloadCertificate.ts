import html2canvas from 'html2canvas';

export async function downloadCertificate(
  ref: { current: HTMLDivElement | null },
  filename: string
): Promise<void> {
  if (!ref.current) return;

  const canvas = await html2canvas(ref.current, { useCORS: true, scale: 2 });

  return new Promise<void>((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) { resolve(); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      resolve();
    });
  });
}
