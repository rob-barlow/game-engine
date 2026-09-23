pub struct ScreenBuffer {
    pub buffer: [u8; 2]
}

impl ScreenBuffer {
    pub fn new() -> ScreenBuffer {
       return  ScreenBuffer { buffer: [0, 0] };
    }
}