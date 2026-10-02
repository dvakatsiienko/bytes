// live frames against placeholders: `<frames> frames, <placeholders> placeholders`
(() =>
  `${document.querySelectorAll('[data-board] iframe').length} frames, ${document.querySelectorAll('[data-placeholder]').length} placeholders`)();
