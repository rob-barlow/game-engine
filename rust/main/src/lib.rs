use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn get_frame_buffer(width: usize, height: usize) -> Vec<u8> {
    return vec![255; width * height * 4];
}