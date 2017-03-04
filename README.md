_[Demo and API docs](http://captaincodeman.github.io/dry-stone-layout/)_

# \<dry-stone-layout\>

`dry-stone-layout` is a layout element that creates a masonry-like layout with no gaps.

![Example](demo/screenshot.png)

Based on these previous ideas:
* [Algorithm for a perfectly balanced photo gallery](https://medium.com/@jtreitz/the-algorithm-for-a-perfectly-balanced-photo-gallery-914c94a5d8af#.8qss863p6)
* [Google Plus image layout algorithm](http://blog.vjeux.com/2012/image/image-layout-algorithm-google-plus.html)
* [Packing images in a grid](http://fangel.github.io/packing-images-in-a-grid/)

```
<dry-stone-layout target-height="90" spacing="1">
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
```