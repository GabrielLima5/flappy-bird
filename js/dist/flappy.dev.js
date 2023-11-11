"use strict";

function novoElemento(tagName, className) {
  var elem = document.createElement(tagName);
  elem.className = className;
  return elem;
}

function Barreira() {
  var reversa = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  this.elemento = novoElemento('div', 'barreira');
  var borda = novoElemento('div', 'borda');
  var corpo = novoElemento('div', 'corpo');
  this.elemento.appendChild(reversa ? corpo : borda);
  this.elemento.appendChild(reversa ? borda : corpo);

  this.setAltura = function (altura) {
    return corpo.style.height = "".concat(altura, "px");
  };
}

function ParDeBarreiras(altura, abertura, x) {
  var _this = this;

  this.elemento = novoElemento('div', 'par-de-barreiras');
  this.superior = new Barreira(true);
  this.inferior = new Barreira(false);
  this.elemento.appendChild(this.superior.elemento);
  this.elemento.appendChild(this.inferior.elemento);

  this.sortearAbertura = function () {
    var alturaSuperior = Math.random() * (altura - abertura);
    var alturaInferior = altura - abertura - alturaSuperior;

    _this.superior.setAltura(alturaSuperior);

    _this.inferior.setAltura(alturaInferior);
  };

  this.getX = function () {
    return parseInt(_this.elemento.style.left.split('px')[0]);
  };

  this.setX = function (x) {
    return _this.elemento.style.left = "".concat(x, "px");
  };

  this.getLargura = function () {
    return _this.elemento.clientWidth;
  };

  this.sortearAbertura();
  this.setX(x);
}

function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
  var _this2 = this;

  this.pares = [new ParDeBarreiras(altura, abertura, largura), new ParDeBarreiras(altura, abertura, largura + espaco), new ParDeBarreiras(altura, abertura, largura + espaco * 2), new ParDeBarreiras(altura, abertura, largura + espaco * 3)];
  var deslocamento = 3;

  this.animar = function () {
    _this2.pares.forEach(function (par) {
      par.setX(par.getX() - deslocamento); // quando o elemento sair da área do jogo

      if (par.getX() < -par.getLargura()) {
        par.setX(par.getX() + espaco * _this2.pares.length);
        par.sortearAbertura();
      }

      var meio = largura / 2;
      var cruzouMeio = par.getX() + deslocamento >= meio && par.getX() < meio;
      if (cruzouMeio) notificarPonto();
    });
  };
}

function Passaro(alturaJogo) {
  var _this3 = this;

  var voando = false;
  this.elemento = novoElemento('img', 'passaro');
  this.elemento.setAttribute('src', 'imgs/passaro.png');

  this.getY = function () {
    return parseInt(_this3.elemento.style.bottom.split('px')[0]);
  };

  this.setY = function (y) {
    return _this3.elemento.style.bottom = "".concat(y, "px");
  };

  window.addEventListener('keydown', function (e) {
    voando = true;
  });
  window.addEventListener('keyup', function (e) {
    voando = false;
  });

  this.animar = function () {
    var novoY = _this3.getY() + (voando ? 8 : -5);
    var alturaMaxima = alturaJogo - _this3.elemento.clientHeight;

    if (novoY < 0) {
      _this3.setY(0);
    } else if (novoY >= alturaMaxima) {
      _this3.setY(alturaMaxima);
    } else {
      _this3.setY(novoY);
    }
  };

  this.setY(alturaJogo / 2);
}

function Progresso() {
  var _this4 = this;

  this.elemento = novoElemento('span', 'progresso');

  this.atualizarPontos = function (pontos) {
    _this4.elemento.innerHTML = pontos;
  };

  this.atualizarPontos(0);
}

function estaoSobrepostos(elementoA, elementoB) {
  var a = elementoA.getBoundingClientRect();
  var b = elementoB.getBoundingClientRect();
  var horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left;
  var vertical = a.top + a.height >= b.top && b.top + b.height >= a.top;
  return horizontal && vertical;
}

function colidiu(passaro, barreiras) {
  var colidiu = false;
  barreiras.pares.forEach(function (par) {
    if (!colidiu) {
      var superior = par.superior.elemento;
      var inferior = par.inferior.elemento;
      colidiu = estaoSobrepostos(passaro.elemento, superior) || estaoSobrepostos(passaro.elemento, inferior);
    }
  });
  return colidiu;
}

function FlappyBird() {
  var pontos = 0;
  var areaJogo = document.querySelector('[wm-flappy]');
  var altura = areaJogo.clientHeight;
  var largura = areaJogo.clientWidth;
  var btn = document.querySelector('.play');
  var progresso = new Progresso();
  var barreiras = new Barreiras(altura, largura, 200, 400, function () {
    return progresso.atualizarPontos(++pontos);
  });
  var passaro = new Passaro(altura);
  areaJogo.appendChild(progresso.elemento);
  areaJogo.appendChild(passaro.elemento);
  barreiras.pares.forEach(function (par) {
    return areaJogo.appendChild(par.elemento);
  });

  this.start = function () {
    var temporizador = setInterval(function () {
      barreiras.animar();
      passaro.animar();

      if (colidiu(passaro, barreiras)) {
        clearInterval(temporizador);
        btn.style.display = 'block';
      }
    }, 20);
  };
}

function initBtnEvent() {
  var btn = document.querySelector('.play');
  btn.addEventListener('click', function (e) {
    var gameElements = document.querySelectorAll('[wm-flappy] div');
    var progressSpan = document.querySelector('.progresso');
    gameElements.forEach(function (el) {
      el.style.display = 'none';
    });
    if (progressSpan) progressSpan.style.display = 'none';
    var passaroEl = document.querySelectorAll('.passaro');
    passaroEl.forEach(function (el) {
      el.style.display = 'none';
    });
    var flappy = new FlappyBird();
    flappy.start();
    btn.style.display = 'none';
  });
}

initBtnEvent();