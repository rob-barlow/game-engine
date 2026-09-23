use super::grid::Grid;
use super::position::Position;
use rand::prelude::*;
use rand::SeedableRng;
 
pub struct Maze {
    pub width: usize,
    pub height: usize,
    pub iteration_grid: Grid,
    pub horizontal_pathways: Grid,
    pub vertical_pathways: Grid,
    rng: StdRng,
    seed: [u8; 32],
}

impl Maze {
    pub fn new(width: usize, height: usize) -> Maze {
        let mut seed: <StdRng as SeedableRng>::Seed = Default::default();
        rand::rng().fill(&mut seed);

        let rng = StdRng::from_seed(seed);
        
        let mut maze = Maze {
            width: width,
            height: height,
            iteration_grid: Grid::new(width, height, 'O'),
            horizontal_pathways: Grid::new(width - 1, height, ' '),
            vertical_pathways: Grid::new(width, height - 1, ' '),
            rng: rng,
            seed: seed,
        };

        let start_position = Position::new((height - 1)/2, 0);
        let end_position = Position::new((height - 1)/2, width - 1);
        maze.update_to_maze_piece(&start_position, 'A');
        maze.iteration_grid.set_position(&end_position, 'Z');

        return maze;
    }

    pub fn generate(&mut self){
        let mut maze_generated = false;
        while !maze_generated {
            maze_generated = !self.iterate();
        }
    }

    pub fn iterate(&mut self) -> bool {
        let fragment_positions = self.iteration_grid.get_positions_where(|val| *val == 'F');
        
        if fragment_positions.len() == 0 {
            let finish_position = self.iteration_grid.get_positions_where(|val| *val == 'Z');
            self.connect_to_surrounding_maze_piece(&(finish_position.first().unwrap()));
            return false;
        }

        let chosen_fragment_position = fragment_positions.choose(&mut self.rng).unwrap();
        self.update_to_maze_piece(chosen_fragment_position, 'X');
        self.connect_to_surrounding_maze_piece(chosen_fragment_position);

        return true;
    }

    pub fn update_to_maze_piece(&mut self, position: &Position, value: char) {
        self.iteration_grid.set_position(position, value);

        let surrounding_positions: Vec<Position> = self.iteration_grid
            .get_surrounding_positions(position)
            .into_iter()
            .filter(|position| self.iteration_grid.get_value_at_position(&position) == 'O')
            .collect::<Vec<Position>>();

        for new_fragment_position in  surrounding_positions {
            self.iteration_grid.set_position(&new_fragment_position, 'F');
        }
    }

    pub fn connect_to_surrounding_maze_piece(&mut self, position: &Position){
        let surrounding_maze_positions: Vec<Position> = self.iteration_grid
            .get_surrounding_positions(position)
            .into_iter()
            .filter(|position| self.iteration_grid.get_value_at_position(&position) == 'X' 
            || self.iteration_grid.get_value_at_position(&position) == 'A')
            .collect::<Vec<Position>>();
            
        let connected_maze_position = surrounding_maze_positions.choose(&mut self.rng).unwrap();

        self.add_pathway(position, connected_maze_position);
    }

    pub fn add_pathway(&mut self, p1: &Position, p2: &Position){
        if p1.column == p2.column {
            let top_position: &Position = if p1.row > p2.row {p2} else {p1};
            self.vertical_pathways.set_position(top_position, '|');
        }
        else {
            let left_position: &Position = if p1.column > p2.column {p2} else {p1};
            self.horizontal_pathways.set_position(left_position, '-');
        }
    }

    pub fn get_seed(&self) -> [u8; 32] {
        return self.seed;
    }
}