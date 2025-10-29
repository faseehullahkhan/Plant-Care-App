import { Plant, AiHealthReport } from '../types';

// A helper function to load an image and handle potential errors
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // This can help with tainted canvas issues if images were not data URLs
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`Could not load image from src: ${src.substring(0, 50)}...`));
    img.src = src;
  });
};


// A helper function to wrap text on a canvas
const wrapText = (
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number => {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      context.fillText(line.trim(), x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  context.fillText(line.trim(), x, currentY);
  return currentY + lineHeight; // Return the Y position for the next line
};

// A helper to draw the health score gauge
const drawGauge = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, score: number) => {
    const startAngle = -0.5 * Math.PI; // Start at the top
    const endAngle = startAngle + (score / 100) * 2 * Math.PI;

    let scoreColor = '#22c55e'; // green-500
    if (score < 40) scoreColor = '#ef4444'; // red-500
    else if (score < 70) scoreColor = '#eab308'; // yellow-500

    // Background circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#e2e8f0'; // slate-200
    ctx.lineWidth = 12;
    ctx.stroke();

    // Foreground arc
    ctx.beginPath();
    ctx.arc(x, y, radius, startAngle, endAngle);
    ctx.strokeStyle = scoreColor;
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Text inside
    ctx.fillStyle = '#1e293b'; // slate-800
    ctx.font = 'bold 36px Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(score.toString(), x, y);

    ctx.font = '14px Poppins, sans-serif';
    ctx.fillText('/ 100', x, y + 28);
};


export const generateReportImage = async (plant: Plant, report: AiHealthReport): Promise<string> => {
    const width = 800;
    let height = 1100; // Starting height, may grow
    const padding = 40;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Could not get canvas context');
    }
    
    if (!report.isMatch || typeof report.healthScore === 'undefined' || !report.overallAssessment) {
        throw new Error('Cannot generate a report for a mismatched or incomplete health check.');
    }

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // --- Plant Image ---
    try {
        const plantImg = await loadImage(plant.imageUrl);
        const aspectRatio = plantImg.width / plantImg.height;
        const imgHeight = (width - padding * 2) / aspectRatio;
        ctx.drawImage(plantImg, padding, padding, width - padding * 2, imgHeight);
        let currentY = imgHeight + padding * 1.5;

        // --- Header ---
        ctx.fillStyle = '#1e293b'; // slate-800
        ctx.font = 'bold 42px Poppins, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        const plantName = plant.name.charAt(0).toUpperCase() + plant.name.slice(1);
        currentY = wrapText(ctx, plantName, padding, currentY, width - padding * 2, 50);

        ctx.font = '18px Poppins, sans-serif';
        ctx.fillStyle = '#64748b'; // slate-500
        ctx.fillText(`Health Report as of ${new Date().toLocaleDateString()}`, padding, currentY);
        currentY += 50;

        // --- Assessment Section ---
        const gaugeX = 110;
        const gaugeY = currentY + 50;
        drawGauge(ctx, gaugeX, gaugeY, 50, report.healthScore);

        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 22px Poppins, sans-serif';
        const textX = gaugeX * 2 + 20;
        ctx.fillText('Overall Assessment', textX, currentY);
        
        ctx.fillStyle = '#475569'; // slate-600
        ctx.font = '18px Poppins, sans-serif';
        wrapText(ctx, report.overallAssessment, textX, currentY + 30, width - textX - padding, 28);
        currentY += 140;

        // --- Details Sections ---
        const drawSection = (title: string, items: (string | {issue: string, cause: string})[]) => {
            if (!items || items.length === 0) return;
            ctx.fillStyle = '#1e293b';
            ctx.font = 'bold 22px Poppins, sans-serif';
            ctx.fillText(title, padding, currentY);
            currentY += 40;

            ctx.fillStyle = '#475569';
            ctx.font = '18px Poppins, sans-serif';
            
            items.forEach(item => {
                let text: string;
                if(typeof item === 'string') {
                    text = `• ${item}`;
                } else {
                    text = `• ${item.issue}: ${item.cause}`;
                }
                currentY = wrapText(ctx, text, padding, currentY, width - padding * 2, 30);
            });
            currentY += 30; // Spacing after section
        };

        drawSection('✅ What\'s Going Well', report.positiveSigns || []);
        drawSection('⚠️ Potential Issues', (report.potentialIssues || []).map(i => ({issue: i.issue, cause: i.possibleCause})));
        drawSection('💡 Recommendations', report.recommendations || []);
        
        // --- Footer ---
        currentY += 20;
        ctx.fillStyle = '#94a3b8'; // slate-400
        ctx.font = '16px Poppins, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Generated by Plant Care AI', width / 2, currentY);

        // Adjust canvas height to content
        height = currentY + 40;
        canvas.height = height;
        
        // Redraw everything on the resized canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(plantImg, padding, padding, width - padding * 2, imgHeight);
        
        // Re-run all drawing commands...
        currentY = imgHeight + padding * 1.5;
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 42px Poppins, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        currentY = wrapText(ctx, plantName, padding, currentY, width - padding * 2, 50);
        ctx.font = '18px Poppins, sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText(`Health Report as of ${new Date().toLocaleDateString()}`, padding, currentY);
        currentY += 50;
        drawGauge(ctx, gaugeX, gaugeY, 50, report.healthScore);
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 22px Poppins, sans-serif';
        ctx.fillText('Overall Assessment', textX, currentY);
        ctx.fillStyle = '#475569';
        ctx.font = '18px Poppins, sans-serif';
        wrapText(ctx, report.overallAssessment, textX, currentY + 30, width - textX - padding, 28);
        currentY += 140;
        drawSection('✅ What\'s Going Well', report.positiveSigns || []);
        drawSection('⚠️ Potential Issues', (report.potentialIssues || []).map(i => ({issue: i.issue, cause: i.possibleCause})));
        drawSection('💡 Recommendations', report.recommendations || []);
        currentY += 20;
        ctx.fillStyle = '#94a3b8';
        ctx.font = '16px Poppins, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Generated by Plant Care AI', width / 2, currentY);
        
        return canvas.toDataURL('image/png');

    } catch (error) {
        console.error("Failed to generate report image:", error);
        throw error; // Propagate error to be handled by the component
    }
};