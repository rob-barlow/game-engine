pub mod converter {
    use crate::maze::Maze;
    use crate::position::Position;

    pub fn to_binary_vec(maze: &Maze) -> Vec<Vec<u8>> {
        let mut maze_array = vec![vec![1; (2 * maze.width) + 1]; (2 * maze.height) + 1];
        
        for column_number in 0..maze.width {
            for row_number in 0..maze.height {
                let current_position: Position = Position::new(row_number, column_number);
                let iteration_grid_cell: char = maze.iteration_grid.get_value_at_position(&current_position);
                
                maze_array[(2 * row_number) + 1][(2 * column_number) + 1] = maze_char_to_number(&iteration_grid_cell);

                if row_number < maze.height - 1 {
                    let vertical_path_cell = maze.vertical_pathways.get_value_at_position(&current_position);
                    maze_array[2 * (row_number + 1)][ (2 * column_number) + 1] = maze_char_to_number(&vertical_path_cell);
                }

                if column_number < maze.width - 1 {
                    let horizontal_path_cell = maze.horizontal_pathways.get_value_at_position(&current_position);
                    maze_array[(2 * row_number) + 1][2 * (column_number + 1)] = maze_char_to_number(&horizontal_path_cell);
                }
            }
        }

        return maze_array;
    }

    pub fn to_human_readable(maze: &Maze) -> String {
        let binary_vec = to_binary_vec(maze);

        let maze_string: String = binary_vec
            .iter()
            .map(|row| row.iter().map(|cell_number| format!("{} ", maze_number_to_readable_char(cell_number))).collect())
            .collect::<Vec<String>>()
            .join("\n");

        return maze_string;
    }

    fn maze_char_to_number(value: &char) -> u8 {
        // 0 = space, 1 = wall, 2 = start, 3 = end
        match value {
            ' ' => return 1,
            'A' => return 2,
            'Z' => return 3,
            _ => return 0,
        }
    }

    fn maze_number_to_readable_char(value: &u8) -> char {
        match value {
            0 => return ' ',
            2 => return 'A',
            3 => return 'Z',
            _ => return '#',
        }
    }
}