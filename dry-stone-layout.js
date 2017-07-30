(function() {
class DryStoneLayoutElement extends HTMLElement {
  static get observedAttributes() {
    return ['disabled', 'spacing', 'target-height', 'debounce', 'width', 'chunk'];
  }

  constructor() {
    super();

    this._slot = document.createElement('slot');
    let shadowRoot = this.attachShadow({mode: 'open'});
    shadowRoot.appendChild(this._slot);

    this.loading = true;
    this.spacing = 1;
    this.targetHeight = 90;
    this.debounce = 60
    this._needsRender = true;
  }

  connectedCallback() {
    this.setAttribute('loading', '');

    this.style.display = 'block';
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.style.contain = 'strict';
    this.style.lineHeight = 0;

    this._onNodesChanged = this._childNodesChanged.bind(this);
    this._onNodesChanged();

    this._slotChangeListener = this._slot.addEventListener('slotchange', this._onNodesChanged, false);
    this._domChangeListener = this._slot.addEventListener('dom-change', this._onNodesChanged, false);

    this._onResize = this._debounce(this._render.bind(this), this.debounce);
    this._resizeListener = window.addEventListener('resize', this._onResize, false);

    requestAnimationFrame(this._render.bind(this));
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
    this._needsRender = true;
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
    this.nodes = this._slot.assignedNodes().filter(n => n.nodeType == Node.ELEMENT_NODE && n.tagName !== "TEMPLATE" && n.tagName !== "DOM-REPEAT");
    this.nodes.forEach(node => {
      node.style.position = 'absolute';
      node.style.transformOrigin = '0 0';
    });
    this.sizes = this.nodes.map(n => ({ width: n.width || n.clientWidth, height: n.height || n.clientHeight }));
    this.aspects = this.sizes.map(s => s.width / s.height);
    this._needsRender = true;
    this._render();
  }

  // adapted some ideas from https://github.com/jonathanong/horizontal-grid-packing
  _render() {
    if (!this._needsRender && this.width === this.clientWidth) return;

    this.width = this.clientWidth;

    if (!this.width) return;
    if (!this.sizes || this.sizes.length === 0) return;

    var rowsNeeded = Math.max(Math.min(Math.floor(this.aspects.reduce(this.add, 0) * this.targetHeight / this.width), this.aspects.length), 1)
    var partitions = this._linear_partition(this.aspects, rowsNeeded);
    var index = 0;
    this.rows = [];
    partitions.forEach(x => index += this.createRow(index, x.length));

    this.height = this.rows[this.rows.length - 1].top + this.rows[this.rows.length - 1].height;
    this._needsRender = false;

    requestAnimationFrame(() => {
      for(var r = 0; r < this.rows.length; r++) {
        var row = this.rows[r];
        for(var c = 0; c < row.count; c ++) {
          var index = row.index + c;
          var item = row.items[c];
          var node = this.nodes[index];
          var size = this.sizes[index];
          var aspect = this.aspects[index];
          var scaleX = item.width / size.width;
          var scaleY = item.height / size.height;
          var transform = 'translate(' + item.left + 'px,' + item.top + 'px) scale(' + scaleX.toFixed(8) + ',' + scaleY.toFixed(8) + ')';
          node.style.transform = transform;
        }
      }
      this.style.height = this.height + 'px';

      // remove loading style override which prevented animation of the initial layout
      if (this.loading) {
        this.loading = false;
        requestAnimationFrame(() => {
          this.removeAttribute('loading');
          this.setAttribute('loaded', '');
        });
      }
    });
  }

  createRow(index, count) {
    var aspects = this.aspects.slice(index, index + count);
    var row = {
      index: index,
      count: count,
      top: this.rows.length ? this.rows[this.rows.length - 1].top + this.rows[this.rows.length - 1].height + this.spacing : 0,
      height: this.calculateRowHeight(aspects),
      items: []
    }

    var left = 0;
    aspects.forEach((aspect, i) => {
      var width = row.height * aspect;
      row.items[i] = {
        top: row.top,
        left: left,
        width: width,
        height: row.height
      }
      left += width + this.spacing;
    })
    this.rows.push(row);
    return count;
  }

  calculateRowHeight(images) {
    return (this.width - (this.spacing * (images.length - 1))) / images.reduce(this.add, 0);
  }

  add(a, b) {
    return a + b;
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
