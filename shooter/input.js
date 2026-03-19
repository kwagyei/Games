const Input = {
  keys: {},
  enterPressed: false,
  mouse: { x: 0, y: 0, clicked: false, held: false },

  init(canvas) {
    window.addEventListener('keydown', e => {
      this.keys[e.code] = true;
      if (e.code === 'Enter') this.enterPressed = true;
      // Prevent arrow key scrolling
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', e => {
      this.keys[e.code] = false;
    });

    canvas.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      this.mouse.x = (e.clientX - rect.left) * scaleX;
      this.mouse.y = (e.clientY - rect.top) * scaleY;
    });

    canvas.addEventListener('mousedown', e => {
      if (e.button === 0) {
        this.mouse.clicked = true;
        this.mouse.held = true;
      }
    });

    canvas.addEventListener('mouseup', e => {
      if (e.button === 0) this.mouse.held = false;
    });

    canvas.addEventListener('contextmenu', e => e.preventDefault());
  },

  consume() {
    this.mouse.clicked = false;
    this.enterPressed = false;
  }
};
