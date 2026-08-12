class Visuals {
  renderEntity(ctx, type, x, y, color, size, state = {}) {
    ctx.fillStyle = color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
    
    if (type === 'player') {
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(x + size/3, y - size/3, size/3, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'snake-segment') {
      ctx.beginPath();
      ctx.roundRect(x - size/2, y - size/2, size, size, size/4);
      ctx.fill();
    } else if (type === 'tree') {
      ctx.fillStyle = '#2d5a27'; // Dark green
      ctx.beginPath();
      ctx.moveTo(x, y - size * 1.5);
      ctx.lineTo(x - size, y + size);
      ctx.lineTo(x + size, y + size);
      ctx.fill();
      ctx.fillStyle = '#4b3621'; // Brown trunk
      ctx.fillRect(x - size/4, y + size, size/2, size/2);
    } else if (type === 'building') {
      ctx.fillStyle = '#888';
      ctx.fillRect(x - size, y - size * 2, size * 2, size * 2);
      ctx.fillStyle = '#ccc';
      ctx.fillRect(x - size/2, y - size * 1.5, size/3, size/2); // Window
    } else if (type === 'vehicle') {
      ctx.fillStyle = color;
      ctx.fillRect(x - size, y - size/2, size * 2, size); // Body
      ctx.fillStyle = '#333';
      ctx.fillRect(x - size/2, y + size/2, size/4, size/4); // Wheel 1
      ctx.fillRect(x + size/4, y + size/2, size/4, size/4); // Wheel 2
    } else if (type === 'person') {
      ctx.fillStyle = '#f8c471'; // Skin
      ctx.beginPath();
      ctx.arc(x, y - size, size/2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.fillRect(x - size/2, y - size/2, size, size); // Body
    } else {
      ctx.fillRect(x - size/2, y - size/2, size, size);
    }
    ctx.shadowBlur = 0;
  }
}
