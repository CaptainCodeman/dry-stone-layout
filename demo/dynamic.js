import '@polymer/polymer/polymer-legacy.js';
import '@polymer/paper-button/paper-button.js';
import '../dry-stone-layout.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
Polymer({
  _template: html`
    <style>
      dry-stone-layout { transition: height 0.5s ease-in-out; }
      img { transition: transform 0.5s ease-in-out; }
      .r, .g, .b { transition: transform 0.5s ease-in-out; }
      .r { width: 240px; height: 240px; background-color: #caa; }
      .g { width: 160px; height: 240px; background-color: #aca; }
      .b { width: 240px; height: 160px; background-color: #aac; }
      p, dry-stone-layout { clear: both; }
    </style>

    <p><paper-button raised="" noink="" on-tap="createItems">Create Divs</paper-button></p>
    <dry-stone-layout target-height="90" spacing="1">
      <template is="dom-repeat" items="[[items]]">
        <div class\$="[[item]]"></div>
      </template>
    </dry-stone-layout>
`,

  is: 'x-dynamic',

  properties: {
    items: {
      type: Array,
      value: function() {
        return [];
      }
    }
  },

  createItems: function() {
    var items = [];
    for(var i = 0; i < 100; i++) {
      items.push('rgb'.charAt(Math.floor(Math.random() * 3)));
    }
    this.items = items;
  },

  random: function() {
    return Math.round(Math.random() * 1000);
  }
});
