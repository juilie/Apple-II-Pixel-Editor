<div align="center">

  <h1>Apple ][ Pixel Editor</h1>

  <strong>A tool for transferring drawings and pictures to the Apple ][ computer</strong>

  <sub>In collaboration with <a href="https://github.com/khollbach">khollbach</a></sub>
</div>

<div align="center">
  <img src="https://github.com/juilie/Apple-II-Pixel-Editor/assets/33275847/2bfabfc1-5529-4924-a1a0-1e607a060186" alt="Gif of Apple II drawing the People's Coalition of Tandy logo" />
</div>

## About

This project enables the rendering of graphics from a modern computer onto an Apple ]\[, using the Apple's ability to interpret audio input as data for direct memory writing. This project currently uses the Apple \]\[ High-Resolution graphics mode ([HGR](https://en.wikipedia.org/wiki/Apple_II_graphics#High-Resolution_(Hi-Res)_graphics).

The code behind the data to audio conversion is an adaptation of the [bas2wav](https://github.com/khollbach/bas2wav) Rust crate, originally developed by [@khollbach](https://github.com/khollbach) for converting BASIC programs into WAV files executable on the Apple ][. This project extends the crate's functionality to include the translation of image data and other arbitrary data types into WAV files. We built the Rust code to a WebAssembly (wasm) module, so the conversion happens client-side.

Uploaded images are transformed into HSL values and a user-defined lightness threshold converts the image to a binary black and white image. This binary data is then arranged according to the Apple ]\[ graphics memory layout. To comply with the system's memory constraints, the most significant bit of each byte is discarded, resulting in a 7-bit memory-mapped representation of the pixel data. The data is processed through the wasm code to generate an audio file. The resulting audio is played back as input into an Apple ][, which renders the original image in its Hi-Res graphics mode.

## 🚴 Usage
- Connect laptop to Apple \]\[ audio input
- Press Control + Reset on the Apple \]\[
- Enter the following commands on the Apple \]\[ (hit enter after each one)
  - <code>HGR</code>
  - <code>CALL -151</code>
  - <code>2000.3FFFR</code>
- Now you can play the converted audio from your computer, and the pixels will be written to the Apple \]\[ 

## Issues
