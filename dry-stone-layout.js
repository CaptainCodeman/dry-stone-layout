(function() {
const template = document.createElement('template');
template.innerHTML = `
<style>
:host {
  display: block;
  position: relative;
  overflow: hidden;
  contain: content;
  line-height: 0;
}

::slotted(*) {
  position: absolute;
  transform-origin: 0 0;
}
</style>
<slot id="content"></slot>`;
ShadyCSS.prepareTemplate(template, 'dry-stone-layout');

class DryStoneLayoutElement extends HTMLElement {
  static get observedAttributes() {
    return ['disabled', 'spacing', 'target-height', 'debounce', 'width'];
  }

  constructor() {
    super();

    let shadowRoot = this.attachShadow({mode: 'open'});
    shadowRoot.appendChild(document.importNode(template.content, true));

    this._slot = this.shadowRoot.querySelector('#content');

    this.loading = true;
    this.spacing = 1;
    this.targetHeight = 90;
    this.debounce = 60
  }

  connectedCallback() {
    this.setAttribute('loading', '');
    ShadyCSS.styleElement(this);

    this._onNodesChanged = this._childNodesChanged.bind(this);
    this._onNodesChanged();

    this._slotChangeListener = this._slot.addEventListener('slotchange', this._onNodesChanged, false);
    this._domChangeListener = this._slot.addEventListener('dom-change', this._onNodesChanged, false);

    this._onResize = this._debounce(this._render.bind(this), this.debounce);
    this._resizeListener = window.addEventListener('resize', this._onResize, false);
  }

  disconnectedCallback() {
    this._slot.removeEventListener('slotchange', this._slotChangeListener);
    this._slot.removeEventListener('dom-change', this._domChangeListener);

    window.removeEventListener('resize', this._resizeListener);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // console.log(name, oldValue, newValue);
    if (oldValue === newValue) return;
    switch (name) {
      case 'debounce':
        this.debounce = parseInt(newValue);
        break;
      case 'spacing':
        this.spacing = parseInt(newValue);
        break;
      case 'target-height':
        this.targetHeight = parseInt(newValue);
        break;
      case 'width':
        this.width = parseInt(newValue);
        break;
    }
    this._render();
  }

  _debounce(fn, delay) {
    var timer = null;
    return () => {
      var context = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(context, args), delay);
    };
  }

  _childNodesChanged() {
    var nodes = this._slot.assignedNodes().filter(n => n.nodeType == Node.ELEMENT_NODE && n.tagName !== "TEMPLATE" && n.tagName !== "DOM-REPEAT");
    this._dimensions = nodes
    .map(n => {
      let w = n.width || n.clientWidth;
      let h = n.height || n.clientHeight;
      return { node: n, width: w, height: h, aspect: w / h };
    });
    this._render();
  }

  _render() {
    var width = this.width || this.clientWidth;
    // console.log(width, this._dimensions);
    if (!width) return;
    if (!this._dimensions || this._dimensions.length === 0) return;

    var totalWidth = this._dimensions.reduce((total, dimension) => { return total + this.targetHeight * dimension.aspect}, 0);

    var i, j, k, n, positions = [], elementCount;

    var dimensions = this._dimensions;
    var containerWidth = this.width || this.clientWidth;
    var idealHeight = this.targetHeight;
    var summedWidth = totalWidth;
    var spacing = this.spacing;

    // calculate rows needed
    var rowsNeeded = Math.round(summedWidth / containerWidth);

    if (rowsNeeded < 1) {
      // (2a) Fallback to just standard size
      var xSum = 0;
      elementCount = dimensions.length;

      var padLeft = 0;

      for (var i = 0; i < elementCount; i++) {
        var width = Math.round(idealHeight * dimensions[i].aspect) - (spacing * (elementCount - 1) / elementCount);
        positions.push({
          y: 0,
          x: padLeft + xSum,
          width: width,
          height: idealHeight
        });
        xSum += width;
        if (i !== n - 1) {
          xSum += spacing;
        }
      }
      ySum = idealHeight;
    } else {
      // (2b) Distribute elements over rows using the aspect ratio as weight
      var weights = dimensions.map(function(d) { return d.aspect * 100; });
      var partitions = this._linear_partition(weights, rowsNeeded);
      var index = 0;
      var ySum = 0, xSum;
      for (i = 0, n = partitions.length; i < n; i++) {
        var element_index = index;
        var summedRatios = 0;
        for (j = 0, k = partitions[i].length; j < k; j++) {
          summedRatios += dimensions[element_index + j].aspect;
          index++;
        }

        xSum = 0;
        var height = Math.round(containerWidth / summedRatios);
        elementCount = partitions[i].length;
        for (j = 0; j < elementCount; j++) {
          width = Math.round((containerWidth - (elementCount - 1) * spacing) / summedRatios * dimensions[element_index + j].aspect);
          var item = {
            y: ySum,
            x: xSum,
            width: width,
            height: height
          };
          positions.push(item);
          xSum += width;
          if (j !== elementCount - 1) {
            xSum += spacing;
          }
        }

        // jiggle values to make fit exactly (because 'rounding' and spacing ...)
        // TODO: tidy up and check logic (esp. escaping the loop)
        //       shrink widest images, widen narrowest etc...
        var offset = positions.length - 1;
        while (xSum !== containerWidth) {
          for (j = 0; j < elementCount; j++) {
            var item = positions[offset - j];
            if (xSum > containerWidth) {
              item.width--;
              xSum--;
              if (j > 0) {
                for (k = 0; k < j; k++) {
                  positions[offset - k].x--;
                }
              }
            } else if (xSum < containerWidth) {
              item.width++;
              xSum++;
              if (j > 0) {
                for (k = 0; k < j; k++) {
                  positions[offset - k].x++;
                }
              }
            }
          }
        }

        ySum += height;
        if (i !== n - 1) {
          ySum += spacing;
        }
      }
    }

    var layout = {
      width: containerWidth,
      height: ySum,
      positions: positions
    };

    requestAnimationFrame(() => {
      layout.positions.forEach((position, i) => {
        var scaleX, scaleY, style;
        var dimension = this._dimensions[i];
        var aspect = dimension.aspect;
        scaleX = position.width / dimension.width;
        scaleY = position.height / dimension.height;
        var transform = 'translate(' + position.x + 'px,' + position.y + 'px) scale(' + scaleX.toFixed(6) + ',' + scaleY.toFixed(6) + ')';
        dimension.node.style.transform = transform;
      });

      // update our own height to account for the new layout and notify anyone who cares
      this.height = layout.height;
      this.style.height = layout.height + 'px';

      // remove loading style override which prevented animation of the initial layout
      if (this.loading && positions.length > 0) {
        this.loading = false;
        requestAnimationFrame(() => {
          this.removeAttribute('loading');
          this.setAttribute('loaded', '');
        });
      }
    });
  }

  // see: https://github.com/crispymtn/linear-partition
  _linear_partition(seq, k) {
    var ans, i, j, m, n, solution, table, x, y, _i, _j, _k, _l;
    var _m, _nn;

    n = seq.length;
    if (k <= 0) {
      return [];
    }
    if (k > n) {
      return seq.map(function(x) {
        return [x];
      });
    }
    table = (function() {
      var _i, _results;
      _results = [];
      for (y = _i = 0; 0 <= n ? _i < n : _i > n; y = 0 <= n ? ++_i : --_i) {
        _results.push((function() {
          var _j, _results1;
          _results1 = [];
          for (x = _j = 0; 0 <= k ? _j < k : _j > k; x = 0 <= k ? ++_j : --_j) {
            _results1.push(0);
          }
          return _results1;
        })());
      }
      return _results;
    })();
    solution = (function() {
      var _i, _ref, _results;
      _results = [];
      for (y = _i = 0, _ref = n - 1; 0 <= _ref ? _i < _ref : _i > _ref; y = 0 <= _ref ? ++_i : --_i) {
        _results.push((function() {
          var _j, _ref1, _results1;
          _results1 = [];
          for (x = _j = 0, _ref1 = k - 1; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; x = 0 <= _ref1 ? ++_j : --_j) {
            _results1.push(0);
          }
          return _results1;
        })());
      }
      return _results;
    })();
    for (i = _i = 0; 0 <= n ? _i < n : _i > n; i = 0 <= n ? ++_i : --_i) {
      table[i][0] = seq[i] + (i ? table[i - 1][0] : 0);
    }
    for (j = _j = 0; 0 <= k ? _j < k : _j > k; j = 0 <= k ? ++_j : --_j) {
      table[0][j] = seq[0];
    }
    for (i = _k = 1; 1 <= n ? _k < n : _k > n; i = 1 <= n ? ++_k : --_k) {
      for (j = _l = 1; 1 <= k ? _l < k : _l > k; j = 1 <= k ? ++_l : --_l) {

        m = [];
        for (x = _m = 0; 0 <= i ? _m < i : _m > i; x = 0 <= i ? ++_m : --_m) {
          m.push([Math.max(table[x][j - 1], table[i][0] - table[x][0]), x]);
        }

        var minValue, minIndex = false;
        for (_m = 0, _nn = m.length; _m < _nn; _m++) {
          if (_m === 0 || m[_m][0] < minValue) {
            minValue = m[_m][0];
            minIndex = _m;
          }
        }

        m = m[minIndex];
        table[i][j] = m[0];
        solution[i - 1][j - 1] = m[1];
      }
    }
    n = n - 1;
    k = k - 2;
    ans = [];
    while (k >= 0) {
      ans = [
        (function() {
          var _m, _ref, _ref1, _results;
          _results = [];
          for (i = _m = _ref = solution[n - 1][k] + 1, _ref1 = n + 1; _ref <= _ref1 ? _m < _ref1 : _m > _ref1; i = _ref <= _ref1 ? ++_m : --_m) {
            _results.push(seq[i]);
          }
          return _results;
        })()
      ].concat(ans);
      n = solution[n - 1][k];
      k = k - 1;
    }
    return [
      (function() {
        var _m, _ref, _results;
        _results = [];
        for (i = _m = 0, _ref = n + 1; 0 <= _ref ? _m < _ref : _m > _ref; i = 0 <= _ref ? ++_m : --_m) {
          _results.push(seq[i]);
        }
        return _results;
      })()
    ].concat(ans);
  }
}

window.customElements.define('dry-stone-layout', DryStoneLayoutElement);
}());
