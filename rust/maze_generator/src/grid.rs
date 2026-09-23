use super::position::Position;

pub struct Grid {
    pub grid: Vec<Vec<char>>
}

impl Grid {
    pub fn new(width: usize, height: usize, fill_char: char) -> Grid {
        let grid = vec![vec![fill_char; width]; height];

        return Grid {grid: grid};
    }

    pub fn get_positions_where<T: Fn(&char) -> bool>(&self, predicate: T) -> Vec<Position> {
        let mut fragment_positions = Vec::<Position>::new();

        for (row_number, row) in self.grid.iter().enumerate() {
            for (column_number, cell) in row.iter().enumerate() {
                if predicate(cell) {
                    let cell_position: Position = Position::new(row_number, column_number);
                    fragment_positions.push(cell_position);
                }
            }
        }

        return fragment_positions;
    }

    pub fn get_surrounding_positions(&self, position: &Position) -> Vec<Position> {
        let mut surrounding_positions = Vec::<Position>::new();

        if position.row > 0 {
            surrounding_positions.push(Position::new(position.row - 1, position.column));
        }

        if position.row < self.grid.len() - 1 {
            surrounding_positions.push(Position::new(position.row + 1, position.column));
        }

        if position.column > 0 {
            surrounding_positions.push(Position::new(position.row, position.column - 1));
        }

        if position.column < self.grid[0].len() - 1 {
            surrounding_positions.push(Position::new(position.row, position.column + 1));
        }

        return surrounding_positions;
    }

    pub fn set_position(&mut self, p: &Position, value: char){
        self.grid[p.row][p.column] = value;
    }

    pub fn get_value_at_position(&self, p: &Position) -> char {
        return self.grid[p.row][p.column];
    }
}