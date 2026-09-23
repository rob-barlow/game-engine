pub struct Position {
    pub row: usize,
    pub column: usize,
}

impl Position {
    // pub fn distance(a: &Position, b: &Position) -> u8 {
    //     let row_distance = a.row as i8 - b.row as i8;
    //     let column_distance = a.column as i8 - b.column as i8;
    //     return ((row_distance).abs() + (column_distance).abs()) as u8;
    // }

    pub fn new(row: usize, column: usize) -> Position {
        return Position {row: row, column: column};
    }
}