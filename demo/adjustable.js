import '@polymer/polymer/polymer-legacy.js';
import '@polymer/paper-slider/paper-slider.js';
import '@polymer/paper-button/paper-button.js';
import '../dry-stone-layout.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
Polymer({
  _template: html`
    <style>
      dry-stone-layout {
        transition: height 0.5s ease-in-out;
      }
      dry-stone-layout[loading] img {
        transition: none !important;
        visibility: hidden;
      }
      dry-stone-layout[loaded] img {
        transition: transform 0.5s ease-in-out;
        visibility: visible;
      }
      label { width: 100px; margin: 8px 0; float: left; }
      paper-slider { float: left; }
      p, dry-stone-layout { clear: both; }
    </style>
    <p><label>Size</label><paper-slider min="40" max="240" value="90" immediate-value="{{size}}"></paper-slider></p>
    <p><label>Spacing</label><paper-slider min="0" max="10" value="1" immediate-value="{{spacing}}"></paper-slider></p>

    <dry-stone-layout target-height\$="[[size]]" spacing\$="[[spacing]]">
      <img src="14117348070_bbf190b521_m.jpg" width="240" height="163">
      <img src="28738913666_d7f288ae25_m.jpg" width="240" height="180">
      <img src="28808871375_dc652d8972_m.jpg" width="160" height="240">
      <img src="31782510030_579cb5119a_m.jpg" width="240" height="179">
      <img src="32039394161_2cfc04b72a_m.jpg" width="180" height="240">
      <img src="32061810663_2249492d02_m.jpg" width="240" height="162">
      <img src="32357716254_42aa3b0663_m.jpg" width="240" height="159">
      <img src="28686254682_185a028e2e_m.jpg" width="159" height="240">
      <img src="32260967565_7f88cb6a4c_m.jpg" width="240" height="171">
      <img src="32186892504_d99b0ffc1e_m.jpg" width="240" height="159">
      <img src="32363556052_87007c3440_m.jpg" width="240" height="158">
      <img src="32400954515_cdb6b12bf2_m.jpg" width="158" height="240">
      <img src="32873865786_1c825895f3_m.jpg" width="240" height="145">
      <img src="33001221391_6afee89be5_m.jpg" width="240" height="159">
      <img src="33186065675_95b54548da_m.jpg" width="240" height="120">
    </dry-stone-layout>
`,

  is: 'x-adjustable'
});
