mod sound;
mod utils;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet(s: &str) {
    alert(s);
}

#[wasm_bindgen]
pub fn bytes_to_wav(bytes: &[u8]) -> Vec<u8> {
    sound::bytes_to_wav(bytes)
}
