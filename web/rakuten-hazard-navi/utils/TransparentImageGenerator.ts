import { fabric } from 'fabric';

export const TransparentImageGenerator = ({ src, opacity = 0.5 }) => {
  let dataURL= ""
  const canvasRef = useRef(null);

  const handleGenerate = () => {
    const canvas = new fabric.Canvas(canvasRef.current);

    fabric.Image.fromURL(src, (img) => {
      img.set({ opacity });
      canvas.add(img);
      canvas.renderAll();

      // 画像データの取得
      dataURL = canvas.toDataURL('image/png');
    });
  };

  return dataURL;
}
