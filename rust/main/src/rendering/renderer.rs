use super::screen_buffer::ScreenBuffer;

pub struct Renderer {
    width: usize,
    height: usize,
    screen_buffer: ScreenBuffer
}

impl Renderer {
    pub fn new(width: usize, height: usize) -> Renderer {
        Self {
            width,
            height,
            screen_buffer: ScreenBuffer::new(),
        }
    }
}