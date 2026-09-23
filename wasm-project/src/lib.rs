use wasm_bindgen::prelude::*;
use web_sys::{HtmlCanvasElement, CanvasRenderingContext2d, ImageData};
use js_sys::{Uint8ClampedArray};

#[wasm_bindgen]
pub fn run() -> Result<(), JsValue> {
    let ctx = create_canvas()
        .map_err(|e| {
            if let Some(error_message) = e.as_string() {
                log(format!("error: {error_message}"));
            } else {
                log("Bad!!!".to_string());
            }
            
            e
        })?;
    
    let result = draw_on_canvas(ctx);

    Ok(())

}

fn create_canvas() -> Result<CanvasRenderingContext2d, JsValue> {
    let window = web_sys::window()
        .ok_or(JsValue::from_str("Cannot get window"))?;
        
    let document = window.document()
        .ok_or(JsValue::from_str("Cannot get document"))?;

    let canvas: web_sys::HtmlCanvasElement = document
        .create_element("canvas")?
        .dyn_into::<HtmlCanvasElement>()?;

    let body = document.body()
        .ok_or(JsValue::from_str("Cannot get body"))?;

    let width = body.client_width() as u32;

    log(format!("Width is {}", width.to_string()));

    canvas.set_width(width);
    canvas.set_attribute("height", "100%")?;

    body.append_child(&canvas)?;

    let ctx = canvas
        .get_context("2d")?
        .ok_or("Cannot get context")?
        .dyn_into::<CanvasRenderingContext2d>()?;

    return Ok(ctx);
}

fn draw_on_canvas(ctx: CanvasRenderingContext2d) -> Result<(), JsValue> {
    let buffer_length = 800 * 600;

    let buffer: Vec<u8> = vec![128; buffer_length * 4];

    let clamped_buffer = Uint8ClampedArray::new_from_slice(&buffer);

    let image: ImageData = ImageData::new_with_js_u8_clamped_array(&clamped_buffer, 800)?;

    return ctx.put_image_data(&image, 0.0, 0.0);
}

fn log(string: String) {
    web_sys::console::log_1(&string.into());
}