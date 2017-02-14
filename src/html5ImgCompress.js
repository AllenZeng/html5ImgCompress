(() => {
  const URL = window.URL || window.webkitURL;

  class Html5ImgCompress {
    constructor(file, options = {}) {
      const DEFAULTE = Html5ImgCompress.DEFAULTE;

      this.file = file;
      this.options = {};
      this.canvas = document.createElement('canvas');

      for (let key in DEFAULTE) {
        this.options[key] = (options[key] == null) ? DEFAULTE[key] : options[key];
      }

      this.init();
    }

    init() {
      if (URL && File && this.canvas.getContext) {
        this.read(this.file);
      } else {
        // 浏览器不支持
        this.options.notSupport();
      }
    }

    read(file) {
      const self = this;
      const img = new Image();
      const fileURL = URL.createObjectURL(file);
      const canvas = this.canvas;
      let base64 = '';

      if (self.options.before(file) === false) return;

      img.src = fileURL;

      img.onload = () => {
        const quality = self.options.quality;
        const size = self.getSize(img);
        canvas.width = size.width;
        canvas.height = size.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // base64 = canvas.toDataURL('image/jpeg', quality);
        // self.handler('done', canvas, img, fileURL, base64, file);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const worker = new Worker('jpeg-web-worker.js');
        worker.postMessage({
          image: imageData,
          quality,
        });

        worker.onmessage = (e) => {
          const blob = new Blob( [e.data.data], {type: 'image/jpeg'} );

          const reader = new FileReader();
          reader.onload = function (e) {
            self.handler('done', canvas, img, fileURL, reader.result, file);
          }
          reader.readAsDataURL(blob);
        }

        worker.onerror = () => {
          console.log('work error');
        }
      };

      img.onerror = () => {
        self.handler('fail', canvas, img, fileURL, base64, file);
      };
    }

    handler(action, canvas, img, fileURL, base64, file) {
      URL.revokeObjectURL(fileURL);

      this.options[action](file, base64);
      this.options.complate(file);
    }

    getSize(img) {
      const options = this.options;
      const mW = options.maxWidth;
      const mH = options.maxHeight;
      let w = img.width;
      let h = img.height;
      const scale = w / h;

      if (mW && mH) {
        if (scale >= mW / mH) {
          if (w > mW) {
            h = mW / scale;
            w = mW;
          }
        } else {
          if (h > mH) {
            w = mH * scale;
            h = mH;
          }
        }
      } else if (mW) {
        if (mW < w) {
          h = mW / scale;
          w = mW;
        }
      } else if (mH) {
        if (mH < h) {
          w = mH * scale;
          h = mH;
        }
      }

      return { width: w, height: h };
    }
  }

  // 默认参数
  Html5ImgCompress.DEFAULTE = {
    maxWidth: 1000,
    maxHeight: 1000,
    quality: 100,
    before: () => {},
    done: () => {},
    fail: () => {},
    complate: () => {},
    notSupport: () => {},
  };

  // export default (file, option) => new Html5ImgCompress(file, option);

  window.Html5ImgCompress = Html5ImgCompress;
})();
